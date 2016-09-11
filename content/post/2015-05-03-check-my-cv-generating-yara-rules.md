+++
banner = "/uploads/2015/05/malicious-email.png"
date = "2015-05-03T12:19:48+00:00"
categories = [ "Incident Response", "Malware", "Memory Forensics", "Windows" ]
excerpt = "Generating YARA rules using Volatility and VirtualBox to confirm future infections..."
format = "post"
tags = [ "VirtualBox", "Volatility", "YARA" ]
title = "\"Check my CV\", Generating YARA Rules"

+++

Recently, one e-Mail that was sent to one of my colleagues caught my attention. The message was quite believable but there were some little subtleties that gave it away. First step was to get the attachment out of the message and do an initial analysis.

<!--more-->

From Microsoft Office 2007 onwards, the Word document is in its essence a *Zip* file.

{{< gist serializingme 16465f042c0d287542e4 "word-file.sh" >}}

Right away one thing pops out, the file `word/vbaProject.bin`. This means that this Microsoft Word document contains Visual Basic for Applications (VBA) macros.

{{< gist serializingme 16465f042c0d287542e4 "macro-strings.sh" >}}

Those strings are a very good indicator that the file is malicious and that upon opening (reference to `Document_Open`), it will try to download an executable (reference to a URL, `http://xxx.xxx.xxx.xxx:888/troll.e`) and execute it (reference to the Windows API `SheellExecuteA` and the DLL that exports it, `shell32.dll`).

{{< gist serializingme 16465f042c0d287542e4 "download-malware.sh" >}}

After submitting the file to [Mawlr][1], I was surprised that the executable came so clean from the analysis and only three anti-virus have detect it as malicious (at the time of writing). The next step was to run the malware on a disposable virtual machine and observe it's behaviour.

{{< gist serializingme 16465f042c0d287542e4 "prepare-analysis.sh" >}}

<div class="row">
  <div class="col-md-6">
  <p>One thing that wasn't reported by the Malwr sandbox (among others), was that the malware created and executed a file in the <code>%temp%</code> folder to delete the dropped malware. The file deleted the malware, but failed to delete itself (as seen in the image). The failure from the Malwr sandbox to detect this behaviour, leads me to believe that the malware employs anti-virtualization techniques. Interestingly enough, it didn't seem to have detected my environment as such, maybe it is using specific checks for the Malwr sandbox.</p>
  </div>
  <div class="col-md-6">
  {{< figure image="/uploads/2015/05/malware-self-delete.png" alternative="Malware self delete" caption="Batch file to delete the dropped malware." thumbnail="/uploads/2015/05/malware-self-delete-300x225.png" >}}
  </div>
</div>

After the execution had finished, I dumped the virtual machine memory (Virtual Box) into a directory mounted in RAM to make the Volatility analysis run a little faster.

{{< gist serializingme 16465f042c0d287542e4 "after-execution.sh" >}}

The next step was to check for the processes running in the virtual machine using the Volatility process cross-view plug-in.

{{< gist serializingme 16465f042c0d287542e4 "volatility-psxview.sh" >}}

Once again I was surprised, there was no trace of the malware process. From what I have observed in ProcessHacker, there should have been two entries (or a minimum of one) in the processes list (both named `lf.exe`), one for the original dropped and packed malware, and another one for the malware already unpacked.

{{< gist serializingme 16465f042c0d287542e4 "malware-strings.sh" >}}

With those two strings, I used the strings plug-in in Volatility in order to try and find the process(es) in memory.

{{< gist serializingme 16465f042c0d287542e4 "volatility-strings.sh" >}}

There are reference to both strings in Microsoft Word and in the Kernel. This means the malware didn't just disappear, but instead of continuing the hunt for it with Volatility, it became easier to dump the process of the unpacked version using *ProcessHacker*.

{{< gist serializingme 16465f042c0d287542e4 "unpacked-malware-strings.sh" >}}

From the strings it was possible to confirm that the malware is indeed using anti-virtualization techniques (reference to the function `wine_get_unix_file_name`). It is also possible that it has password stealing and key logging capabilities. With all this information, it is easy to create YARA rules.

{{< gist serializingme 16465f042c0d287542e4 "check-my-cv.yara" >}}

The received message with the attachment is available [here][2] (password without quotes is "Original message received with the malicious document."), happy YARA'ing!</a>

[1]: https://malwr.com/analysis/YmE4NmFiOTQyZWFmNDM4MTgwNmQ4YzAwNWQ1ZTU5YTg/ "Mawlr analysis"
[2]: /uploads/2015/05/email-message.zip  "e-Mail message"