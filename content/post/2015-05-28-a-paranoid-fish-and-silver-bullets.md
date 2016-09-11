+++
banner = "/uploads/2015/05/pafish-virtualbox.png"
date = "2015-05-28T22:24:56+00:00"
categories = [ "Malware", "Virtualization", "Windows" ]
excerpt = "Adding a full featured IDPS solution, is a good step in protecting not only that \"all too many times vulnerable\" WordPress installation..."
format = "post"
tags = [ "Cuckoo Sandbox", "Emotional Fishes", "FireEye", "Paranoid Fish", "QEMU", "VirtualBox" ]
title = "A Paranoid Fish and Silver Bullets"

+++

I have been doing some research (and development) around virtualized malware sandboxes, being the question, "how easy is for malware to detect such an environment" the most important one, I turned to a tool called Pafish (Paranoid Fish).

<!--more-->

Up until now, I have tested two malware execution sandboxes, one commercial and one open source. Interestingly enough, the commercial system is also based on a open source virtualization technology.

* FireEye (QEMU)
* Cuckoo Sandbox (VirtualBox)

FireEye failed to evade detection in three tests while Cuckoo Sandbox failed in many more tests. In between the two, FireEye is definitely the best evading detection from Pafish, but being the best isn't hard, since the Cuckoo Sandbox doesn't have countermeasures out-of-the-box. However, both of them, marked Pafish activities as malicious.

I have also submitted to both systems some malware samples (that try to detect virtualization) associated with the, still on going, DHL spam run targeting German speaking users. In all the samples the analysis in Cuckoo Sandbox was inconclusive. In FireEye, it was possible to review the full malicious behaviour of all the samples (including Command and Control communications).

In conclusion, there aren't any silver bullets, but FireEye is one of the good bullets. I guess it is possible to make Cuckoo Sandbox a lot more stealth due to it's Open Source and extensible nature and by using QEMU instead of VirtualBox.

Results from the research lead to some contributions to [Pafish][1] with more to come in the near future as the research progresses :D

[1]: /contributions/ "Open Source projects contributions"