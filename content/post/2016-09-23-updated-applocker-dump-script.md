+++
banner = "/uploads/2016/09/powershell-dump-applocker.png"
categories = [ "Incident Response", "Windows" ]
date = "2016-09-23T20:33:00+00:00"
excerpt = "Updated the PowerShell script that dumps the current AppLocker policy..."
format = "post"
tags = [ "AppLocker", "Configuration", "PowerShell", "PowaScripts" ]
title = "Updated AppLocker Dump Script"

+++

I have created a new version of [this][1] script so that it is better aligned with the conventions I use for other PowerShell scripts.

[1]: /2015/11/01/inspecting-applocker-policy/ "Older Version"

<!--more-->

I have also created the [PowaScripts][2] project were I will publish PowerShell scripts that I use and that might be of public interest. Follows an example on how to invoke the cmdlet.

{{< gist serializingme e1b788a6e35b8345a6ffe7dd165e4530 "example.ps1" >}}

As with the previous version, the resulting XML file will contain all the rules and conditions making it easy to audit the AppLocker policy. Follows a example result file.

{{< gist serializingme e1b788a6e35b8345a6ffe7dd165e4530 "example.xml" >}}

Hope it is useful :)

[2]: /project/powascripts/ "Project Page"