+++
banner = "/uploads/2020/03/bypass-gpos.png"
date = "2020-03-29T14:50:00+00:00"
excerpt = "GPO Bypass is a tool focused in helping bypass Group Policy enforced configurations..."
title = "GPO Bypass"
repository = "https://github.com/serializingme/gpo-bypass"

+++

This utility allows you to bypass Group Policy enforced controls on Firefox (as an example), especifically, it allows you to still install add-ons even if disabled through GPOs. This tool only supports 64 bit versions of Firefox.

<!--more-->

The proof of concept include a static link library for the common code, a executable, and a dynamic linked library.

## Injector

Executable responsible for injecting the library into a newly created target process.

## Library

Dynamic Link Library responsible for spoofing the Windows Registry APIs results.

## Building

All code is written in C and can be built with MinGW. For the source code and more information on compiling check the links bellow for the related posts and repository.
