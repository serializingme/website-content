+++
banner = "/uploads/2016/10/powershell-dump-computers.png"
categories = [ "Configuration", "Reconnaissance", "Windows" ]
date = "2016-10-07T18:05:00+00:00"
excerpt = "PowerShell scripts that I have created in order to dump information from Active Directory..."
format = "post"
tags = [ "Active Directory", "PowerShell", "PowaScripts" ]
title = "Active Directory Dump"

+++

During many penetration tests (or red versus blue team exercises), I have found myself with the need to investigate users, groups, computers and policies of a Windows domain. To do that, I have developed a series of PowerShell scripts that dump all that information from Active Directory into XML files.

<!--more-->

{{< alert class="info" >}}Note that these cmdlets, when paired with a code versioning system like Git, are also very usefull when performing periodic Active Directory change audits.{{< /alert >}}

The first thing I usually do when I get access to a computer registered in a Windows domain of the target network, is to see if there is any other domains available. The `Dump-Domains` cmdlet will dump all domains and all trust relationships that can be found. To run the cmdlet just provide the file to where the information is to be dumped as exemplified bellow.

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-domains-example.ps1" >}}

Follows an example result file.

{{< alert class="info" >}}Just because there is a trust relationship between the domain of the current computer or user and another domain, it doesn't necessarily mean that the computer or user account will have access to that trusted domain.{{< /alert >}}

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-domains-example.xml" >}}

The next step, is to enumerate the computers registered on all the domains found. The `Dump-Computers` cmdlet will get all computers that are available (and registered in the respective domain) without performing any network scanning. This script is also able to do DNS resolution in order to obtain the computers IP addresses.

{{< alert class="warning" >}}Note that enabling the DNS resolution switch as seen bellow, will create a lot of noise due to all the DNS requests that will be done. This will increase the likelihood of triggering security related alerts.{{< /alert >}}

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-computers-example.ps1" >}}

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-computers-example.xml" >}}

It is also interesting to know what users and groups are available as well as the respective memberships. This makes it easier to identify possible user accounts that can be targeted in order to gain higher privileges or to perform lateral movement on the network. The `Dump-Users` and `Dump-Groups` cmdlets will give that information. Follows a example result file for each cmdlet.

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-users-example.xml" >}}

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-groups-example.xml" >}}

Another thing that is very important, especially when looking for ways to escalate privileges in the local computer, is to obtain the Group Policies. To do that there is two cmdlets, `Dump-GroupPolicies` and `Dump-GroupPoliciesFiles`. The first will dump the Group Policies information while the second will dump the respective files from the file share they are stored in.

{{< gist serializingme 02d92704bc81d6787725b3ed8c808616 "dump-policy-example.xml" >}}

If social engineering is a vector that is allowed in the rules of engagment of the penetration test, the `Dump-UsersPhotos` cmdlet will dump the users photographs stored on Active Directory. Sometimes it help in researching the targets and possible ways to social engineer them.

The scripts can be found in the [project page][1]. Cheers ;)

[1]: /project/powascripts/ "Project Page"
