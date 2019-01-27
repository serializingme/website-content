+++
banner = "/uploads/2015/05/suricata-config.png"
categories = [ "Configuration", "IDPS", "Linux", "Network" ]
date = "2015-05-12T20:59:57+00:00"
excerpt = "Adding a full featured IDPS solution, is a good step in protecting not only that \"all too many times vulnerable\" WordPress installation..."
format = "post"
tags = [ "Enterprise Linux", "LEMP", "Suricata", "WordPress" ]
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

{{< gist serializingme 53526694f2876948d1af "reverse-proxy.conf" >}}

{{< alert class="danger" >}}Do not use the `$host` variable in the header `X-Forwarded-Host` since its client/attacker controlled, possibly making your WordPress installation susceptible to host header poisoning. Use the `$server_name` variable instead.{{< /alert >}}

Next we need to configure Nginx to listen locally for the decrypted traffic and to pass it to PHP.

{{< alert class="warning" >}}The WordPress installation will need to be configured for a reverse proxy environment.{{< /alert >}}
{{< alert class="warning" >}}Paths may need to be adjusted depending on the reader specific WordPress installation.{{< /alert >}}

{{< gist serializingme 53526694f2876948d1af "internal-server.conf" >}}

After checking that the configuration is correct, restart Nginx. From this point onwards, there should be plain text HTTP traffic flowing to the socket listening locally (generate some traffic if needed). You can confirm this, by using `tcpdump`.

{{< gist serializingme 53526694f2876948d1af "confirm-traffic.sh" >}}

The next step is to configure Netfilter using Nftables, in order for it to send traffic to Suricata. To do that, create a file with the `rules` extension under `/etc/nftables/` directory.

{{< alert >}}If Nftables is already configured in the system, edit the existing rules by adding the IPS related chains with a priority lower than the ones used for the firewall (the higher the number the lower the priority).{{< /alert >}}

{{< alert class="warning" >}}The following configuration only takes into account IPv4, for IPv6 extra configurations will be needed.{{< /alert >}}

{{< gist serializingme 53526694f2876948d1af "nftables.rules" >}}

{{< alert class="warning" >}}Make sure `firewalld` is disabled.{{< /alert >}}

After starting the Nftables service, the next step is to configure Suricata. First edit the main Suricata configuration file (`/etc/suricata/suricata.yaml`).

{{< alert >}}The Netfilter queue fail open setting may have performance impacts, be sure to read Suricata documentation on it.{{< /alert >}}
{{< alert class="warning" >}}The Suricata configurations, are for a host with two CPU's, as such, affinity settings and the number of queues that Suricata listens to may need to be adjusted.{{< /alert >}}

{{< gist serializingme 53526694f2876948d1af "suricata.yaml" >}}

Second, edit the system Suricata configuration file (`/etc/sysconfig/suricata`).

{{< gist serializingme 53526694f2876948d1af "suricata.conf" >}}

After starting Suricata, check that everything worked out without errors and that packets are being received (check the `/var/log/suricata/stats.log` file). To test the installation, use the following SQLi vector.

{{< gist serializingme 53526694f2876948d1af "sql-injection.txt" >}}

If everything worked as planned, Suricata should have created an entry in the EVE log (`/var/log/suricata/eve.json`) reporting the attack.

{{< alert >}}Configuring the ETOpen rule set can be easily done using *Oinkmaster*.{{< /alert >}}

The next step is to configure the rules to disable false positives:

* 2003508 - ET WEB\_SPECIFIC\_APPS WordPress wp-login.php redirect_to credentials stealing attempt
* 2012843 - ET POLICY Cleartext WordPress Login
* 2012998 - ET WEB_SERVER PHP Possible https Local File Inclusion Attempt
* 2013505 - ET POLICY GNU\Linux YUM User-Agent Outbound likely related to package management

And change some useful rules from `alert` to `drop`:

* 2001219 - ET SCAN Potential SSH Scan
* 2006546 - ET SCAN LibSSH Based Frequent SSH Connections Likely BruteForce Attack
* 2019876 - ET SCAN SSH BruteForce Tool with fake PUTTY version
* Every rule from:
  * ciarmy.rules
  * compromised.rules
  * drop.rules
  * dshield.rules
  * emerging-web_server.rules
  * emerging-web\_specific\_apps.rules

Restart Suricata and that's it. It's a good idea to update the rules every now and then so that Suricata can better protect WordPress :)
