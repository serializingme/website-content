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

```c {linenos=inline}
CreateFileW ( ".\test.bin", GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_WRITE, 0x003eed68, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL )
CryptAcquireContextW ( 0x003eefc4, "HPQPswd2012", "Microsoft Enhanced RSA and AES Cryptographic Provider", PROV_RSA_AES, CRYPT_DELETEKEYSET )
CryptAcquireContextW ( 0x003eefc4, "HPQPswd2012", "Microsoft Enhanced RSA and AES Cryptographic Provider", PROV_RSA_AES, CRYPT_NEWKEYSET )
CryptImportKey ( 0x064f28a8, 0x064f0918, 44, NULL, 0, 0x003eeeec )
CryptEncrypt ( 0x0652d648, NULL, TRUE, 64, NULL, 0x003eeef0, 24 )
CryptEncrypt ( 0x0652d648, NULL, TRUE, 64, 0x0654be20, 0x003eeef0, 32 )
CryptDestroyKey ( 0x0652d648 )
WriteFile ( 0x000004d0, 0x0645abd0, 42, 0x003ed360, NULL )
CloseHandle ( 0x000004d0 )
CryptReleaseContext ( 0x064f28a8, 0 )
```

Using the API Monitor memory editor on address `0x064f0918` (more information at [CryptImportKey][2] documentation) it was possible to obtain the byte array that contains the `PUBLICKEYSTRUC` blob header followed by the encryption key (in this case the key is in plaintext, but even if it wasn't, it could be used as is).

```plaintext {linenos=inline}
0000  08 02 00 00 10 66 00 00  .....f..
0009  20 00 00 00 4a 14 b6 96   ...J...
0011  32 ff 83 6b 42 88 da 79  2..kB..y
0018  1c 0b d3 77 a5 49 ed 9d  .I.....w
0020  83 9f e2 d6 52 54 71 0c  ....RTq.
0024  3e bd 1e 33              >..3
```

Mapping the above hexadecimal dump to the structure results in the following.

```c {linenos=inline}
typedef struct _PUBLICKEYSTRUC {
  BYTE   bType;    // 0x08, PLAINTEXTKEYBLOB
  BYTE   bVersion; // 0x02, CUR_BLOB_VERSION
  WORD   reserved; // 0x0000
  ALG_ID aiKeyAlg; // 0x00006610, CALG_AES_256
} BLOBHEADER, PUBLICKEYSTRUC;
```

This structure is followed by the length of the key `0x00000020` (starting at byte 9 of the hexadecimal dump) and the key itself (starting at byte 13). Now that the encryption key was obtained, the next step was to understand the format for the file that will store the encrypted password. Once again by using the API Monitor memory editor on address `0x0654be20` (more information at [CryptEncrypt][3] documentation) it was possible to obtain the test password in encrypted form. Follows the hexadecimal dump.

```plaintext {linenos=inline}
0000  b8 c2 ba e2 2f c8 3a c1  ..../.:.
0009  0d ba 00 57 5a a9 e7 59  ...WZ..Y
0011  c9 f6 01 b3 e7 84 24 66  ......$f
0014  8c 22 b8 b0 74 d9 ff fe  ."..t...
```

Looking at the resulting file hexadecimal dump.

```plaintext {linenos=inline}
0000  5f 48 50 50 57 31 32 5f 20 00  _HPPW12_ .
000B  b8 c2 ba e2 2f c8 3a c1 0d ba  ..../.:...
0014  00 57 5a a9 e7 59 c9 f6 01 b3  .WZ..Y....
001E  e7 84 24 66 8c 22 b8 b0 74 d9  ..$f."..t.
0028  ff fe                          ..
```

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
