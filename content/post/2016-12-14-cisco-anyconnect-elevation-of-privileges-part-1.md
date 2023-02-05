+++
banner = "/uploads/2016/12/cisco-anyconnect.png"
categories = [ "Exploit", "Network", "Reverse Engineering", "Windows", "CVE" ]
date = "2016-12-14T18:56:17+00:00"
excerpt = "How I discovered a Cisco AnyConnect elevation of privileges vulnerability part one..."
format = "post"
tags = [ "Cisco AnyConnect", "CAC IPC" ]
title = "AnyConnect Elevation of Privileges, Part 1"

+++

The Cisco AnyConnect (CAC) Secure Mobility Client doesn't have the brightest security track record. [CVE-2015-4211][1] and [CVE-2015-6305][2] are only two out of the fourteen CVEs that have been assigned to it just in 2015. This spiked my curiosity and prompted me to confirm if Cisco had properly fixed the underlying issue of these vulnerabilities.

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

```cpp {linenos=inline}
class CIpcMessage {
private:
    /* Offset 0x00 */ unsigned long idTag;
    /* Offset 0x04 */ unsigned short headerLength;
    /* Offset 0x06 */ unsigned short dataLength;
    /* Offset 0x08 */ IIpcResponseCB * ipcResponseCB;
    /* Offset 0x0c */ void * msgUserContext;
    /* Offset 0x10 */ unsigned long requestMsgId;
    /* Offset 0x14 */ void * returnIpcObject;
    /* Offset 0x18 */ unsigned char messageType;
    /* Offset 0x19 */ unsigned char messageId;

public:
    /**
     * 702d8a52:    mov eax, ecx
     * 702d8a54:    ret
     */
    unsigned char * getBuffer() {
        return (unsigned char *)this;
    }

    /**
     * 702db2c5:    xor eax, eax
     * 702db2c7:    cmp dword [ecx], 0x4353434f
     * 702db2cd:    setz al
     * 702db2d0:    ret
     */
    bool isIdTagValid() {
        return (this->idTag == 0x4353434f);
    }

    /**
     * 702db2d1:    movzx eax, word [ecx+0x6]
     * 702db2d5:    ret
     */
    unsigned int getDataLength() {
        return this->dataLength;
    }

    /**
     * 702db2d6:    movzx eax, byte [ecx+0x19]
     * 702db2da:    ret
     */
    unsigned char /*enum IPC_MESSAGE_ID*/ getMessageID() {
        return this->messageId;
    }

    /**
     * 702db2db:    movzx eax, byte [ecx+0x18]
     * 702db2df:    and eax, 0x1f
     * 702db2e2:    ret
     */
    unsigned char /*enum IPC_MESSAGE_TYPE*/ getMessageType() {
        return (this->messageType & 0x1F);
    }

    /**
     * 702db2e3:    xor eax, eax
     * 702db2e5:    test byte [ecx+0x18], 0x80
     * 702db2e9:    jnz 0x702db2f1
     * 702db2eb:    cmp [ecx+0x8], eax
     * 702db2ee:    jz 0x702db2f1
     * 702db2f0:    inc eax
     * 702db2f1:    ret
     */
    bool isRequestMessage() {
        return (!(this->messageType & 0x80) && this->ipcResponseCB != 0x00000000);
    }

    /**
     * 702db2f2:    movzx eax, byte [ecx+0x18]
     * 702db2f6:    shr eax, 0x7
     * 702db2f9:    ret
     */
    bool isResponseMessage() {
        return (this->messageType >> 7);
    }

    /**
     * 702db2fa:    mov eax, [ecx+0x8]
     * 702db2fd:    ret
     */
    IIpcResponseCB * getIpcResponseCB() {
        return this->ipcResponseCB;
    }

    /**
     * 702db2fe:    mov eax, [ecx+0xc]
     * 702db301:    ret
     */
    void * getMsgUserContext() {
        return this->msgUserContext;
    }

    /**
     * 702db302:    mov eax, [ecx+0x10]
     * 702db305:    ret
     */
    unsigned int getRequestMsgId() {
        return requestMsgId;
    }

    /**
     * 702db313:    mov eax, [ecx+0x14]
     * 702db316:    ret
     */
    void * getReturnIpcObject() {
        return this->returnIpcObject;
    }

    /**
     * 702db324:    movzx eax, word [ecx+0x4]
     * 702db328:    add eax, ecx
     * 702db32a:    ret
     */
    unsigned char * getDataBuffer() {
        return (unsigned char *)(this->headerLength + (unsigned long)this);
    }

    /**
     * 702db32b:    movzx eax, word [ecx+0x6]
     * 702db32f:    movzx ecx, word [ecx+0x4]
     * 702db333:    add eax, ecx
     * 702db335:    ret
     */
    unsigned int getLength() {
        return (this->dataLength + this->headerLength);
    }
}
```

Taking the network packet created by the Google POC into consideration, it was clear that these fields map one-to-one with the data sent to the socket.

{{< alert class="warning" >}}The Google POC uses a Global Unique Identifier (GUID) in place of the fields `ipcResponseCB`, `msgUserContext`, `requestMsgId`, and `returnIpcObject` which all combined have the same length as a GUID.{{< /alert >}}

In the next [part][5] of this article, I will focus on the packets being sent over the socket. Hope it was an interesting read :)

[1]: https://tools.cisco.com/security/center/viewAlert.x?alertId=39466 "CVE-2015-4211"
[2]: https://tools.cisco.com/security/center/viewAlert.x?alertId=41136 "CVE-2015-6305"
[3]: https://bugs.chromium.org/p/project-zero/issues/detail?id=460 "Cisco AnyConnect Secure Mobility Client v3.1.08009 Elevation of Privilege"
[4]: https://www.rohitab.com/apimonitor "API Monitor"
[5]: /2016/12/20/anyconnect-elevation-of-privileges-part-2/ "AnyConnect Elevation of Privileges, Part 2"
