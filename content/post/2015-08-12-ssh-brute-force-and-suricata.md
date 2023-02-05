+++
banner = "/uploads/2015/08/suricata-ssh-attacks.png"
categories = [ "Linux", "Network" ]
date = "2015-08-12T18:24:28+00:00"
excerpt = "Just a simple set of Suricata rules to stop the majority of SSH brute force attacks..."
format = "post"
tags = [ "Brute Force", "SSH", "Suricata" ]
title = "SSH Brute Force and Suricata"

+++

Since SSH is one of the most pervasive ways to manage servers remotely, it is also one of the most plagued by brute force attacks. What follows is a simple set of Suricata rules to stop the majority of SSH brute force attacks. It will drop connections based on the reported SSH client version.

<!--more-->

There are other more effective measures that can be implemented to block these type of attacks (two factor authentication, IP white list, etc.). Admittedly these rules won't stop the willing attacker, they will however stop the lazy one, that is looking for the low hanging fruit.

{{< alert >}}These rules are released under GPLv3.{{< /alert >}}
{{< alert class="warning" >}}The last three rules are commented out, they depend on the client used by the actual authorized users clients.{{< /alert >}}

```yaml {linenos=inline}
# Used in brute force attacks
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN LibSSH Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"libssh"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000000; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN JSCH Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"JSCH"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000001; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN MEDUSA Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"MEDUSA"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000002; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN LYGhost Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"LYGhost"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000003; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN Paramiko Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"paramiko"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000004; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN ssh2js0 Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"ssh2js0"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000005; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN vngx-jsch Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"vngx-jsch"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000006; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN ZGrab Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"ZGrab"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000007; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN Granados Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"Granados"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000008; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN Erlang Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"Erlang"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000012; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN Renci Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"Renci"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000013; rev:1;)
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN Twisted Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"Twisted"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000014; rev:1;)

# Only enable if PuTTY isn't used
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN PuTTY Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"PuTTY"; nocase; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000009; rev:1;)

# Only enable if OpenSSH key scanner isn't used
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN OpenSSH-keyscan Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"OpenSSH-keyscan"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000010; rev:1;)

# Only enable if OpenSSH isn't used
drop ssh $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SERIALIZINGME SCAN OpenSSH Based SSH Connections Not Allowed"; flow:established,to_server; content:"SSH-"; content:"OpenSSH"; within:20; reference:url,www.serializing.me/2015/08/12/ssh-brute-force-and-suricata/; classtype:attempted-admin; sid:5000011; rev:1;)
```

Now, onto sleeping more easily at night ;)
