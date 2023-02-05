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

{{< alert >}}Note that these cmdlets, when paired with a code versioning system like Git, are also very useful when performing periodic Active Directory change audits.{{< /alert >}}

The first thing I usually do when I get access to a computer registered in a Windows domain of the target network, is to see if there is any other domains available. The `Dump-Domains` cmdlet will dump all domains and all trust relationships that can be found. To run the cmdlet just provide the file to where the information is to be dumped as exemplified bellow.

```powershell {linenos=inline}
Dump-Domains -DomainFile domains.xml
```

Follows an example result file.

{{< alert >}}Just because there is a trust relationship between the domain of the current computer or user and another domain, it doesn't necessarily mean that the computer or user account will have access to that trusted domain.{{< /alert >}}

```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<Domains>
  <Start Time="2016-10-03T13:39:02.4430069Z" />
  <Domain Name="SERIALIZING_LOCAL" DNS="serializing.local" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-03T12:30:42.0000000Z">
    <Trusted Name="SERIALIZING_ME" DNS="serializing.me" />
  </Domain>
  <End Time="2016-10-03T13:39:02.5130139Z" />
</Domains>
```

The next step, is to enumerate the computers registered on all the domains found. The `Dump-Computers` cmdlet will get all computers that are available (and registered in the respective domain) without performing any network scanning. This script is also able to do DNS resolution in order to obtain the computers IP addresses.

{{< alert class="warning" >}}Note that enabling the DNS resolution switch as seen bellow, will create a lot of noise due to all the DNS requests that will be done. This will increase the likelihood of triggering security related alerts.{{< /alert >}}

```powershell {linenos=inline}
Dump-Computers -DomainFile domains.xml -ResultFile computers.xml -DNSResolve
```

```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<Domains>
  <Start Time="2016-10-03T13:42:15.8719020Z" />
  <Domain Name="SERIALIZING_LOCAL" DNS="serializing.local">
    <Computer Name="wnddc01.serializing.local" Identifier="S-1-5-21-815321168-1961664571-58983674-10001" Description="Domain Controller" DN="CN=WNDDC01,OU=Domain Controllers,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:15:23.0000000Z">
      <OS Name="Windows Server 2012 R2 Standard" Version="6.3 (9600)" />
      <Addresses>
        <Address Value="10.0.0.1" />
      </Addresses>
    </Computer>
    <Computer Name="wnddkp01.serializing.local" Identifier="S-1-5-21-815321168-1961664571-58983674-10021" Description="Windows Desktop" DN="CN=WNDDKP01,OU=Computers,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T13:38:20.0000000Z" Changed="2016-10-03T09:22:19.0000000Z">
      <OS Name="Windows 7" Version="6.1 (7601)" Patch="Service Pack 1" />
      <Addresses>
        <Address Value="10.0.0.10" />
      </Addresses>
    </Computer>
  </Domain>
  <End Time="2016-10-03T13:43:47.0784943Z" />
</Domains>
```

It is also interesting to know what users and groups are available as well as the respective memberships. This makes it easier to identify possible user accounts that can be targeted in order to gain higher privileges or to perform lateral movement on the network. The `Dump-Users` and `Dump-Groups` cmdlets will give that information. Follows a example result file for each cmdlet.


```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<Domains>
  <Start Time="2016-09-03T08:05:45.5014054Z" />
  <Domain Name="SERIALIZINGLOCAL" DNS="serializing.local">
    <User Name="Administrator" Identifier="S-1-5-21-815321168-1961664571-58983674-500" Description="Built-in account for administering the computer/domain" DN="CN=Administrator,OU=Domain Administration,OU=Users,DC=SERIALIZING,DC=LOCAL" Locked="False" Disabled="False" NoPasswordRequired="False" CanChangePassword="True" PasswordDoesntExpire="True" ExpiredPassword="False" Created="2016-10-02T12:07:28.0000000Z" Changed="2016-09-02T14:09:58.0000000Z">
      <MemberOf DN="CN=Administrators,CN=Builtin,DC=SERIALIZING,DC=LOCAL" />
      <MemberOf DN="CN=Domain Admins,OU=Administrative,OU=Groups,DC=SERIALIZING,DC=LOCAL" />
      <MemberOf DN="CN=Enterprise Admins,OU=Administrative,OU=Groups,DC=SERIALIZING,DC=LOCAL" />
      <MemberOf DN="CN=Group Policy Creator Owners,CN=Users,DC=SERIALIZING,DC=LOCAL" />
      <MemberOf DN="CN=Schema Admins,OU=Administrative,OU=Groups,DC=SERIALIZING,DC=LOCAL" />
    </User>
    <User Identifier="S-1-5-21-815321168-1961664571-812641168-501" Description="Built-in account for guest access to the computer/domain" DN="CN=Guest,CN=Users,DC=SERIALIZING,DC=LOCAL" Locked="False" Disabled="True" NoPasswordRequired="True" CanChangePassword="True" PasswordDoesntExpire="True" ExpiredPassword="False" Created="2016-10-02T12:07:28.0000000Z" Changed="2016-09-02T12:52:13.0000000Z">
      <MemberOf DN="CN=Guests,CN=Builtin,DC=SERIALIZING,DC=LOCAL" />
    </User>
  </Domain>
  <End Time="2016-09-03T08:06:08.6259371Z" />
</Domains>
```

