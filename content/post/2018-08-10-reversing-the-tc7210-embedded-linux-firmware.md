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

{{< youtube class="ratio ratio-16x9 mb-3" id="1GAb1iIEseg" >}}

In a previous [article][1], I explained how to get `root` on the embedded Linux part of the TC7210 router by leveraging a remote code execution (RCE). With that level of access, I was able to image the various flash partitions of the router. The first thing I tried was to use `binwalk` to identify what files may be contained in the images.

```shell {linenos=inline}
#!/bin/bash
ls -l
# total 132416
# -rw-r--r-- 1 501 dialout    65536 Jul 25  2017 mtd0.img
# -rw-r--r-- 1 501 dialout 33423360 Jul 25  2017 mtd10.img
# -rw-r--r-- 1 501 dialout   131072 Jul 25  2017 mtd1.img
# -rw-r--r-- 1 501 dialout   262144 Jul 25  2017 mtd2.img
# -rw-r--r-- 1 501 dialout  1048576 Jul 25  2017 mtd3.img
# -rw-r--r-- 1 501 dialout   393216 Jul 25  2017 mtd4.img
# -rw-r--r-- 1 501 dialout 16777216 Jul 25  2017 mtd5.img
# -rw-r--r-- 1 501 dialout 16777216 Jul 25  2017 mtd6.img
# -rw-r--r-- 1 501 dialout  8257536 Jul 25  2017 mtd7.img
# -rw-r--r-- 1 501 dialout 46006272 Jul 25  2017 mtd8.img
# -rw-r--r-- 1 501 dialout 12451840 Jul 25  2017 mtd9.img

binwalk mtd8.img mtd10.img
#
# Scan Time:     2018-08-09 14:52:38
# Target File:   /mnt/hgfs/Temporary/tc7210/mtd8.img
# MD5 Checksum:  09a51282fcc93a2f0fd02736e0e0f313
# Signatures:    344
#
# DECIMAL       HEXADECIMAL     DESCRIPTION
# --------------------------------------------------------------------------------
# 0             0x0             UBI erase count header, version: 1, EC: 0x2, VID header offset: 0x800, data offset: 0x1000
#
#
# Scan Time:     2018-08-09 14:52:42
# Target File:   /mnt/hgfs/Temporary/tc7210/mtd10.img
# MD5 Checksum:  b78fa525eba4d388a9aeb74db578b189
# Signatures:    344
#
# DECIMAL       HEXADECIMAL     DESCRIPTION
# --------------------------------------------------------------------------------
# 0             0x0             UBI erase count header, version: 1, EC: 0x2, VID header offset: 0x800, data offset: 0x1000
```

The partitions `mtd8.img` and `mtd10.img` appear to have a valid UBIFS file system on them. Using [ubidump][2] it is possible to extract the file system. First, we download the tool repository and then setup a virtual Python environment to where the tool dependencies are installed.

```shell {linenos=inline}
#!/bin/bash
git clone https://github.com/nlitsme/ubidump.git
# Cloning into 'ubidump'...
# remote: Counting objects: 53, done.
# remote: Total 53 (delta 0), reused 0 (delta 0), pack-reused 53
# Unpacking objects: 100% (53/53), done.

virtualenv .tc7210-env
# Running virtualenv with interpreter /usr/bin/python2
# New python executable in /mnt/hgfs/Temporary/tc7210/.tc7210-env/bin/python2
# Also creating executable in /mnt/hgfs/Temporary/tc7210/.tc7210-env/bin/python
# Installing setuptools, pkg_resources, pip, wheel...done.

. .tc7210-env/bin/activate

pip install -r ubidump/requirements.txt
# Collecting python-lzo>=1.11 (from -r ubidump/requirements.txt (line 1))
# Collecting crcmod>=1.7 (from -r ubidump/requirements.txt (line 2))
# Installing collected packages: python-lzo, crcmod
# Successfully installed crcmod-1.7 python-lzo-1.12
```

The next step is to extract the file system of both images.

```shell {linenos=inline}
#!/bin/bash
python ubidump/ubidump.py -s . mtd8.img mtd10.img
# ==> mtd8.img <==
# 1 named volumes found, 2 physical volumes, blocksize=0x20000
# == volume linuxapps ==
# saved 75 files
# ==> mtd10.img <==
# 1 named volumes found, 2 physical volumes, blocksize=0x20000
# == volume rootfs ==
# saved 173 files
```

