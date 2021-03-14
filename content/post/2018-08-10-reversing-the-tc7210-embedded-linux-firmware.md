+++
banner = "/uploads/2018/08/technicolor-loves-linux.png"
categories = [ "Linux", "Hardware Hacking", "Reverse Engineering" ]
date = "2018-09-30T15:00:00+00:00"
excerpt = "How to reverse the TC7210 Linux firmware and how to run extracted executables in QEMU..."
format = "post"
tags = [ "Technicolor", "QEMU", "SOHO" ]
title = "Reversing the TC7210 Embedded Linux Firmware"

+++

In this article I will explain how to reverse the firmware of the embedded Linux part of the Technicolor (TC) 7210 router by leveraging the usual tools of the trade.

<!--more-->

{{< youtube class="embed-responsive embed-responsive-16by9 mb-3" id="1GAb1iIEseg" >}}

In a previous [article][1], I explained how to get `root` on the embedded Linux part of the TC7210 router by leveraging a remote code execution (RCE). With that level of access, I was able to image the various flash partitions of the router. The first thing I tried was to use `binwalk` to identify what files may be contained in the images.

{{< gist serializingme 97ac2fe9f8f5b54b399202581f240095 "binwalk.sh" >}}

The partitions `mtd8.img` and `mtd10.img` appear to have a valid UBIFS file system on them. Using [ubidump][2] it is possible to extract the file system. First, we download the tool repository and then setup a virtual Python environment to where the tool dependencies are installed.

{{< gist serializingme 97ac2fe9f8f5b54b399202581f240095 "virtualenv.sh" >}}

The next step is to extract the file system of both images.

{{< gist serializingme 97ac2fe9f8f5b54b399202581f240095 "ubidump.sh" >}}

This creates two directories, `rootfs` and `linuxapps`. The first contains the root file system and the second ancillary applications and files. From this point onwards, it is possible to read configuration files, reverse engineer executables, libraries, etc.

{{< gist serializingme 97ac2fe9f8f5b54b399202581f240095 "rootfs-linuxapps.sh" >}}

After this, I wanted to see if I could run the executables using QEMU (similar to what I did when reversing the [ArubaOS][3]). To do that, I needed to confirm the processor architecture of the executables, copy the respective statically linked QEMU executable to the `rootfs` directory and then use the `chroot` command.

{{< gist serializingme 97ac2fe9f8f5b54b399202581f240095 "chroot.sh" >}}

Next, I tried to run the `smbapp` (the executable that was [previously][4] identified as the one responsible for managing the NAS file sharing functionality). After fixing some of the errors, I was also successful :D

{{< gist serializingme 97ac2fe9f8f5b54b399202581f240095 "smbapp.sh" >}}

The ability to run the executables makes the reverse engineering and vulnerability finding process a lot easier. In upcoming posts, I will detail how I found and exploited some yet to be released vulnerabilities. Cheers :)

[1]: /2018/06/03/rooting-the-technicolor-7210/ "Rooting the Technicolor 7210"
[2]: https://github.com/nlitsme/ubidump
[3]: /2015/06/02/reversing-arubaos-firmware/ "Reversing ArubaOS Firmware"
[4]: /2018/06/03/rooting-the-technicolor-7210/ "Rooting the Technicolor 7210"
