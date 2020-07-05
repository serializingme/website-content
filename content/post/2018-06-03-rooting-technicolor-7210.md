+++
banner = "/uploads/2018/06/technicolor-got-root.png"
categories = [ "Exploit", "Linux", "Network", "Reverse Engineering" ]
date = "2018-06-03T11:20:00+00:00"
excerpt = "In this article, I will explain how to partially gained root access in a Technicolor 7210..."
format = "post"
tags = [ "Technicolor", "Passwords", "SOHO" ]
title = "Rooting the Technicolor 7210"

[[timeline]]
id = "disclosure"
title = "Disclosure Timeline"

[[disclosure]]
id = "F"
title = "30 days"
start = "2016-12-02"
end = "2017-01-02"
type = "background"
className = "bg-first text-dark"

[[disclosure]]
id = "S"
title = "60 days"
start = "2017-01-02"
end = "2017-02-02"
type = "background"
className = "bg-second text-dark"

[[disclosure]]
id = "T"
title = "90 days"
start = "2017-02-02"
end = "2017-03-02"
type = "background"
className = "bg-third text-dark"

[[disclosure]]
id = 1
title = "First reported issues to Ziggo"
start = "2016-12-02"

[[disclosure]]
id = 2
title = "Asked for an update"
start = "2016-12-09"

[[disclosure]]
id = 3
title = "Ziggo confirmed issues"
content = "Received reply confirming the bugs, and that the first and third bug were already fixed in next modem firmware. I confirmed the dates for coordinated disclosure, and agreed to test the beta of the new firmware"
start = "2016-12-12"

[[disclosure]]
id = 4
title = "Beta firmware ready"
content = "Received information that the beta firmware was ready"
start = "2016-12-16"

[[disclosure]]
id = 5
title = "Firmware malfunction"
content = "Installed the beta firmware but the modem malfunctioned"
start = "2016-12-17"

[[disclosure]]
id = 6
title = "Malfunction fixed"
content = "The malfunction was fixed and I was able to confirm that the third bug (RCE) had been fixed while the two first bugs hadn't."
start = "2016-12-19"

[[disclosure]]
id = 7
title = "Asked for an update"
start = "2017-01-17"

[[disclosure]]
id = 8
title = "Received update"
content = "Received update \"(...) issues are logged by Technicolor and will be further investigated and will be resolved in the final release. (...) A broad indication  will be Q1 2017. As soon as we have news we come back to you, you hear nothing remember us please\""
start = "2017-02-01"

[[disclosure]]
id = 9
title = "Requested firmware to be reverted"
content = "Requested the router to be reverted to the latest stable version"
start = "2017-02-07"

[[disclosure]]
id = 10
title = "Firmware was reverted"
content = "Modem reverted back to the original firmware"
start = "2017-02-08"

[[disclosure]]
id = 11
title = "Asked for an update"
content = "Asked for an update on  and explained that the details were going to be released as more than six months had passed, got no reply"
start = "2017-08-08"

[[disclosure]]
id = 12
title = "Public release"
content = "Released details through this blog post"
start = "2018-06-03"

[[disclosure]]
id = 13
title = "Technicolor reached out"
content = "Technicolor contacted me requesting further assurance that the bugs had been properly fixed and to contact them as well for future bugs I might find."
start = "2018-06-04"

[[disclosure]]
id = 14
title = "Ziggo reached out"
content = "Ziggo contacted me requesting further assurance that the bugs had been properly fixed and apologized for not responding"
start = "2018-06-04"
+++

The Technicolor 7210 home router is a powerful little device. It provides 1Gbps Ethernet, dual-band wireless for speeds ranging from 300Mbps to 1300Mbps, and Network Attached Storage (NAS) for file sharing and media streaming.

<!--more-->

{{< alert >}}I was able to confirm that two of the bugs (path transversal and remote code execution) highlighted in this blog post have been fixed by Technicolor. The other bug (weak credentials) I'm unable to validate as it depends on the remote code execution. Disclosure timeline can be found at the end of the blog post.{{< /alert >}}

### The Basic Principle

To get `root` in any network appliance, the first step is to get remote code execution (RCE). Getting RCE isn't the same as getting `root` access, but it does happen, since there is a tendency in network appliances to run everything in the context of the `root` user.

If that isn't the case and the commands executed are under the context of an unprivileged user, the next step after obtaining RCE is to find a way to escalate privileges. Usually that can be done by leveraging badly configured permissions, kernel exploits, etc.

