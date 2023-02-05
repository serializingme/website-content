+++
banner = "/uploads/2015/05/suricata-config.png"
categories = [ "Configuration", "Linux", "Network" ]
date = "2015-05-12T20:59:57+00:00"
excerpt = "Adding a full featured IDPS solution, is a good step in protecting not only that \"all too many times vulnerable\" WordPress installation..."
format = "post"
tags = [ "LEMP", "Suricata", "WordPress" ]
title = "Protecting WordPress with Suricata"

+++

There aren't any silver bullets that will protect a WordPress installation against every single attack, but adding a full featured IDPS solution like Suricata, is a good step in protecting not only that "all too many times vulnerable" WordPress installation but also other services like SSH.

<!--more-->

Most WordPress installations are run as a single machine with a complete middleware stack from the web server down to the database. As such, what follows, is based on the following assumptions:

* Middleware stack is already installed, fully functional and based on LEMP
* OS is Enterprise Linux 7 based (minimum version for the Linux Kernel is 3.14)
* HTTP traffic is received using TLS
* Nftables user space tools are installed
* Suricata is already installed (minimum version is 2.1beta3)
* ETOpen rule set as been installed in order for Suricata to use it
* Everything is running in the same host
* The host is a dedicated server or a VPS

{{< alert class="warning" >}}There are some VPS's, mostly those based on OpenVZ, that will not allow for Kernel changes. Check with the current or future VPS provider before hand.{{< /alert >}}

The first step is to replace the location section of the server block that listens to HTTPS and passes the requests to PHP, in order to reverse proxy them instead.

```plaintext {linenos=inline}
# Replace the following
location ~ \.php$ {
  (...)
}

# With
location / {
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-Host $server_name;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_pass http://localhost;
}
```

{{< alert class="danger" >}}Do not use the `$host` variable in the header `X-Forwarded-Host` since its client/attacker controlled, possibly making your WordPress installation susceptible to host header poisoning. Use the `$server_name` variable instead.{{< /alert >}}

Next we need to configure Nginx to listen locally for the decrypted traffic and to pass it to PHP.

{{< alert class="warning" >}}The WordPress installation will need to be configured for a reverse proxy environment and paths may need to be adjusted depending on the reader specific WordPress installation.{{< /alert >}}

```plaintext {linenos=inline}
server {
  listen localhost:80 default_server;

  # WordPress installation root directory
  root /usr/share/nginx/html;

  # Index files
  index index.php;

  # Make nginx play nice with WordPress permanent links
  location / {
    try_files $uri $uri/ /index.php?$args;
  }

  # Pass the requests to PHP
  location ~ \.php$ {
    (...)
  }
}
```

After checking that the configuration is correct, restart Nginx. From this point onwards, there should be plain text HTTP traffic flowing to the socket listening locally (generate some traffic if needed). You can confirm this, by using `tcpdump`.

```shell {linenos=inline}
#!/bin/bash
tcpdump -i lo "port 80"
```

The next step is to configure Netfilter using Nftables, in order for it to send traffic to Suricata. To do that, create a file with the `rules` extension under `/etc/nftables/` directory.

{{< alert >}}If Nftables is already configured in the system, edit the existing rules by adding the IPS related chains with a priority lower than the ones used for the firewall (the higher the number the lower the priority).{{< /alert >}}

{{< alert class="warning" >}}The following configuration only takes into account IPv4, for IPv6 extra configurations will be needed.{{< /alert >}}

```plaintext {linenos=inline}
#!/usr/sbin/nft -f
table ip filter {
  # Firewall
  chain firewall-input {
    type filter hook input priority 0;
    (...)
  }
  chain firewall-output {
    type filter hook output priority 0;
    (...)
  }
  # IPS
  chain ips-input {
    type filter hook input priority 10;

    # Queue input packets to Suricata
    counter queue num 0-1 fanout, bypass
  }
  chain ips-output {
    type filter hook output priority 10;

    # Queue output packets to Suricata
    counter queue num 0-1 fanout, bypass
  }
}
```

{{< alert class="warning" >}}Make sure `firewalld` is disabled.{{< /alert >}}