```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<Domains>
  <Start Time="2016-10-03T08:02:01.7690660Z" />
  <Domain Name="SERIALIZING_LOCAL" DNS="serializing.local">
    <Group Name="Enterprise Read-only Domain Controllers" Identifier="S-1-5-21-815321168-1961664571-58983674-498" Description="Members of this group are Read-Only Domain Controllers in the enterprise" DN="CN=Enterprise Read-only Domain Controllers,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z" />
    <Group Name="Domain Admins" Identifier="S-1-5-21-815321168-1961664571-58983674-512" Description="Designated administrators of the domain" DN="CN=Domain Admins,OU=Administrative,OU=Groups,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-09-07T07:49:21.0000000Z">
      <MemberOf DN="CN=Administrators,CN=Builtin,DC=SERIALIZING,DC=LOCAL" />
    </Group>
    <Group Name="Domain Users" Identifier="S-1-5-21-815321168-1961664571-58983674-513" Description="All domain users" DN="CN=Domain Users,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-07-07T11:57:38.0000000Z">
      <MemberOf DN="CN=Authorized Terminal Server Users,OU=Groups,DC=SERIALIZING,DC=LOCAL" />
      <MemberOf DN="CN=Users,CN=Builtin,DC=SERIALIZING,DC=LOCAL" />
    </Group>
    <Group Name="Domain Guests" Identifier="S-1-5-21-815321168-1961664571-58983674-514" Description="All domain guests" DN="CN=Domain Guests,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z">
      <MemberOf DN="CN=Guests,CN=Builtin,DC=SERIALIZING,DC=LOCAL" />
    </Group>
    <Group Name="Domain Computers" Identifier="S-1-5-21-815321168-1961664571-58983674-515" Description="All workstations and servers joined to the domain" DN="CN=Domain Computers,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2006-02-06T12:13:29.0000000Z" Changed="2016-10-02T12:07:27.0000000Z" />
    <Group Name="Domain Controllers" Identifier="S-1-5-21-815321168-1961664571-58983674-516" Description="All domain controllers in the domain" DN="CN=Domain Controllers,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z">
    </Group>
    <Group Name="Schema Admins" Identifier="S-1-5-21-815321168-1961664571-58983674-518" Description="Designated administrators of the schema" DN="CN=Schema Admins,OU=Administrative,OU=Groups,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-09-07T07:49:21.0000000Z">
    </Group>
    <Group Name="Enterprise Admins" Identifier="S-1-5-21-815321168-1961664571-58983674-519" Description="Designated administrators of the enterprise" DN="CN=Enterprise Admins,OU=Administrative,OU=Groups,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-09-07T07:49:21.0000000Z">
      <MemberOf DN="CN=Administrators,CN=Builtin,DC=SERIALIZING,DC=LOCAL" />
    </Group>
    <Group Name="Group Policy Creator Owners" Identifier="S-1-5-21-815321168-1961664571-58983674-520" Description="Members in this group can modify group policy for the domain" DN="CN=Group Policy Creator Owners,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z">
    </Group>
    <Group Name="Read-only Domain Controllers" Identifier="S-1-5-21-815321168-1961664571-58983674-521" Description="Members of this group are Read-Only Domain Controllers in the domain" DN="CN=Read-only Domain Controllers,CN=Users,DC=SERIALIZING,DC=LOCAL" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z">
    </Group>
  </Domain>
  <End Time="2016-10-03T08:02:12.4230389Z" />
</Domains>
```

Another thing that is very important, especially when looking for ways to escalate privileges in the local computer, is to obtain the Group Policies. To do that there is two cmdlets, `Dump-GroupPolicies` and `Dump-GroupPoliciesFiles`. The first will dump the Group Policies information while the second will dump the respective files from the file share they are stored in.

```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<Domains>
  <Start Time="2016-10-03T08:16:16.7320028Z" />
  <Domain Name="SERIALIZING_LOCAL" DNS="serializing.local">
    <GroupPolicy GUID="{31B2F340-016D-11D2-945F-00C04FB984F9}" Name="DEFAULT DOMAIN POLICY" Path="\\SERIALIZING.LOCAL\sysvol\SERIALIZING.LOCAL\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}" Version="1" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z" />
    <GroupPolicy GUID="{6AC1786C-016F-11D2-945F-00C04FB984F9}" Name="DEFAULT DOMAIN CONTROLLERS POLICY" Path="\\SERIALIZING.LOCAL\sysvol\SERIALIZING.LOCAL\Policies\{6AC1786C-016F-11D2-945F-00C04fB984F9}" Version="1" Created="2016-10-02T12:07:27.0000000Z" Changed="2016-10-02T12:07:27.0000000Z" />
  </Domain>
  <End Time="2016-10-03T08:16:18.0181314Z" />
</Domains>
```

If social engineering is a vector that is allowed in the rules of engagement of the penetration test, the `Dump-UsersPhotos` cmdlet will dump the users photographs stored on Active Directory. Sometimes it help in researching the targets and possible ways to social engineer them.

The scripts can be found in the [project page][1]. Cheers ;)

[1]: /project/powascripts/ "Project Page"
