+++
banner = "/uploads/2015/04/ifup-local.png"
categories = [ "Configuration", "Linux", "Network" ]
date = "2015-04-25T16:00:30+00:00"
excerpt = "After installing Suricata, some fine tuning of the network interface(s) used in the traffic capture is required to ensure the best performance of the new IDPS installation..."
format = "post"
tags = [ "Suricata" ]
title = "RX/TX Buffers, Flow Hash and Others on Boot"
url = "/2015/04/25/rxtx-buffers-rss-others-on-boot/"

+++

After installing Suricata, some fine tuning of the network interface(s) used in the traffic capture is required to ensure every ounce of performance is extracted from the new IDPS installation. Those configurations need to be persisted when the system is power cycled. To do that on a Enterprise Linux based OS (e.g. RedHat, CentOS, Fedora, etc.) one can leverage the `/sbin/ifup-local` script.

<!--more-->

This script is called per interface by the network configuration utility when the network is up and running (at least when using a static configuration). The performance oriented configurations that are usually needed are:

* Set the network card RX/TX buffers to the maximum that the hardware supports
* Balance the receive flow hash indirection table equally in all CPU's
* Set the receive network card and transmits IRQ affinity to one CPU each
* Turn off offloading features (only if using PF_RING, AF_PACKET or similar)

The kernel network stack can also be tuned using the `/sbin/ifup-local` script, however the recommended approach is to use a file under the `/etc/sysctl.d/` directory instead. The `ifup-local` file doesn't usually exist, so it needs to be created and made executable.

```shell {linenos=inline}
#!/bin/bash
# Create the file
touch /sbin/ifup-local

# Make it executable
chmod +x /sbin/ifup-local
```

Follows the contents of the script that I use.

{{< alert class="warning" >}}The name of the interrupts for the network card may vary, and it may support more or less offloading features, adjust accordingly.{{< /alert >}}

```shell {linenos=inline}
#!/bin/bash
set_buffers() {
    # Get the hardware RX/TX maximum and current
    PRESET=$(ethtool -g $1 | tr '\n' ' ' | sed 's/.*RX:\s\+\([0-9]\+\).*TX:\s\+\([0-9]\+\).*RX:\s\+\([0-9]\+\).*TX:\s\+\([0-9]\+\).*/\1 \2 \3 \4/g')

    # Set receive and trasmit buffers to the hardware maximum
    ethtool -G $1 rx $(echo $PRESET | cut -f 1 -d " ") tx $(echo $PRESET | cut -f 2 -d " ")
}

balance_flowhash() {
    # Balance evenly per CPU
    ethtool -X $1 equal $(cat /proc/cpuinfo | grep processor | wc -l)
}

set_affinity() {
    MAX=$(cat /proc/cpuinfo | grep processor | wc -l)

    # Since the receive/transmit interrupts name index starts at 0, subtract 1 from the maximum
    let "MAX=$MAX-1"

    # The mask that will define the affinity
    MASK=1

    for INDEX in $(seq 0 1 $MAX); do
        IRQ=$(cat /proc/interrupts | grep $1-rxtx-$INDEX"$" | sed 's/\s\([0-9]\+\)\(.*\)/\1/g')

        # Apply the mask to the current IRQ
        printf "%X" $MASK > /proc/irq/$IRQ/smp_affinity

        # Duplicate the next mask value
        let "MASK=$MASK+$MASK"
    done
}

turnoff_offloading() {
    ethtool -K $1 rx off
    ethtool -K $1 tx off
    ethtool -K $1 sg off
    ethtool -K $1 tso off
    ethtool -K $1 gso off
    ethtool -K $1 gro off
    ethtool -K $1 lro off
    ethtool -K $1 rxvlan off
    ethtool -K $1 txvlan off
    ethtool -K $1 rxhash off
}

case "$1" in
eth1)
    # Update the receive and transmit buffers
    set_buffers $1

    # Balance receive flow hash indirection table
    balance_flowhash $1

    # Set CPU affinity for the interrupts
    set_affinity $1

    # Offloading features
    turnoff_offloading $1
;;
esac

exit 0
```

After a reboot, to verify if the configurations have been applied correctly (the system used in this example as 8 CPU's) issue the following commands.

{{< alert class="warning" >}}The network interface used in the commands bellow is **eth1**, change accordingly.{{< /alert >}}

```shell {linenos=inline}
#!/bin/bash
# Verify the send and receive buffers, note how the current hardware values are the same as the pre-set maximum values
ethtool -g eth1
# Ring parameters for eth1:
# Pre-set maximums:
# RX:             4096
# RX Mini:        0
# RX Jumbo:       0
# TX:             4096
# Current hardware settings:
# RX:             4096
# RX Mini:        0
# RX Jumbo:       0
# TX:             4096

# Verify the flow hash indirection table
ethtool -x eth1
# RX flow hash indirection table for eth1 with 8 RX ring(s):
#     0:      0     1     2     3     4     5     6     7
#     8:      0     1     2     3     4     5     6     7
#    16:      0     1     2     3     4     5     6     7
#    24:      0     1     2     3     4     5     6     7

# Verify that the IRQ affinity is set correctly, the output bellow shows only the first 4 CPU's
cat /proc/interrupts | grep 'CPU\|eth1'
#            CPU0       CPU1       CPU2       CPU3   (...)
#  65:  107325835          0          3          0         eth1-rxtx-0
#  66:          0  150380495          0          2         eth1-rxtx-1
#  67:          0          0  107109972          0         eth1-rxtx-2
#  68:          0          0          0   91046195         eth1-rxtx-3
# (...)

# Verify that the offloading features are off
ethtool -k eth1
# Features for eth1:
# rx-checksumming: off
# tx-checksumming: off
#         tx-checksum-ipv4: off [fixed]
#         tx-checksum-ip-generic: off
#         tx-checksum-ipv6: off [fixed]
#         tx-checksum-fcoe-crc: off [fixed]
#         tx-checksum-sctp: off [fixed]
# scatter-gather: off
#         tx-scatter-gather: off
#         tx-scatter-gather-fraglist: off [fixed]
# tcp-segmentation-offload: off
#         tx-tcp-segmentation: off
#         tx-tcp-ecn-segmentation: off [fixed]
#         tx-tcp6-segmentation: off
# udp-fragmentation-offload: off [fixed]
# generic-segmentation-offload: off
# generic-receive-offload: off
# large-receive-offload: off
# rx-vlan-offload: off
# tx-vlan-offload: off
# (...)
```

Happy tuning!
