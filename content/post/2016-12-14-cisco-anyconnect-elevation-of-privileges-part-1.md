+++
banner = "/uploads/2016/12/cisco-anyconnect.png"
categories = [ "Exploit", "Network", "Reverse Engineering", "Windows", "CVE" ]
date = "2016-12-14T18:56:17+00:00"
excerpt = "How I discovered a Cisco AnyConnect elevation of privileges vulnerability part one..."
format = "post"
tags = [ "Cisco AnyConnect", "VPN", "TLS" ]
title = "AnyConnect Elevation of Privileges, Part 1"

+++

The Cisco AnyConnect (CAC) Secure Mobility Client doesn't have the brightest security track record. [CVE-2015-4211][1] and [CVE-2015-6305][2] are only two out of the fourteen CVEs that have been assigned to it just in 2015. This spiked my curiosity and prompted me to confirm if Cisco had properly fixed the underlying issue of these vulnerabilities.

[1]: https://tools.cisco.com/security/center/viewAlert.x?alertId=39466 "CVE-2015-4211"
[2]: https://tools.cisco.com/security/center/viewAlert.x?alertId=41136 "CVE-2015-6305"

<!--more-->

In this multi-part article, I will explain how I reverse engineered CAC (one of its binaries and a network protocol used by it) to understand how the vulnerable functionality worked and how it could be further exploited. From Google Project Zero [advisory][3] and respective proof of concept (POC) code, I learned that:

* A CAC related process is locally listening for commands on port `62522`.
* This process is running as `SYSTEM`.
* The vulnerability is related with a function called `launchDownloader`.
* The format of the network packets that trigger the vulnerability.
* The `vpndownloader.exe` binary is vulnerable to DLL planting.

Having a look at the current connections, it is possible to identify that the `vpnui.exe` process is connected to port `62522`, which is open by the `vpnagent.exe` process.

{{< figure image="/uploads/2016/12/cac-listen-sockets.png" alternative="Listening sockets" caption="Listening and connected sockets." thumbnail="/uploads/2016/12/cac-listen-sockets-600x315.png">}}

After attaching a debugger to the `vpnagent.exe` process and inspecting the assembly code for a while, it was possible to understand that the code that deals with the commands serialization into and from network packets is contained in the `vpncommon.dll` library. This library exported symbols shedded some light on the existing commands.

{{< figure image="/uploads/2016/12/cac-export-all-tlv.png" alternative="Available commands" caption="Available commands." thumbnail="/uploads/2016/12/cac-export-all-tlv-600x292.png">}}

The name of the exported symbols indicate that the protocol being used is based on a Type, Length and Value (TLV) structure and is used in a Inter-Process Communication (IPC) mechanism. One interesting TLV available is the `CLaunchClientAppTlv`.

{{< figure image="/uploads/2016/12/cac-export-launch-tlv.png" alternative="CLaunchClientAppTlv" caption="Exported symbols related with the CLaunchClientAppTlv class." thumbnail="/uploads/2016/12/cac-export-launch-tlv-600x292.png">}}

It seemed that this command is the one that was being used to exploit the vulnerabilities. Looking at the functions of the `CLaunchClientAppTlv` class, I noticed that one of the constructors receives as a parameter, a reference to an instance of a class called `CIpcMessage`. Once again the exported symbols of the `vpncommon.dll` library help understand what this class is all about.

{{< figure image="/uploads/2016/12/cac-export-message.png" alternative="IPC message class" caption="Exported symbols related with the CIpcMessage class." thumbnail="/uploads/2016/12/cac-export-message-600x292.png">}}

Reconstructing the class from the exported symbols undecorated name and by looking at the disassembled code of the get methods of the class, I was able to understand how the class fields are organized and the type of each field.

{{< gist serializingme 774a9be6223ddbef621a19508e696750 "CIpcMessage.h" >}}

Taking the network packet created by the Google POC into consideration, it was clear that these fields map one-to-one with the data sent to the socket.

{{< alert class="warning" >}}The Google POC uses a Global Unique Identifier (GUID) in place of the fields <code>ipcResponseCB</code>, <code>msgUserContext</code>, <code>requestMsgId</code>, and <code>returnIpcObject</code> which all combined have the same length as a GUID.{{< /alert >}}

In the next [part][5] of this article, I will focus on the packets being sent over the socket. Hope it was an interesting read :)

[3]: https://bugs.chromium.org/p/project-zero/issues/detail?id=460 "Cisco AnyConnect Secure Mobility Client v3.1.08009 Elevation of Privilege"
[4]: https://www.rohitab.com/apimonitor "API Monitor"
[5]: /2016/12/17/anyconnect-elevation-of-privileges-part-2/ "AnyConnect Elevation of Privileges, Part 2"