{{< html >}}
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>One of the first place to start looking for RCE, is in the diagnostic functionalities of the appliance. Network appliances usually offer (at least) <code>ping</code> based diagnostic functionality. In the case of the TC7210, it offers <code>ping</code> and <code>ftp</code>. As such, that was where I focused my initial efforts.</p>
    <p>After checking both diagnostic pages and failing miserably, I decided to go back to basics by looking for known vulnerabilities in the software stack of the router.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2018/06/tc7210-ping-functionality.png" alternative="Ping diagnostic page" caption="The router ping diagnostic page." thumbnail="/uploads/2018/06/tc7210-ping-functionality-300x175.png" >}}
  </div>
</div>
{{< /html >}}

### What To Try Next

Scanning the router IP address didn't yield interesting results but on the other hand, scanning the IP address attributed to the NAS functionality proved to be a lot more interesting.

{{< gist serializingme a97cfa316006d352c9f9c7ff32e9ab90 "nmap-port-scan.sh" >}}

Samba is a software that provides file and printer sharing using SMB/CIFS protocol. It has become a very important component to integrate Linux/Unix based systems into Windows based environments. Samba has had its fair share of vulnerabilities, so I decided to investigate it further.

{{< gist serializingme a97cfa316006d352c9f9c7ff32e9ab90 "nmap-samba-scan.sh" >}}

It was possible to discover that the router uses Samba in its version 3.0.37. This version is vulnerable to [CVE-2010-0926][1]. This vulnerability happens because the default configuration of `smbd`, allows a remote authenticated user to leverage directory traversals to access arbitrary files. To do that the user only needs to create a symbolic link (i.e. shortcut) on a writable share.

### Exploiting The Flaw

After connecting a USB drive in the router and configuring a file share called `test`, I connected using the `smbclient` utility and by using its `symlink` command to create a symbolic link to the root directory I was able to confirm that the NAS Samba installation is indeed vulnerable.

{{< gist serializingme a97cfa316006d352c9f9c7ff32e9ab90 "smbclient-browse.sh" >}}

I proceeded to download the entire file system. One thing that I noticed, was that the file system didn't contain any file related with the router web management interface (e.g. images, web pages, etc.) I assumed that was related with the fact that the user context in which the `smbd` daemon was running didn't have the permission to access those files.

### Weak Credentials

Not lingering too much on that, I decided to investigate what credentials I could find on the file system dump. As can be seen bellow, it was quite easy to crack the passwords found, they are quite simple and reused across all user accounts.

{{< gist serializingme a97cfa316006d352c9f9c7ff32e9ab90 "cracking-passwords.sh" >}}

The next step was to focus on the binaries present on the file system. The following binaries seemed interesting (i.e. not Busybox related): `mscapp`, `smbapp`, `setappsver`, `remoteapi`, `rpc_test_client` and `rpc_test_server`.

### The Holly Grail

From all the strings dumped from these binaries, the string `(echo %s; echo %s) |/bin/smbpasswd -as admin` stood out. Taking into account the name of the application that contained it, `smbapp`, it was clear that this binary is the one that is used to manage the NAS file sharing functionality.

Breaking down the commands in that string we have:

* At least the first `%s` must be replaced by a password.
* This password is then echoed to the output.
* That output is then piped to the `smbpasswd` command.
* The `smbpasswd` comand changes the Samba `admin` user password with the one supplied.

If no filtering is involved, replacing `%s` with a user supplied password (very high probability of this happening) makes this functionality vulnerable to command injection by using the `$(<insert command to run>)` vector. To test if this was true, I navigated to the web page that allows a user to change the Samba administrator user password and submitted in both password fields the `$(/usr/sbin/telnetd &)` string.

{{< figure image="/uploads/2018/06/tc7210-smb-passwd-functionality.png" alternative="Changing administrator password" caption="Changing the file share administrator password." >}}

After submiting the form, I was able to confirm that the functionality is indeed vulnerable to RCE as the connection using a Telnet client was successful and the credentials found before (i.e. user `root` and password `broadcom`) were valid.

{{< gist serializingme a97cfa316006d352c9f9c7ff32e9ab90 "connect-telnet.sh" >}}

### Conclusions

Rummaging through the file system once again, I was unable to find any files related with the router management web interface (very strange since now I was connected with the `root` user).

After searching the Internet for answers, I found out that the TC7210 is a dual Operative System (OS) network appliance. For the network functionality, it uses the eCos real-time OS, and for the NAS functionality, it uses an embedded Linux based OS. I was able to get `root` access on the latter.

{{< gist serializingme a97cfa316006d352c9f9c7ff32e9ab90 "investigating.sh" >}}

I was quite suprised at the specifications of the NAS part of the router. With the CPU it boasts amount of available memory and storage, there is the possibility to run some more software on it (e.g. VPN, Torrent, etc.) If one is wiling to [cross-compile][2] them.

Hope this has been interesting and insightful!

[1]: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2010-0926 "CVE-2010-0926"
[2]: https://github.com/tch-opensrc/ "Technicolor open source repository for TC7210/TC7230 models"