After starting the Nftables service, the next step is to configure Suricata. First edit the main Suricata configuration file (`/etc/suricata/suricata.yaml`).

{{< alert >}}The Netfilter queue fail open setting may have performance impacts, be sure to read Suricata documentation on it.{{< /alert >}}
{{< alert class="warning" >}}The Suricata configurations, are for a host with two CPU's, as such, affinity settings and the number of queues that Suricata listens to may need to be adjusted.{{< /alert >}}

```yaml {linenos=inline}
# Activate workers run mode
runmode: workers

# Enable EVE logging with X-Forward-For support
- eve-log:
    enabled: yes
    # ...
    types:
      - alert:
          # ...
          xff:
            enabled: yes
            # Two operation modes are available, "extra-data" and "overwrite".
            mode: overwrite
            # Two proxy deployments are supported, "reverse" and "forward". In
            # a "reverse" deployment the IP address used is the last one, in a
            # "forward" deployment the first IP address is used.
            deployment: reverse
            # Header name where the actual IP address will be reported, if more
            # than one IP address is present, the last IP address will be the
            # one taken into consideration.
            header: X-Forwarded-For

# Disable Netfilter queue fail open
nfq:
  fail-open: no

# Configure CPU affinity
threading:
  # ...
  set-cpu-affinity: yes
  # Tune cpu affinity of suricata threads. Each family of threads can be bound
  # on specific CPUs.
  cpu-affinity:
    - management-cpu-set:
        cpu: [ 0, 1 ]  # include only these cpus in affinity settings
        mode: "balanced"
        prio:
          default: "high"
    # ...
    - detect-cpu-set:
        cpu: [ 0, 1 ]
        mode: "exclusive" # run detect threads in these cpus
        # Use explicitely 3 threads and don't compute number by using
        # detect-thread-ratio variable:
        # threads: 3
        prio:
          # low: [ 0 ]
          # medium: [ "1-2" ]
          # high: [ 3 ]
          default: "high"

# Edit the HOME_NET to contain the localhost address
vars:
  # ...
  address-groups:
    HOME_NET: "[127.0.0.1,(...)]"

# Edit the host OS policy to contain the localhost address
host-os-policy:
  # ...
  linux: [127.0.0.1]
```

Second, edit the system Suricata configuration file (`/etc/sysconfig/suricata`).

```shell {linenos=inline}
# Make Suricata listen for packets in the Netfilter queues
OPTIONS="-q 0 -q 1 "
```

After starting Suricata, check that everything worked out without errors and that packets are being received (check the `/var/log/suricata/stats.log` file). To test the installation, use the following SQLi vector.

```plaintext {linenos=inline}
https://external.domain/?p=')) UNION SELECT 1--
```

If everything worked as planned, Suricata should have created an entry in the EVE log (`/var/log/suricata/eve.json`) reporting the attack.

{{< alert >}}Configuring the ETOpen rule set can be easily done using *Oinkmaster*.{{< /alert >}}

The next step is to configure the rules to disable false positives:

* `2003508` - `ET WEB_SPECIFIC_APPS WordPress wp-login.php redirect_to credentials stealing attempt`
* `2012843` - `ET POLICY Cleartext WordPress Login`
* `2012998` - `ET WEB_SERVER PHP Possible https Local File Inclusion Attempt`
* `2013505` - `ET POLICY GNU\Linux YUM User-Agent Outbound likely related to package management`

And change some useful rules from `alert` to `drop`:

* `2001219` - `ET SCAN Potential SSH Scan`
* `2006546` - `ET SCAN LibSSH Based Frequent SSH Connections Likely BruteForce Attack`
* `2019876` - `ET SCAN SSH BruteForce Tool with fake PUTTY version`
* Every rule from:
  * `ciarmy.rules`
  * `compromised.rules`
  * `drop.rules`
  * `dshield.rules`
  * `emerging-web_server.rules`
  * `emerging-web_specific_apps.rules`

Restart Suricata and that's it. It's a good idea to update the rules every now and then so that Suricata can better protect WordPress :)
