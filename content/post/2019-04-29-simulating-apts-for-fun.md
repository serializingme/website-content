+++
banner = "/uploads/2019/04/msfconsole.png"
categories = [ "Linux", "Configuration" ]
date = "2019-04-29T20:30:00+00:00"
excerpt = "How to simulate Advanced Persistent Threats (APT) using Metasploit and MITRE's ATT&CK framework..."
format = "post"
tags = [ "Red Team", "Metasploit", "ATT&CK" ]
title = "Simulating APTs For Fun"

+++

In the post I will explain how one could simulate an Advanced Persistent Threat (APT) using Praetorian's Purple Team Attack Automation and MITRE's ATT&CK framework.

<!--more-->

{{< youtube class="embed-responsive embed-responsive-16by9 mb-3" id="REMVMfoeJWE" >}}

### Introduction

How does one go about validating that what has been setup to protect one's infrastructure is actually useful? Well, one will need to be able to simulate threats. To do that, one needs two things, an environment and tools. In the past few days I have been investigating tools that would allow me to simulate Tactics, Techniques and Procedures (TTPs) of better known APTs to validate some concepts we have been exploring at work.

An obvious choice was MITRE's CALDERA, ended up disappointed with it, but pleasantly surprised by Praetorian's [Purple Team Attack Automation][1] (shoutout to [@Decalage2][5] for pointing me to it). As per Purple Team Attack Automation (PTAA) documentation, one should make use of Docker to install it, something that I'm not very keen on doing.

I decided to manually install it, in a nutshell, PTAA is Metasploit with extra modules added to it so how hard could it be? That's also the reason why I liked PTAA so much: the fact that it leverages existing and well maintained software that I use on my workflow.

{{< alert >}}Note that the installation of PTAA was performed in a fresh and fully updated Kali Linux 2019.1a.{{< /alert >}}

### First Things First

First thing is to install the dependencies needed to build the Ruby gems required by Metasploit.

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "dependencies.sh" >}}

Then, clone the source code of [rbenv][2], [ruby-build][3] and of PTAA itself. We'll make use of rbenv as the Metasploit version from which PTAA is based upon, has different requirements from the Metasploit that comes with Kali (e.g., Ruby version). Creating a separate environment makes things easier to manage and avoids problems with version conflicts and the likes.

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "clone.sh" >}}

### Ruby, Ruby Gems and a Database

After the code has been downloaded, we need to create a file that can be used to setup the environment every time we want to make use of PTAA. The rbenv documentation instructs one to use the `.bashrc` file. This works well when you have a dedicated user to run the software you're installing, which is not the case. As such, I prefer to use a specific file that I use only when needed.

{{< alert class="warning" >}}Note that the environment file adds `/usr/lib/postgresql/11/bin` to the `PATH` variable as Metasploit `msfdb` utility makes use of `pg_ctl`.{{< /alert >}}

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "environment.sh" >}}

Now we have everything ready to install Ruby and the gems needed by Metasploit.

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "install-ruby.sh" >}}

Verify that the environment is properly setup and correct any errors reported.

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "verify.sh" >}}

Finally install the Ruby gems needed by Metasploit using [bundler][4] and setup the database.

{{< alert class="danger" >}}You'll probably want to skip the database initialization command if you already make use of Metasploit's database since you may end up deleting all the loot you have acquired and stored in the already existing database.{{< /alert >}}

{{< alert >}}Make sure the user you are using to execute the `msfdb` utility is in the `postgres` group, otherwise it will fail.{{< /alert >}}

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "metasploit-setup.sh" >}}

### First Run

Now that the environment and PTAA are ready, the next step is to generate the payload that will be used to "infect" a target machine.

{{< alert class="warning" >}}Note that the payload generation options below are just for testing. You won't be fooling anyone ;){{< /alert >}}

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "payload.sh" >}}

Then we can run Metasploit and start a handler to receive the connections from our Meterpreter payload.

{{< gist serializingme e7010a60207fe8003eea0dc584150901 "run.sh" >}}

### Running the Simulation

Now that we have everything ready, we need to select what PTAA modules we need to run. Since PTAA makes usage of MITRE's ATT&CK framework we can for each of the defined tactics, select the techniques specific to the APT one wants to simulate and that PTAA supports. For example, if we want to simulate APT28 (because, from Mother Russia with love) on the "Execution" tactic we can select technique T1086 - execution with PowerShell.

Hope this is helpful :D

[1]: https://github.com/praetorian-code/purple-team-attack-automation/ "Purple Team Attack Automation Repository"
[2]: https://github.com/rbenv "rbenv Repository"
[3]: https://github.com/rbenv/ruby-build "ruby-build Respository"
[4]: https://bundler.io/ "Ruby Bundler Site"
[5]: https://twitter.com/decalage2 "Decalage Twitter"
