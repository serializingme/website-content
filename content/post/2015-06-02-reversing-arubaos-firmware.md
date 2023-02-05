+++
banner = "/uploads/2015/05/arubaos-login-page.png"
categories = [ "Bug Bounty", "Linux", "Reverse Engineering" ]
date = "2015-06-02T20:09:29+00:00"
excerpt = "How to extract all the files recreating an ArubaOS appliance running file system..."
format = "post"
tags = [ "Aruba Networks", "Bugcrowd", "QEMU" ]
title = "Reversing ArubaOS Firmware"

+++

Some time ago, I had the chance to get my hands on a ArubaOS firmware, what follows is the full process to extract all the files recreating the appliance running file system. This had the objective of fuzzing the extracted binaries in QEMU (ArubaOS management console is CGI based).

<!--more-->

{{< alert >}}This article was authorized by Aruba Networks and is based in the work done in the scope of Aruba's Bugcrowd bug bounty. There is not enough praise that can be given to Aruba Networks for their open approach to security researchers work.{{< /alert >}}

One of the best tools to start the reversing process is `binwalk`.

```shell {linenos=inline}
#!/bin/bash
binwalk sda1
#
#DECIMAL       HEXADECIMAL     DESCRIPTION
#--------------------------------------------------------------------------------
#512           0x200           ELF 64-bit MSB MIPS32 rel2 executable, MIPS, version 1 (SYSV)
#753977        0xB8139         LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 60671 bytes
#883225        0xD7A19         LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 48383 bytes
#1074729       0x106629        LZMA compressed data, properties: 0xA3, dictionary size: 1048576 bytes, uncompressed size: 11519 bytes
#1301281       0x13DB21        LZMA compressed data, properties: 0x64, dictionary size: 1048576 bytes, uncompressed size: 62719 bytes
#1502945       0x16EEE1        LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 43519 bytes
#2253521       0x2262D1        LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 49407 bytes
#3623569       0x374A91        LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 56063 bytes
#3633073       0x376FB1        LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 39935 bytes
#3706097       0x388CF1        LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 62719 bytes
#4456249       0x43FF39        LZMA compressed data, properties: 0xA2, dictionary size: 1048576 bytes, uncompressed size: 62719 bytes
#4580088       0x45E2F8        gzip compressed data, maximum compression, from Unix, last modified: Fri Mar 13 09:29:47 2015
#5149344       0x4E92A0        Copyright string: " (c) 2002-2015, Aruba Networks, Inc. Inc."
#5168431       0x4EDD2F        LBR archive data
#5176800       0x4EFDE0        Unix home path string: "/home/p4build/depot/margot/FCS6.4.X.0_49043/platform/os/linux-2"
#6233231       0x5F1C8F        LZMA compressed data, properties: 0x90, dictionary size: 16777216 bytes, uncompressed size: -1 bytes
#6310215       0x604947        LZMA compressed data, properties: 0xC0, dictionary size: 16777216 bytes, uncompressed size: 536870912 bytes
#6560019       0x641913        LZMA compressed data, properties: 0x66, dictionary size: 16777216 bytes, uncompressed size: -1 bytes
#6560051       0x641933        LZMA compressed data, properties: 0x66, dictionary size: 33554432 bytes, uncompressed size: -1 bytes
#6963712       0x6A4200        LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, uncompressed size: 63705600 bytes
#17338880      0x1089200       7-zip archive data, version 0.3
#78562685      0x4AEC57D       LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, missing uncompressed size
#83111829      0x4F42F95       POSIX tar archive (GNU), owner user name: "p4build", owner group name: "users"
```

After obtaining the list of possible files contained in the firmware and doing some analysis (trial and error) to find what files where valid, I started extracting the files from the end toward the beginning. To do that, first I got the firmware size in bytes using `du`.

```shell {linenos=inline}
#!/bin/bash
du sda1
#203288576 sda1
```

The first file to be extracted is a *7-zip* file that contains a `tar` archive using *LZMA* as the compression algorithm. This file contains the OS ancillary files. These files are always extracted during the boot process, this means that they are always restored from the active boot partition when the appliance starts, reverting any change they might have suffered. It's not clear to me why Aruba decided to do this, since the main OS files are loaded from the active boot partition to a *tmpfs*, meaning, that any change done to them will also be lost when the appliance shut downs. Maybe it makes it easier to update the firmware. To ensure persistence the only place one can write to is the *flash* partition or *nvram*. Using `dd` with a block size (`bs` parameter) of 512 bytes to accelerate the extraction and using the firmware size to calculate the `count` parameter.

```shell {linenos=inline}
#!/bin/bash
dd if=sda1 bs=512 skip=33865 count=363183 of=extracted.7z
#363183+0 records in
#363183+0 records out
#185949696 bytes (186 MB) copied, 2.13289 s, 87.2 MB/s
```

Next, using the same block size as before with the difference that the `count` parameter is calculated based on the start offset of the previously extracted *7-zip* instead of the file size. The root file system is a *cpio* archive compressed with *LZMA*. Note that this is one of the few *LZMA* file entries reported by `binwalk` that make sense (the properties and uncompressed size of the file).

Next in line is the Linux Kernel and the ArubaOS firmware header (you can also obtain the Kernel configuration, by extracting the *Gzip* file at offset `4580088`).

```shell {linenos=inline}
# Kernel
dd if=sda1 bs=512 skip=1 count=13600 of=extracted.img
#13600+0 records in
#13600+0 records out
#6963200 bytes (7.0 MB) copied, 0.0625107 s, 111 MB/s

# Firmware header
dd if=sda1 bs=512 count=1 of=extracted.header
#1+0 records in
#1+0 records out
#512 bytes (512 B) copied, 0.000256114 s, 2.0 MB/s
```

Now that the image has been broken down in all of its components, the next step is to extract and uncompress the files to mimic the root file system of a running appliance. Started with the ancillary files.

```shell {linenos=inline}
#!/bin/bash
p7zip -d extracted.7z
#
#7-Zip (A) [64] 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
#p7zip Version 9.20 (locale=en_GB.utf8,Utf16=on,HugeFiles=on,4 CPUs)
#
#Processing archive: extracted.7z
#
#Extracting  arubaos_corefs_files.tar
#
#Everything is Ok
#
#Size:       346839040
#Compressed: 185949696
```

Next is the root file system.

```shell {linenos=inline}
#!/bin/bash
p7zip -d rootfs.cpio.7z
#
#7-Zip (A) [64] 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
#p7zip Version 9.20 (locale=en_GB.utf8,Utf16=on,HugeFiles=on,4 CPUs)
#
#Processing archive: rootfs.cpio.7z
#
#Extracting  rootfs.cpio
#
#Everything is Ok
#
#Size:       63705600
#Compressed: 10375168
```

Now is time to assemble everything in order to mimic the appliance running file system layout.

{{< alert >}}There will be some errors reproducing the `/dev`, `/proc` and `/sys` directories but those can be ignored.{{< /alert >}}

And that's it. The firmware that I was investigating had binaries compiled for the NetLogic XLP processor, which is currently unsupported by QEMU. I had a look at QEMU in order to try and implement the missing instructions and, unfortunately, realized that I was out of my depth :D