This creates two directories, `rootfs` and `linuxapps`. The first contains the root file system and the second ancillary applications and files. From this point onwards, it is possible to read configuration files, reverse engineer executables, libraries, etc.

```shell {linenos=inline}
#!/bin/bash
ls -l linuxapps/ rootfs/
# linuxapps/:
# total 2
# drwxr-xr-x 1 501 dialout 256 Aug  9 17:16 CVS
# -rw-r--r-- 1 501 dialout 306 Aug  9 17:16 readme.txt
# drwxr-xr-x 1 501 dialout 128 Aug  9 17:16 usr
# -rw-r--r-- 1 501 dialout 184 Aug  9 17:16 version.txt
#
# rootfs/:
# total 5
# drwxr-xr-x 1 501 dialout  768 Aug  9 17:16 bin
# drwxr-xr-x 1 501 dialout  256 Aug  9 17:16 CVS
# drwxr-xr-x 1 501 dialout  960 Aug  9 17:16 etc
# drwxr-xr-x 1 501 dialout 1568 Aug  9 17:16 lib
# drwxr-xr-x 1 501 dialout  224 Aug  9 17:16 sbin
```

After this, I wanted to see if I could run the executables using QEMU (similar to what I did when reversing the [ArubaOS][3]). To do that, I needed to confirm the processor architecture of the executables, copy the respective statically linked QEMU executable to the `rootfs` directory and then use the `chroot` command.

```shell {linenos=inline}
#!/bin/bash
file rootfs/bin/busybox
# rootfs/bin/busybox: ELF 32-bit MSB executable, MIPS, MIPS32 version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped

which qemu-mips-static
# /usr/bin/qemu-mips-static

cp /usr/bin/qemu-mips-static rootfs/

sudo chroot rootfs/ ./qemu-mips-static /bin/busybox
# Error while loading /bin/busybox: Permission denied

ls -l rootfs/bin/
# total 8684
# -rw-r--r-- 1 501 dialout   39964 Aug  9 17:16 brctl
# -rw-r--r-- 1 501 dialout  526180 Aug  9 17:16 busybox
# -rw-r--r-- 1 501 dialout   61640 Aug  9 17:16 ebtables
# -rw-r--r-- 1 501 dialout  210764 Aug  9 17:16 ip
# -rw-r--r-- 1 501 dialout    7808 Aug  9 17:16 lxginit
# -rw-r--r-- 1 501 dialout   14876 Aug  9 17:16 mscapp
# -rw-r--r-- 1 501 dialout 1219244 Aug  9 17:16 nmbd
# -rw-r--r-- 1 501 dialout  154140 Aug  9 17:16 ntfs-3g
# -rw-r--r-- 1 501 dialout   24200 Aug  9 17:16 ntfslabel
# -rw-r--r-- 1 501 dialout   14204 Aug  9 17:16 portmap
# -rw-r--r-- 1 501 dialout   18988 Aug  9 17:16 remoteapi
# -rw-r--r-- 1 501 dialout    4612 Aug  9 17:16 rmtshutdown
# -rw-r--r-- 1 501 dialout    4924 Aug  9 17:16 rpc_test_client
# -rw-r--r-- 1 501 dialout    5408 Aug  9 17:16 rpc_test_service
# -rw-r--r-- 1 501 dialout    4444 Aug  9 17:16 setappsver
# -rw-r--r-- 1 501 dialout  114004 Aug  9 17:16 smbapp
# -rw-r--r-- 1 501 dialout 3900616 Aug  9 17:16 smbd
# -rw-r--r-- 1 501 dialout 2203476 Aug  9 17:16 smbpasswd
# -rw-r--r-- 1 501 dialout  242844 Aug  9 17:16 tc
# -rw-r--r-- 1 501 dialout   37716 Aug  9 17:16 ubimkvol
# -rw-r--r-- 1 501 dialout   39748 Aug  9 17:16 ubinfo
# -rw-r--r-- 1 501 dialout   35344 Aug  9 17:16 ubirmvol

chmod +x rootfs/bin/*

sudo chroot rootfs/ ./qemu-mips-static /bin/busybox
# BusyBox v1.19.3 (2015-03-04 13:37:03 CST) multi-call binary.
# Copyright (C) 1998-2011 Erik Andersen, Rob Landley, Denys Vlasenko
# and others. Licensed under GPLv2.
# See source distribution for full notice.
#
# Usage: busybox [function] [arguments]...
#    or: busybox --list[-full]
#    or: function [arguments]...
#
# 	BusyBox is a multi-call binary that combines many common Unix
#	utilities into a single executable.  Most people will create a
#	link to busybox for each function they wish to use and BusyBox
#	will act like whatever it was invoked as.
#
# Currently defined functions:
#	[, [[, arp, arping, ash, awk, basename, cat, chgrp, chmod, chown,
#	chroot, cp, cttyhack, cut, date, dd, deluser, df, dmesg, echo, egrep,
#	expr, false, fgrep, find, flash_eraseall, free, fsync, ftpd, ftpget,
#	getty, grep, halt, hexdump, httpd, ifconfig, inetd, init, insmod, ip,
#	kill, killall, klogd, less, linuxrc, ln, logger, login, ls, lsmod,
#	lsusb, mkdir, mknod, mount, mv, netstat, od, passwd, pidof, ping,
#	ping6, poweroff, ps, pwd, reboot, rm, rmdir, rmmod, route, sed, sh,
#	sleep, start-stop-daemon, sync, sysctl, syslogd, tail, tar, tcpsvd,
#	telnetd, test, tftp, time, top, true, tty, udhcpc, umount, uname,
#	uptime, vconfig, vi, which, whoami, xargs, zcip
```

