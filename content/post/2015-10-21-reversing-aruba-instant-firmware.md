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

{{< alert >}}This article was authorized by Aruba Networks and is based in the work done in the scope of Aruba's Bugcrowd bug bounty. Once <a href="https://www.serializing.me/2015/06/02/reversing-arubaos-firmware/">again</a>, thanks to Aruba Networks for their open approach to security researchers work.{{< /alert >}}

As usual, the initial step is to check what the firmware image contains, `binwalk` was used for that.

{{< gist serializingme 050cc30b187d6bf05afd "initial-binwalk.sh" >}}

This firmware image looks like a standard U-Boot image. The next step is to extract the header and then the body of the image.

{{< gist serializingme 050cc30b187d6bf05afd "extract-first-doll.sh" >}}

Checking the previously extracted image body reveals a matryoshka doll. Same process is followed as for the initial image file, extract the image header and afterwards, the body.

{{< gist serializingme 050cc30b187d6bf05afd "extract-second-doll.sh" >}}

Checking the new U-Boot image body with `file` and `binwalk`, reveals that the extracted file is the bootable image. This image contains another interesting and compressed file.

{{< gist serializingme 050cc30b187d6bf05afd "another-doll.sh" >}}

When this file is extracted and decompressed, the final matryoshka doll is revealed (the one containing the file system).

{{< gist serializingme 050cc30b187d6bf05afd "extract-third-doll.sh" >}}

The final matryoshka doll is a *LZMA* compressed *cpio* file.

{{< gist serializingme 050cc30b187d6bf05afd "final-doll.sh" >}}

Extract the file and decompress it with *7-Zip*.

{{< gist serializingme 050cc30b187d6bf05afd "extract-forth-doll.sh" >}}

The last step, is to assemble everything in order to mimic the appliance running file system layout.

{{< gist serializingme 050cc30b187d6bf05afd "recreate-rootfs.sh" >}}

{{< alert >}}There will be some errors reproducing the `/dev`, `/proc` and `/sys` directories but those can be ignored.{{< /alert >}}

And that's it, the running access point file system is ready to go under the microscope :)
