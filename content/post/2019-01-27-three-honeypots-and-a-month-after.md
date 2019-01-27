+++
banner = "/uploads/2019/01/attackers-everywhere.png"
categories = [ "Network", "Reconnaissance", "Case Study" ]
date = "2019-01-27T11:30:00+00:00"
excerpt = "Three web based honeypots, 2967 different visitors after, an investigation on current web attacks ..."
format = "post"
tags = [ "Honeypot", "IVRE", "Suricata" ]
title = "Three Honeypots and a Month After"

+++

I deployed three web honeypots, one in Singapore, another in Australia and another one in France. I then leveraged [IVRE](1) and [Suricata](2) to investigate the visitors, and respective traffic they generated.

<!--more-->

In total, over a one month period, the three honeypots where accessed from 2967 different IP addresses. At the end of that period, only 1860 of those addresses responded to probes. The following images illustrate the geographic distribution of the (still live) visitors.

<div class="row">
  <div class="col-md-12 col-sm-12">
  {{< figure image="/static/uploads/2019/01/geolocation.svg" alternative="Visitors IP based location." caption="Visitors IP based location.">}}
  </div>
</div>
<div class="row">
  <div class="col-md-6 col-sm-12">
  {{< figure image="/static/uploads/2019/01/top-country.svg" alternative="Top originating countries." caption="Top 15 originating countries.">}}
  </div>
  <div class="col-md-6 col-sm-12">
  {{< figure image="/static/uploads/2019/01/top-city.svg" alternative="Top originating cities." caption="Top 15 originating cities.">}}
  </div>
</div>

Of these, 630 (315 already present in blacklists for spam) didn't appear to have any ports open. Most of them seem to be hosted from residential ISP's as illustrated in the figure bellow.

<div class="row justify-content-center">
  <div class="col-md-8 col-sm-6">
  {{< figure image="/static/uploads/2019/01/closed-ports-as.svg" alternative="Top 15 AS of attackers without open ports." caption="Top 15 AS of attackers without open ports.">}}
  </div>
</div>

The other 1230 attackers, with some exceptions (e.g., Ubuntu / Debian servers), are mostly compromised routers (e.g., MikroTik, Linksys), or IP cameras as indicated by the open ports and respective services.

<div class="row">
  <div class="col-md-6 col-sm-12">
  {{< figure image="/static/uploads/2019/01/top-open-ports.svg" alternative="Top 15 open ports." caption="Top 15 open ports.">}}
  </div>
  <div class="col-md-6 col-sm-12">
  {{< figure image="/static/uploads/2019/01/top-products.svg" alternative="Top 15 products." caption="Top 15 products.">}}
  </div>
</div>

Analysing the captured packets with Suricata ([ET Open](3) ruleset) it was possible to get an insight to the malicious visitors intentions. Follows a sorted list by number of occurrences of the signatures triggered by the captured traffic.

1. ZmEu scanner User-Agent Inbound
1. ThinkPHP RCE exploitation Attempt
1. Microsoft IIS Remote Code Execution (CVE-2017-7269)
1. MS Terminal Server Traffic on Non-standard Port
1. Nmap Scripting Engine User-Agent Detected (Nmap Scripting Engine)
1. DFind w00tw00t GET-Requests
1. Incoming Masscan detected
1. Suspicious Chmod Usage in URI
1. Incoming Basic Auth Base64 HTTP Password detected unencrypted
1. D-Link DSL-2750B - OS Command Injection
1. Possible Apache Struts OGNL Expression Injection (CVE-2017-5638)
1. AVTECH Unauthenticated Command Injection in DVR Devices
1. Microhard Systems 3G/4G Cellular Ethernet and Serial Gateway - Default Credentials
1. Suspected PHP Injection Attack (cmd=)
1. ColdFusion administrator access

{{< alert >}}To be noted that requests triggering the ZmEu scanner user-agent signature are related with phpMyAdmin exploitation attempts and I have purposely excluded SSH brute force attacks.{{< /alert >}}

There isn't anything new in the type of attacks being launched. All revolve around the same: Remote Code Execution (RCE) and credentials brute force. It's interesting to see that Apache Struts RCE's are being used quite a lot. There is a high probability that some of those non-router / IP camera systems where compromised by using such exploits.

Cheers :)

[1]: https://github.com/cea-sec/ivre "IVRE GitHub Project"
[2]: https://github.com/OISF/suricata "Suricata GitHub Project"
[3]: https://rules.emergingthreats.net "EmergingThreats Rules Repository"
