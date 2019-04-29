+++
banner = "/uploads/2019/02/fireeye-knock-knock.png"
categories = [ "Malware", "Virtualization", "Windows", "Reverse Engineering" ]
date = "2019-02-27T12:00:00+00:00"
excerpt = "While researching malware execution sandboxes, I found a way to detect FireEye own Malware Protection System..."
format = "post"
tags = [ "FireEye", "Emofishes" ]
title = "It's Me, FireEye!"

[[timeline]]
id = "F"
title = "30 days"
start = "2018-11-23"
end = "2018-12-23"
type = "background"
className = "bg-first text-dark"

[[timeline]]
id = "S"
title = "60 days"
start = "2018-12-23"
end = "2019-01-23"
type = "background"
className = "bg-second text-dark"

[[timeline]]
id = "T"
title = "90 days"
start = "2019-01-23"
end = "2019-02-23"
type = "background"
className = "bg-third text-dark"

[[timeline]]
id = "E"
title = "+4 days"
start = "2019-02-23"
end = "2019-02-27"
type = "background"
className = "bg-forth text-dark"

[[timeline]]
id = 1
title = "Reported to FireEye"
start = "2018-11-23"

[[timeline]]
id = 2
title = "FireEye acknowledged report"
content = "FireEye acknowledged the report and deployed a content update to fix it. I asked if it was ok to publish the post."
start = "2018-11-26"

[[timeline]]
id = 3
title = "Grace period extension"
content = "FireEye's research and engineering team took a closer look into the reported issue and asked for a 90 days grace period to implement additional protections. I extended the grace period 4 days, giving FireEye exaclty 90 days starting from November 27<sup>th</sup>, instead of the date of first reporting the issue (November 23<sup>rd</sup>)."
start = "2018-11-27"

[[timeline]]
id = 4
title = "Reminded FireEye"
content = "Reminded FireEye that the grace period would be over in a month."
start = "2019-01-27"

[[timeline]]
id = 5
title = "FireEye on schedule"
content = "FireEye will release a version with additional protections for this type of evasion on February, 20<sup>th</sup> and they're ok with the public release after this date. I will follow the original public release schedule giving extra time for FireEye's customers to update."
start = "2019-01-30"

[[timeline]]
id = 6
title = "Customer adoption"
content = "FireEye contacted me letting me know that the customer adoption of the new version has been good so far."
start = "2019-02-26"

[[timeline]]
id = 7
title = "Public release"
content = "Released details through this blog post (94 days after reporting it)"
start = "2019-02-27"

+++

A little over three years ago, while researching malware execution [sandboxes][1], I found a stealth way to detect FireEye's Malware Analysis System (MAS). In this blog post I will release the details.

<!--more-->

{{< alert >}}This blog post was originally written in November 24<sup>th</sup>, 2018. The issue reported in this blog post, as been fixed by FireEye. I'm not able to validate the purported fix since I no longer have access to any FireEye sandbox.{{< /alert >}}

While investigation various Open Source and commercial malware execution sandboxes I developed a tool called [Curious Fish][2] (Cufish for short). This tool focused on extracting as much environmental information as possible in order to facilitate the process of fingerprinting these sandboxes.

One such sandbox is FireEye own Malware Protection System (MPS) in its multiple iterations (e.g., Web MPS, Email MPS, etc.) While going through the output of the Cufish tool I found that it made use of a driver called `firemon`.

{{< figure image="/uploads/2019/02/cufish-dump.png" alternative="Cufish Dump" caption="Cufish dump showing the existence of the driver." thumbnail="/uploads/2019/02/cufish-dump-500x313.png" >}}

This looked very interesting and since the details provided by Cufish where quite scarce I used [Nosey Fish][3] (Nofish for short, and previously called Infish) to see if I could locate the driver in the file system.

{{< figure image="/uploads/2019/02/nofish-dump.png" alternative="Cufish Dump" caption="Nofish dump showing the path of the interesting driver." thumbnail="/uploads/2019/02/nofish-dump-500x313.png" >}}

While the sandbox, at the time, didn't allow users to download random files / artefacts from the environment, I developed a small utility ([Extrovert Fish][1], Exfish for short) to send the driver file over the network. Chunks of the file are encoded in Base64 and  sent over a UDP socket. The only thing left to do was to download the network packet capture from the sandbox and extract the driver from it.

{{< figure image="/uploads/2019/02/exfish-dump.png" alternative="Exfish Dump" caption="Dump showing part of the base64 driver." thumbnail="/uploads/2019/02/exfish-dump-500x313.png" >}}

With the driver outside the sandbox, I was able to conclude two things. The first was that accessing (opening and reading) the `firemon.sys` triggered a malicious activity alert related with sandbox evasion / detection.

{{< alert class="warning" >}}If I remember correctly, not fully certain anymore, it wasn't just the YARA rule that detected Exfish tool reading the monitoring driver file.{{< /alert >}}

{{< figure image="/uploads/2019/02/mps-report.png" alternative="Cufish Dump" caption="FireEye MPS report." >}}

The second was that the driver was indeed responsible for monitoring the system for activity (e.g., opening files, deleting files, etc.) as it implements a file system filter driver and injects a DLL in all processes (with some exceptions) using the APC method.

That got me thinking, how could I check if the file existed without triggering such alerts? After some experimentation I decided to give the `FindFirstFile` Windows API a try. If it didn't make use of system calls, it would most likely be stealth in such a way the sandbox won't tag it as malicious.

{{< gist serializingme add1c6e6e24cb775785800c22b8f14d9 "fetest.c" >}}

With this idea in mind, I developed another small utility that did just that. Suffice to say it was successful! The driver could be detected and not a single alert was triggered :D

[1]: /project/emofishes/ "Emofishes Project"
[2]: /2015/06/12/curious-fish-is-curious/ "Curious Fish Is Curious Post"
[3]: /2015/06/26/emotional-fishes-are-emotional/ "Emotional Fishes Are Emotional Post"
