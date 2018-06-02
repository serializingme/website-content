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

{{< gist serializingme 646765360b36093af7350b4a547a0f56 "dump-users-example.xml" >}}

The scripts can be found in the [project page][4]. Cheers ;)

[1]: https://twitter.com/harmj0y "harmj0y Twiter Profile"
[2]: http://www.harmj0y.net/blog/activedirectory/roasting-as-reps/ "harmj0y Blog Post"
[3]: https://github.com/adaptivethreat/ASREPRoast "ASREPRoast GitHub Repository"
[4]: /project/powascripts/ "Project Page"
