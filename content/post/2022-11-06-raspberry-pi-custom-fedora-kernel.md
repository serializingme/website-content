+++
banner = "/uploads/2022/11/fedora-on-rpi.png"
categories = [ "Linux", "Configuration" ]
date = "2022-11-06T07:35:00+00:00"
excerpt = "How I went customizing a Fedora kernel running on a Raspberry Pi..."
format = "post"
tags = [ "Raspberry Pi", "USB" ]
title = "Raspberry Pi Custom Fedora Kernel"

+++

Over the years I have gotten very used to Red Hat Enterprise Linux (RHEL) type distributions, and have for a long time now selected Fedora as my default goto Linux distribution. However, I needed a specific driver that comes out of the box with Raspbian (Raspberry Pi's Debian based distribution), but does not come with Fedora. This post elaborates how to go about compiling a custom kernel on a Pi running Fedora.

<!--more-->

### Introduction
I have been tinkering with a project that involves transforming the Pi into a USB peripheral. To do so, one has to take advantage of a Linux feature, called USB gadget mode, that allows the Pi to act as an accessory when connected to a host. When enabling this mode of operation, the Pi will act as any other USB peripheral (e.g., Ethernet adapter, input device, etc.) while connected directly to a computer via a USB cable.

{{< alert class="information">}}The above mentioned feature requires hardware support. This support was initially added to the Pi Zero, and it does not work on earlier versions of the Pi.{{< /alert >}}

In my use case, I needed to make use of [Ethernet over USB][1]. While in Fedora, the driver that adds Communications Device Class (CDC) Ethernet Control Model (ECM) comes out of the box, the driver that adds Remote Network Drive Interface Specification (RNDIS) does not. As I will be connecting the Pi to a Windows host which does not support CDC-ECM, I will be making use of RNDIS (which is the Microsoft specific implementation.)

### Building
{{< alert class="information">}}The instructions that follow below assume one already has Fedora installed and running on the Pi, as well as Secure Shell (SSH) access to the Pi.{{< /alert >}}
{{< alert class="warning">}}Compiling the Linux kernel and creating the Red Hat Package Management files (RPMs) does take quite a lot of space, do recommend making use of an Secure Digital (SD) card of at least 32GB. Also note that the compilation in the Pi does take quite a while, Cross-Compiling may be an option if one is in a rush.{{< /alert >}}

Most of the instruction below are based on the excelent article in the Fedora's [Wiki][2].

{{< gist serializingme acf64c1f329910f33bf80e01264ba57e "build.sh" >}}

### Closing Words

From this point onwards the Pi should be running the custom Kernel with the added driver. Happy customizing!

[1]: https://en.wikipedia.org/wiki/Ethernet_over_USB "Ethernet Over USB"
[2]: https://fedoraproject.org/wiki/Building_a_custom_kernel "Building a Custom Kernel"