Next, I tried to run the `smbapp` (the executable that was [previously][4] identified as the one responsible for managing the NAS file sharing functionality). After fixing some of the errors, I was also successful :D

```shell {linenos=inline}
#!/bin/bash
sudo chroot rootfs/ ./qemu-mips-static /bin/smbapp
# NAS: Network Attached Storage Control Application [Version 1.3 Build Mar  4 2015 13:42:04]
# found 0 USB devices
# NAS: Will retry bind in 15 seconds
# Launching mscapp
# MSC: Media Server Control Application [Version 1.2 Build Mar  4 2015 13:42:04]
# MSC: waiting for data on port UDP 49181
# Fatal Error: unable to open /var/tmp/smbapp_hotplug_fifo

sudo chroot rootfs/ ./qemu-mips-static /bin/busybox mkdir -p /var/tmp

sudo chroot rootfs/ ./qemu-mips-static /bin/busybox sh
#
#
# BusyBox v1.19.3 (2015-03-04 13:37:03 CST) built-in shell (ash)
# Enter 'help' for a list of built-in commands.
#
# ${debian_chroot:+($debian_chroot)}:/# busybox echo ""> /var/tmp/smbapp_hotplug_fifo
# ${debian_chroot:+($debian_chroot)}:/# exit

sudo chroot rootfs/ ./qemu-mips-static /bin/smbapp
# NAS: Network Attached Storage Control Application [Version 1.3 Build Mar  4 2015 13:42:04]
# found 0 USB devices
# NAS: Will retry bind in 15 seconds
# Launching mscapp
# SmbApp: waiting on port 49182 to recvfrom...
# MSC: Media Server Control Application [Version 1.2 Build Mar  4 2015 13:42:04]
# MSC: waiting for data on port UDP 49181
# smbapp: sigterm_handler(): Caught signal(2)
# smbapp: shuting down child processes
# umounting all USB devices
# pid 3756 terminated by a signal 2
# smbapp: mscapp pid 3756 exit status 0
# smbapp: closing the socket to ecos
```

The ability to run the executables makes the reverse engineering and vulnerability finding process a lot easier. In upcoming posts, I will detail how I found and exploited some yet to be released vulnerabilities. Cheers :)

[1]: /2018/06/03/rooting-the-technicolor-7210/ "Rooting the Technicolor 7210"
[2]: https://github.com/nlitsme/ubidump
[3]: /2015/06/02/reversing-arubaos-firmware/ "Reversing ArubaOS Firmware"
[4]: /2018/06/03/rooting-the-technicolor-7210/ "Rooting the Technicolor 7210"
