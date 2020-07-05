+++
banner = "/uploads/2015/04/ifup-local.png"
categories = [ "Configuration", "IDPS", "Linux", "Network" ]
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

{{< gist serializingme 26fb76f39b475465398f "create-ifup-local.sh" >}}

Follows the contents of the script that I use.

{{< alert class="warning" >}}The name of the interrupts for the network card may vary, and it may support more or less offloading features, adjust accordingly.{{< /alert >}}

{{< gist serializingme 26fb76f39b475465398f "ifup-local" >}}

After a reboot, to verify if the configurations have been applied correctly (the system used in this example as 8 CPU's) issue the following commands.

{{< alert class="warning" >}}The network interface used in the commands bellow is **eth1**, change accordingly.{{< /alert >}}

{{< gist serializingme 26fb76f39b475465398f "verify-results.sh" >}}

Happy tuning!
