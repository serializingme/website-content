+++
banner = "/uploads/2015/10/arubaos-instant.png"
categories = [ "Bug Bounty", "Linux", "Reverse Engineering" ]
date = "2015-10-21T19:54:28+00:00"
excerpt = "How to extract all the files recreating an Aruba Instant appliance running file system..."
format = "post"
tags = [ "Aruba Networks", "Bugcrowd" ]
title = "Reversing Aruba Instant Firmware"

+++

Aruba produces two different software loads for their Access Point hardware. The first is called ArubaOS and the second is called Aruba Instant. With ArubaOS, the AP requires a Mobility Controller (hardware) to be installed in the network. With the Aruba Instant it is possible to run AP's independently (standalone mode) or in a cluster, with no Mobility Controller in the network.

What follows is the full process to extract all the files recreating the Aruba Instant firmware file system.

<!--more-->

{{< alert >}}This article was authorized by Aruba Networks and is based in the work done in the scope of Aruba's Bugcrowd bug bounty. Once [again](https://www.serializing.me/2015/06/02/reversing-arubaos-firmware/), thanks to Aruba Networks for their open approach to security researchers work.{{< /alert >}}

As usual, the initial step is to check what the firmware image contains, `binwalk` was used for that.

```shell {linenos=inline}
#!/bin/bash
binwalk image.bin
#
#DECIMAL       HEXADECIMAL     DESCRIPTION
#--------------------------------------------------------------------------------
#514           0x202           uImage header, header size: 64 bytes, header CRC: 0x26175460, created: Wed May 27 14:22:39 2015, image size: 10090700 bytes, Data Address: 0x80008000, Entry Point: 0x80008000, data CRC: 0x63E746B1, OS: Linux, CPU: ARM, image type: OS Kernel Image, compression type: none, image name: "Linux-2.6.35"
#7706          0x1E1A          LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, uncompressed size: -1 bytes
```

This firmware image looks like a standard U-Boot image. The next step is to extract the header and then the body of the image.

```shell {linenos=inline}
#!/bin/bash
# Extract the header
dd if=image.bin bs=514 count=1 of=image.header
#1+0 records in
#1+0 records out
#514 bytes (514 B) copied, 0.000580873 s, 885 kB/s

# Extract the body
tail -c+515 < image.bin > image.uimage
```

Checking the previously extracted image body reveals a matryoshka doll. Same process is followed as for the initial image file, extract the image header and afterwards, the body.

```shell {linenos=inline}
#!/bin/bash
# Verify the extracted file contents
binwalk image.uimage
#DECIMAL       HEXADECIMAL     DESCRIPTION
#--------------------------------------------------------------------------------
#0             0x0             uImage header, header size: 64 bytes, header CRC: 0x26175460, created: Wed May 27 14:22:39 2015, image size: 10090700 bytes, Data Address: 0x80008000, Entry Point: 0x80008000, data CRC: 0x63E746B1, OS: Linux, CPU: ARM, image type: OS Kernel Image, compression type: none, image name: "Linux-2.6.35"
#7192          0x1C18          LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, uncompressed size: -1 bytes

# Extract the header of the new U-Boot image
dd if=image.uimage bs=64 count=1 of=image.uimage.header
#1+0 records in
#1+0 records out
#64 bytes (64 B) copied, 0.00699276 s, 9.2 kB/s

# Extract the body of the new U-Boot image
tail -c+65 < image.uimage > image.uimage.data
```

Checking the new U-Boot image body with `file` and `binwalk`, reveals that the extracted file is the bootable image. This image contains another interesting and compressed file.

```shell {linenos=inline}
#!/bin/bash
file image.uimage.data
#image.uimage.data: Linux kernel ARM boot executable zImage (little-endian)

# Yet another compressed file is revealed
binwalk image.uimage.data
#
#DECIMAL       HEXADECIMAL     DESCRIPTION
#--------------------------------------------------------------------------------
#7128          0x1BD8          LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, uncompressed size: -1 bytes
```

When this file is extracted and decompressed, the final matryoshka doll is revealed (the one containing the file system).

```shell {linenos=inline}
#!/bin/bash
# Extract the header
dd if=image.uimage.data bs=1 count=7128 of=image.uimage.data.header

# Extract the compressed file
tail -c+7129 < image.uimage.data > image.uimage.data.compressed.lzma

# Decompress it
7z x image.uimage.data.compressed.lzma
#
#7-Zip 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
#p7zip Version 9.20 (locale=en_GB.UTF-8,Utf16=on,HugeFiles=on,2 CPUs)
#
#Processing archive: image.uimage.data.compressed.lzma
#
#Extracting  image.uimage.data.compressed
#
#Everything is Ok
#
#Size:       12220288
#Compressed: 10085616
```

The final matryoshka doll is a *LZMA* compressed *cpio* file.

```shell {linenos=inline}
#!/bin/bash
binwalk image.uimage.data.compressed
#
#DECIMAL       HEXADECIMAL     DESCRIPTION
#--------------------------------------------------------------------------------
#94208         0x17000         LZMA compressed data, properties: 0x5D, dictionary size: 33554432 bytes, uncompressed size: 34330624 bytes
#11455148      0xAECAAC        Copyright string: " (c) 2002-2015, Aruba Networks, Inc. Inc."
#11455868      0xAECD7C        ASCII cpio archive (SVR4 with no CRC), file name: "cate dir_entry buffer", file name length: "0xR!!!", file size: "0x>Initram"
#11462204      0xAEE63C        Unix home path string: "/home/p4build/depot/margot/IAP4.1.1.7_50209/aos-cmn/platform/os"
#12206595      0xBA4203        LZMA compressed data, properties: 0xC0, dictionary size: 524288 bytes, uncompressed size: 720896 bytes
```

Extract the file and decompress it with *7-Zip*.

```shell {linenos=inline}
#!/bin/bash
# Extract the file
tail -c+94209 < image.uimage.data.compressed > image.uimage.data.compressed.cpio.lzma

# Decompress it
7z x image.uimage.data.compressed.cpio.lzma
#
#7-Zip 9.20  Copyright (c) 1999-2010 Igor Pavlov  2010-11-18
#p7zip Version 9.20 (locale=en_GB.UTF-8,Utf16=on,HugeFiles=on,2 CPUs)
#
#Processing archive: image.uimage.data.compressed.cpio.lzma
#
#Extracting  image.uimage.data.compressed.cpio
#
#Everything is Ok
#
#Size:       34330624
#Compressed: 12126080
```

The last step, is to assemble everything in order to mimic the appliance running file system layout.

```shell {linenos=inline}
#!/bin/bash
# Create a new directory to hold the root file system
mkdir rootfs

# Extract the files
cd rootfs/
cpio --quiet -i --make-directories --preserve-modification-time --no-absolute-filenames -F ../image.uimage.data.compressed.cpio
#cpio: Removing leading `/' from member names
#cpio: dev/console: Cannot mknod: Operation not permitted
#cpio: dev/mem: Cannot mknod: Operation not permitted
#cpio: dev/ptmx: Cannot mknod: Operation not permitted
#cpio: dev/null: Cannot mknod: Operation not permitted
# (...)
```

{{< alert >}}There will be some errors reproducing the `/dev`, `/proc` and `/sys` directories but those can be ignored.{{< /alert >}}

And that's it, the running access point file system is ready to go under the microscope :)
