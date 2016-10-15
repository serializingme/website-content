+++
banner = "/uploads/2016/10/hpqpswd-decrypt.png"
categories = [ "Reverse Engineering", "Windows", "Encryption" ]
date = "2016-10-15T19:00:00+00:00"
excerpt = "Ever wondered how to decrypt HPQPswd encryped passwords? Here is how..."
format = "post"
tags = [ "BIOS", "HP", "CSharp", "Passwords", "HPQPswdD" ]
title = "HPQPswd Encrypted Passwords Decryption"

+++

Ever wondered how to decrypt HPQPswd encrypted passwords? So did I when, for the first time, I came across a strange file called `password.bin` with a magic value of `_HPPW12_`.

<!--more-->

It was easy to establish a link between this strange file and `HpqPswd.exe` as the `password.bin` file was accompanied by `BIOSConfigUtility64.exe` (an HP BIOS/UEFI configuration utility part of the HP System Software Manager). HP describes the HPQPswd utility as a utility that accepts a user entered password, encrypts the password and then stores it in a file for use by the BIOS.

After looking at the HPQPswd import table, it was clear that it was leveraging the Windows cryptographic API. By using [API Monitor][1] it was possible to trace how the utility uses the API (tested with "thispassword" as the password).

{{< gist serializingme c091d63170c0fe80b82379c66f5c7ff8 "api-monitor-trace.txt" >}}

Using the API Monitor memory editor on address `0x064f0918` (more information at [CryptImportKey][2] documentation) it was possible to obtain the byte array that contains the `PUBLICKEYSTRUC` blob header followed by the encryption key (this key is by itself, encrypted, but it can be used as is).

{{< gist serializingme c091d63170c0fe80b82379c66f5c7ff8 "publickeystruct-dump.txt" >}}

Mapping the above hexadecimal dump to the structure results in the following.

{{< gist serializingme c091d63170c0fe80b82379c66f5c7ff8 "publickeystruct-mapping.txt" >}}

This structure is followed by the length of the key `0x00000020` (starting at byte 9 of the hexadecimal dump) and the key itself (starting at byte 13). Now that the encryption key was obtained, the next step was to understand the format for the file that will store the encrypted password. Once again by using the API Monitor memory editor on address `0x0654be20` (more information at [CryptEncrypt][3] documentation) it was possible to obtain the test password in encrypted form. Follows the hexadecimal dump.

{{< gist serializingme c091d63170c0fe80b82379c66f5c7ff8 "encrypted-dump.txt" >}}

Looking at the resulting file hexadecimal dump.

{{< gist serializingme c091d63170c0fe80b82379c66f5c7ff8 "file-dump.txt" >}}

It was then possible to understand the file format:

* Magic value `_HPPW12_` (8 bytes)
* Length of the encrypted password 0x0020 (32 bytes)
* Encrypted password

With this information at hand, I created a small C# utility that is able to decrypt HPQPswd encrypted passwords. Suffice to say the decryption of the `password.bin` file was successful.

More information on the utility can be found in its [project page][4]. Hope it is helpful ;)

[1]: https://www.rohitab.com/apimonitor "API Monitor"
[2]: https://msdn.microsoft.com/en-us/library/windows/desktop/aa380207%28v=vs.85%29.aspx "CryptImportKey Function Documentation"
[3]: https://msdn.microsoft.com/en-us/library/windows/desktop/aa379924%28v=vs.85%29.aspx "CryptEncrypt Function Documentation"
[4]: /project/hpqpswdd/ "Project Page"
