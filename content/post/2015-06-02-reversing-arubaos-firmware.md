+++
banner = "/uploads/2015/05/arubaos-login-page.png"
categories = [ "Bug Bounty", "Linux", "Reverse Engineering" ]
date = "2015-06-02T20:09:29+00:00"
excerpt = "How to extract all the files recreating an ArubaOS appliance running file system..."
format = "post"
tags = [ "Aruba Networks", "Bugcrowd", "QEMU" ]
title = "Reversing ArubaOS Firmware"

+++

{{< alert class="info" >}}This article was authorized by Aruba Networks and is based in the work done in the scope of Aruba's Bugcrowd bug bounty. There is not enough praise that can be given to Aruba Networks for their open approach to security researchers work.{{< /alert >}}

Some time ago, I had the chance to get my hands on a ArubaOS firmware, what follows is the full process to extract all the files recreating the appliance running file system. This had the objective of fuzzing the extracted binaries in QEMU (ArubaOS management console is CGI based).

<!--more-->

One of the best tools to start the reversing process is `binwalk`.

{{< gist serializingme faa288550922d0a2c9e1 "initial-binwalk.sh" >}}

After obtaining the list of possible files contained in the firmware and doing some analysis (trial and error) to find what files where valid, I started extracting the files from the end toward the beginning. To do that, first I got the firmware size in bytes using `du`.

{{< gist serializingme faa288550922d0a2c9e1 "check-size.sh" >}}

The first file to be extracted is a *7-zip* file that contains a `tar` archive using *LZMA* as the compression algorithm. This file contains the OS ancillary files. These files are always extracted during the boot process, this means that they are always restored from the active boot partition when the appliance starts, reverting any change they might have suffered. It's not clear to me why Aruba decided to do this, since the main OS files are loaded from the active boot partition to a *tmpfs*, meaning, that any change done to them will also be lost when the appliance shut downs. Maybe it makes it easier to update the firmware. To ensure persistence the only place one can write to is the *flash* partition or *nvram*. Using `dd` with a block size (`bs` parameter) of 512 bytes to accelerate the extraction and using the firmware size to calculate the `count` parameter.

{{< gist serializingme faa288550922d0a2c9e1 "extract-7zip.sh" >}}

Next, using the same block size as before with the difference that the `count` parameter is calculated based on the start offset of the previously extracted *7-zip* instead of the file size. The root file system is a *cpio* archive compressed with *LZMA*. Note that this is one of the few *LZMA* file entries reported by `binwalk` that make sense (the properties and uncompressed size of the file).

Next in line is the Linux Kernel and the ArubaOS firmware header (you can also obtain the Kernel configuration, by extracting the *Gzip* file at offset `4580088`).

{{< gist serializingme faa288550922d0a2c9e1 "extract-kernel.sh" >}}

Now that the image has been broken down in all of its components, the next step is to extract and uncompress the files to mimic the root file system of a running appliance. Started with the ancillary files.

{{< gist serializingme faa288550922d0a2c9e1 "extract-ancillary.sh" >}}

Next is the root file system.

{{< gist serializingme faa288550922d0a2c9e1 "decompress-cpio.sh" >}}

Now is time to assemble everything in order to mimic the appliance running file system layout.

{{% alert class="info" %}}There will be some errors reproducing the `/dev`, `/proc` and `/sys` directories but those can be ignored.{{% /alert %}}

And that's it. The firmware that I was investigating had binaries compiled for the NetLogic XLP processor, which is currently unsupported by QEMU. I had a look at QEMU in order to try and implement the missing instructions and, unfortunately, realized that I was out of my depth :D
