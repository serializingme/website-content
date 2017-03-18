+++
banner = "/uploads/2015/06/emofishes-row.png"
date = "2015-06-26T09:48:54+00:00"
excerpt = "Emofishes is a collection of proof of concepts that help improve, bypass or detect virtualized malware execution environments..."
title = "Emofishes"
repository = "https://github.com/serializingme/emofishes"

+++

Collection of proof of concepts that help improve, bypass or detect virtualized malware execution environments.

<!--more-->

The proof of concepts include a static link library for the common code, Cufish (Curious Fish), and Nofish (Nosey Fish).

## Cufish

The environments used to perform behavioural analysis of malware need to be stealth, being able to avoid detection by malware is a must because it will spare the researcher or incident responder precious time in the analysis of the malware. Cufish aims to help with that, providing information about the execution environment that could be used to pre-emptively improve the sandbox and avoid detection by malware. Cufish leverage Windows Management Instrumentation (WMI) to obtain information about:

* Operating System
* Processor
* BIOS
* Hardware devices
* Partitions
* Environment variables
* Network connections and interfaces
* Peripherals
* Software

All the information collected is sent through a UDP socket, pointing to a local network IP address that is (most likely) different from any IP address that the sandboxes use (forcing the traffic to exit the virtual machine). In the sandboxes where downloading a packet capture is not possible, the only option is to check the output of the dependency walker.

## Nofish

Nosey Fish lists all directories and files of all the drives in a system. This as the objective of making it easier to inspect the file system contents of the virtual machines used to perform behavioural analysis. The directory and file listing collected are sent through a UDP socket as in Cufish.

## Building

All code is written in C and can be built with MinGW. For the source code and more information on compiling check the links bellow for the related posts and repository.
