+++
banner = "/uploads/2017/01/dumped-users.png"
categories = [ "Configuration", "Reconnaissance", "Windows" ]
date = "2017-01-22T09:55:00+00:00"
excerpt = "Updated the PowerShell script to dump user information from Active Directory..."
format = "post"
tags = [ "Active Directory", "PowerShell", "PowaScripts" ]
title = "PowaScripts Update: Kerberos Pre-authentication"

+++

After reading [harmj0y][1] blog post about ["Roasting AS-REPs"][2], I have decided to update the `Dump-User.ps1` script in order for it to report on users that don't have Kerberos pre-authentication enabled. Running the updated version against a "in the wild" target yielded interesting results to say the least.

<!--more-->

While I can't post the results from the "in the wild" domain, I can say that one domain administrator account was vulnerable and it was possible to successfully retrieve the hash for cracking using [harmj0y][3] script.

In any case, follows an example result file from my test environment where I have disabled the Kerberos pre-authentication for the domain administrator.

```xml {linenos=inline}
<?xml version="1.0" encoding="utf-8"?>
<Domains>
  <Start Time="2017-01-19T11:46:06.4762121Z" />
  <Domain Name="SERIALIZINGLOCAL" DNS="serializing.local">
    <User Name="Administrator" Identifier="S-1-5-21-815321168-1961664571-58983674-500" Description="Built-in account for administering the computer/domain" DN="CN=Administrator,OU=Domain Administration,OU=Users,DC=SERIALIZING,DC=LOCAL" Locked="False" Disabled="False" NoPasswordRequired="False" CanChangePassword="True" PasswordDoesntExpire="True" ExpiredPassword="False" PreAuthNotRequired="True" Created="2016-10-02T12:07:28.0000000Z" Changed="2016-09-02T14:09:58.0000000Z">
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
  <End Time="2017-01-19T11:46:07.2092854Z" />
</Domains>
```

The scripts can be found in the [project page][4]. Cheers ;)

[1]: https://twitter.com/harmj0y "harmj0y Twiter Profile"
[2]: http://www.harmj0y.net/blog/activedirectory/roasting-as-reps/ "harmj0y Blog Post"
[3]: https://github.com/adaptivethreat/ASREPRoast "ASREPRoast GitHub Repository"
[4]: /project/powascripts/ "Project Page"
