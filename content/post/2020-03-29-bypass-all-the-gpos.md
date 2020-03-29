+++
banner = "/uploads/2020/03/bypass-gpos.png"
categories = [ "Windows", "Exploit", "Reverse Engineering" ]
date = "2020-03-29T14:50:00+00:00"
excerpt = "How to make an application ignore Group Policies enforced configurations..."
format = "post"
tags = [ "Group Policy Objects", "Active Directory", "Code Injection", "Hook Functions", "GPO Bypass" ]
title = "Bypass All The GPOs"

+++

During a red team engagement, one has landed on a machine with the need to make an application "ignore" Group Policies enforced configurations. This application runs on the context of the user but the settings are only changeable with administrative privileges and without access to a highly privileged account how can one make the application ignore these settings?

<!--more-->

{{< youtube class="embed-responsive embed-responsive-16by9 mb-3" id="1cvCmF-YnZo" >}}

### Introduction

Active Directory (AD) Group Policy Objects (GPOs) is the standard way of managing user and computer / machine accounts configurations on a Windows based environment. Most GPOs have Registry settings that the client needs to apply  to the Windows Registry keys / values on the user and machine hives respectively.

{{< figure image="/uploads/2020/03/group-policy-management.png" alternative="Group Policy Management" caption="The Group Policy Management editor." thumbnail="/uploads/2020/03/group-policy-management-500x285.png" >}}

GPOs are disseminated to devices through AD's Lightweight Directory Access Protocol (LDAP) and Server Message Block (SMB) shares. 

### Registry, Library Injection, and Function Hooks

The Windows Registry hive keys and values, with the exception of those with badly configured access control lists, are only changeable by a user with administrative privileges. This enables the enforcement of configurations. However, if the application is running under the context of the user one  can potentially change what the application reads from the Registry hives.

With this in mind, I choose a simple scenario: enabling the installation of Firefox add-ons when it is disabled by GPO. To do this, I developed a proof of concept that changes the values read from the Registry by Firefox. The proof of concept is divided in two components:
- Injector, responsible for injecting the library into Firefox.
- Library, responsible for spoofing the Registry values Firefox reads.

The proof of concept execution sequence is illustrated below.

{{< figure image="/uploads/2020/03/proof-of-concept-sequence.png" alternative="Group Policy Management" caption="Proof of concept execution sequence." >}}

The library is injected using the `CreateRemoteThread` mechanism on a newly created Firefox process. Upon being injected the library detours three functions using Import Address Table (IAT) hooks: `CreateProcess`, injects the library into Firefox child processes; `RegOpenKeyExW`, tracks which registry keys Firefox is trying to open; and `RegQueryValueExW`, spoofs the Registry values Firefox is trying to read. The spoofed Registry keys / values are as follows:
- In key `HKLM\SOFTWARE\Policies\Mozilla\Firefox`
    - Ensures the returned value for `BlockAboutAddons` is `0` (zero).
- In key `HKLM\SOFTWARE\Policies\Mozilla\Firefox\InstallAddonsPermission`
    - Ensures the returned value for `Default` is `1` (one),

Cheers :D
