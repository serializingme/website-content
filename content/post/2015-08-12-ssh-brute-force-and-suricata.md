+++
banner = "/uploads/2015/08/suricata-ssh-attacks.png"
categories = [ "IDPS", "Linux", "Network" ]
date = "2015-08-12T18:24:28+00:00"
excerpt = "Just a simple set of Suricata rules to stop the majority of SSH brute force attacks..."
format = "post"
tags = [ "Brute Force", "SSH", "Suricata" ]
title = "SSH Brute Force and Suricata"

+++

Since SSH is one of the most pervasive ways to manage servers remotely, it is also one of the most plagued by brute force attacks. What follows is a simple set of Suricata rules to stop the majority of SSH brute force attacks. It will drop connections based on the reported SSH client version.

<!--more-->

There are other more effective measures that can be implemented to block these type of attacks (two factor authentication, IP white list, etc.). Admittedly these rules won't stop the willing attacker, they will however stop the lazy one, that is looking for the low hanging fruit.

{{< alert >}}These rules are released under GPLv3.{{< /alert >}}
{{< alert class="warning" >}}The last three rules are commented out, they depend on the client used by the actual authorized users clients.{{< /alert >}}

{{< gist serializingme 8798a573b7c4f346fc67 "local.rules" >}}

Now, onto sleeping more easily at night ;)
