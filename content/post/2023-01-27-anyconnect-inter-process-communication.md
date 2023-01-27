+++
banner = "/uploads/2023/01/cac-ipc-wireshark.png"
categories = [ "Network", "Reverse Engineering" ]
date = "2023-01-27T19:00:00+00:00"
excerpt = "Once more I did a deep dive into Cisco AnyConnect Inter-Process Communication protocol and this post presents the outcomes..."
format = "post"
tags = [ "Cisco AnyConnect", "CAC IPC" ]
title = "AnyConnect Inter-Process Communication"

+++

In my first deep dive into Cisco AnyConnect (CAC) Secure Mobility Client (see [AnyConnect Elevation of Privileges Part 1][1] and [Part 2][2]), I reversed engineered how CAC made use of a TCP based Inter-Process Communication (IPC) protocol. Based on that research, I found a Local Privilege Escalation (LPE) vulnerability (see [CVE-2016-9192][3] and the [proof-of-concept][4] code). Yorick Koster and Antoine Goichot followed suit, and using that research also found other vulnerabilities (see [CVE-2020-3153][5], [CVE-2020-3433][6], [CVE-2020-3434][7], and [CVE-2020-3435][8]). This post presents the results of my second deep dive, correcting some wrong conclusions about the protocol, further reverse engineering the various IPC messages, and providing some tools that can potentially aid further research.

<!--more-->

### A Primer and Two Corrections

First a small primer on how CAC communicates in between processes, namely `vpnagent.exe`, `vpndownloader.exe`, `vpnui.exe`, `vpncli.exe`, and potentially others. For example, the `vpnagent.exe` executable, when running starts listening at `127.0.0.1` on TCP port `62522`. It's on this port that it receives the various IPC messages sent by the other executables, for example `vpnui.exe`. The messages are based on a Type, Length and Value (TLV) structure and have the following format:

{{< gist serializingme 4206372a06b0bdbc9235eade959d72b7 "cac-ipc-header.h" >}}

This lead me to the conclusion that I wrongly reached at the time. The body part of the IPC messages is basically a list of TLVs (if any). My assumption was that the Type part of each TLV (the first 2 bytes), was composed of a native type, like string, integer, etc. (first byte) and an index (second byte). However that is not the case, the full 2 bytes simply refer to the type in the context of the IPC message being sent, for example a file path, or an IP address, and there is no index. This means that the Type value is reused in various messages even if having a different native type. As such a TLV is composed of:

{{< gist serializingme 4206372a06b0bdbc9235eade959d72b7 "cac-ipc-tlv.h" >}}

As seen above, there is another detail that I didn't fully understand properly at the time and that contributed to the type/index confusion. The TLV type can have a modifier, if the `type & 0x8000 == 0x8000` condition is true, then the entry in the body is no longer a TLV, but a Type and Value (TV) where the value always has 2 bytes length. The only usage I have seen for it, was for unsigned 2 bytes long integers, and boolean values as seen below.

{{< figure image="/uploads/2023/01/cac-ipc-use-installed.png" alternative="Type and Value entry example" caption="Use Installed of CLaunchClientAppTlv.">}}

### The Dissector

As part of this new deep dive, I have decided to create a Wireshark dissector that would allow one to easily understand packet captures. The various messages, twenty six (26) in total, have been implemented, as well as all the fields.

{{< figure image="/uploads/2023/01/cac-ipc-full-example.png" alternative="IPC message example" caption="Wireshark dissecting the CStateTlv message." thumbnail="/uploads/2023/01/cac-ipc-full-example-600x256.png">}}

The various fields can be used to filter the traffic. Follows some example fields:
- `cacipc.message_type`
- `cacipc.state.tunnel_state`
- `cacipc.certificateinfo.cert_auth_signature_base64`
- `cacipc.userauthentication.user_accepted_banner_result`

The dissector tries to match all the TCP packets sent on port `62522`, but also has a heuristic to find potential IPC messages not sent on that port. For example, `vpndownloader.exe` is sometimes launched listening for IPC messages on a random TCP port. In such cases, the dissector should detect any messages exchanged them and dissect the traffic as CAC's IPC.

### Packet Generator

While developing the dissector, I started to wonder how I could validate the various messages dissection. No packet capture I could create by just using CAC would have all the possible messages. As such, I decided to develop a packet generator. My first approach was to create a library (as in a `.lib` file) for the `vpncommon.dll`. That was the easy part, just a bit of `dumpbin` magic and that's it, well mostly it. 

The hard part was creating headers for each class, where the virtual address table properly matched the compiled version. After some failed attempts, I decided it was best to dynamically link against `vpncommon.dll` instead of statically linking. After many wrapper classes and same basic networking code had been developed, I had a shiny new packet generator that could generate all the IPC messages.

{{< figure image="/uploads/2023/01/cac-ipc-generator.png" alternative="Generator code" caption="Screenshot of a part of the packet generator code." thumbnail="/uploads/2023/01/cac-ipc-generator-600x362.png">}}

There are some caveats though. To use the IPC packet generator, one needs to have CAC installed as the utility requires the `vpncommon.dll` library to generate the messages. I cannot, or better, should not distribute this DLL (or any other that may be needed) as it would most likely violate the license agreement (yes, that one that everyone, including me, just scrolls through). The other is that the packets generated are syntactically correct, but for sure not are semantically correct. For example, there might be TLV entries, that cannot be present with other TLV entries even if the message supports them, or the TLV values themselves, like an integer that has a limited set of possible values, etc.

### Closing Thoughts

More information about the dissector and the packet generator can be found [here][9]. I sincerely hope this will be useful to anyone that embarks in a journey to further investigate Cisco AnyConnect :D


[1]: /2016/12/14/anyconnect-elevation-of-privileges-part-1/ "AnyConnect Elevation of Privileges, Part 1"
[2]: /2016/12/20/anyconnect-elevation-of-privileges-part-2/ "AnyConnect Elevation of Privileges, Part 2"
[3]: https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-20161207-anyconnect1 "CVE-2016-9192"
[4]: https://github.com/serializingme/cve-2016-9192 "CVE-2016-9192 Proof of Concept Repository"
[5]: https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-ac-win-path-traverse-qO4HWBsj "CVE-2020-3153"
[6]: https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-anyconnect-dll-F26WwJW "CVE-2020-3433"
[7]: https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-anyconnect-dos-feXq4tAV "CVE-2020-3434"
[8]: https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-anyconnect-profile-7u3PERKF "CVE-2020-3435"
[9]: /project/cac-ipc/ "CAC IPC Project"
