+++
banner = "/uploads/2015/11/powershell-applocker-dump.png"
categories = [ "Configuration", "Incident Response", "Windows" ]
date = "2015-11-01T15:16:50+00:00"
excerpt = "While doing incident response, if AppLocker is being used sometimes is useful to know exactly what policy is applied..."
format = "post"
tags = [ "AppLocker", "PowerShell" ]
title = "Inspecting AppLocker Policy"

+++

While doing incident response, if AppLocker is being used but the computer still got infected by a malicious executable, it is useful to know exactly what AppLocker policy is currently applied.

<!--more-->

Leveraging PowerShell is the right choice to achieve this. The following cmdlet will dump the current AppLocker policy to a XML file. It will do that by reading the registry without the need for special permissions (i.e. administrator).

{{< gist serializingme 39d82e9d58b5de0d85ec "example.ps1" >}}

The resulting XML file will contain all the rules and conditions making it easy to audit them. Follows the source code.

{{< gist serializingme 39d82e9d58b5de0d85ec "AppLocker-Dump.ps1" >}}

Hope it's useful :D
