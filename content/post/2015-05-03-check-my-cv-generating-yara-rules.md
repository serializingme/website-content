+++
banner = "/uploads/2015/05/malicious-email.png"
categories = [ "Incident Response", "Malware", "Memory Forensics", "Windows" ]
date = "2015-05-03T12:19:48+00:00"
excerpt = "Generating YARA rules using Volatility and VirtualBox to confirm future infections..."
format = "post"
tags = [ "VirtualBox", "Volatility", "YARA" ]
title = "\"Check my CV\", Generating YARA Rules"

+++

Recently, one e-Mail that was sent to one of my colleagues caught my attention. The message was quite believable but there were some little subtleties that gave it away. First step was to get the attachment out of the message and do an initial analysis.

<!--more-->

From Microsoft Office 2007 onwards, the Word document is in its essence a *Zip* file.

```shell {linenos=inline}
#!/bin/bash
# Decode the e-Mail attachment
base64 -w 0 -d email-attachment-b64.txt > CV_8888.doc

# Check the file type
file CV_8888.doc
#CV_8888.doc: Microsoft Word 2007+

# Checked the contents of Word document
unzip -l CV_8888.doc
#Archive:  CV_8888.doc
#  Length      Date    Time    Name
#---------  ---------- -----   ----
#     2088  01-01-1980 00:00   [Content_Types].xml
#      590  01-01-1980 00:00   _rels/.rels
#     1602  01-01-1980 00:00   word/_rels/document.xml.rels
#     3711  01-01-1980 00:00   word/document.xml
#     1525  01-01-1980 00:00   word/footer1.xml
#     1568  01-01-1980 00:00   word/endnotes.xml
#     1574  01-01-1980 00:00   word/footnotes.xml
#    10240  01-01-1980 00:00   word/vbaProject.bin
#     6804  01-01-1980 00:00   word/theme/theme1.xml
#      277  01-01-1980 00:00   word/_rels/vbaProject.bin.rels
#     2651  01-01-1980 00:00   word/settings.xml
#     1358  01-01-1980 00:00   word/vbaData.xml
#    17578  01-01-1980 00:00   word/styles.xml
#     3256  01-01-1980 00:00   word/numbering.xml
#     1486  01-01-1980 00:00   word/fontTable.xml
#      740  01-01-1980 00:00   docProps/core.xml
#      428  01-01-1980 00:00   word/webSettings.xml
#    18331  01-01-1980 00:00   word/stylesWithEffects.xml
#      987  01-01-1980 00:00   docProps/app.xml
#---------                     -------
#    76794                     19 files
```

Right away one thing pops out, the file `word/vbaProject.bin`. This means that this Microsoft Word document contains Visual Basic for Applications (VBA) macros.

```shell {linenos=inline}
#!/bin/bash
# Extract the file from the Word document
unzip CV_8888.doc word/vbaProject.bin
#Archive:  CV_8888.doc
#  inflating: word/vbaProject.bin

# Extract the strings from the file and do a quick analysis
strings -a word/vbaProject.bin
#ShellExecuteA
#(...)
#http://xxx.xxx.xxx.xxx:888/troll.e
#(...)
#shell32.dll+
#(...)
#Document_Open
```

Those strings are a very good indicator that the file is malicious and that upon opening (reference to `Document_Open`), it will try to download an executable (reference to a URL, `http://xxx.xxx.xxx.xxx:888/troll.e`) and execute it (reference to the Windows API `SheellExecuteA` and the DLL that exports it, `shell32.dll`).

```shell {linenos=inline}
#!/bin/bash
# Download the malware
wget http://xxx.xxx.xxx.xxx:888/troll.exe
#--2015-05-02 16:40:45--  http://xxx.xxx.xxx.xxx:888/troll.exe
#Connecting to xxx.xxx.xxx.xxx:888... connected.
#HTTP request sent, awaiting response... 200 OK
#Length: 200704 (196K) [application/x-msdownload]
#Saving to: 'troll.exe'
#
#troll.exe                                    100%[============================================
# ====================================================>] 196.00K   342KB/s   in 0.6s
#
#2015-05-02 16:40:45 (342 KB/s) - 'troll.exe' saved [200704/200704]
```

After submitting the file to [Mawlr][1], I was surprised that the executable came so clean from the analysis and only three anti-virus have detect it as malicious (at the time of writing). The next step was to run the malware on a disposable virtual machine and observe it's behaviour.

```shell {linenos=inline}
#!/bin/bash
# Create the analysis directories
mkdir -p /tmp/malware/memory

# Start a packet capture
tcpdump -i br0 -s 1514 -w /tmp/malware/network.pcap
```

{{< html >}}
<div class="row">
  <div class="col-md-6">
  <p>One thing that wasn't reported by the Malwr sandbox (among others), was that the malware created and executed a file in the <code>%temp%</code> folder to delete the dropped malware. The file deleted the malware, but failed to delete itself (as seen in the image). The failure from the Malwr sandbox to detect this behaviour, leads me to believe that the malware employs anti-virtualization techniques. Interestingly enough, it didn't seem to have detected my environment as such, maybe it is using specific checks for the Malwr sandbox.</p>
  </div>
  <div class="col-md-6">
  {{< figure image="/uploads/2015/05/malware-self-delete.png" alternative="Malware self delete" caption="Batch file to delete the dropped malware." thumbnail="/uploads/2015/05/malware-self-delete-300x225.png" >}}
  </div>
</div>
{{< /html >}}

After the execution had finished, I dumped the virtual machine memory (Virtual Box) into a directory mounted in RAM to make the Volatility analysis run a little faster.

```shell {linenos=inline}
#!/bin/bash
# Dump the Virtual Machine memory
VBoxManage debugvm sandbox dumpguestcore --filename /tmp/malware/sandbox.dmp

# Mount a directory in memory with enough space to contain the memory dump
mount -t tmpfs -o size=2560m tmpfs /tmp/malware/memory/

# Convert the memory dump to a raw format
volatility imagecopy --filename /tmp/malware/sandbox.dmp -O /tmp/malware/memory/sandbox-raw.dmp
# Writing data (5.00 MB chunks): |.............................................................
# .............................................................................................
#..............................................................................................
#..............................................................................................
#....................................................................................|
```

The next step was to check for the processes running in the virtual machine using the Volatility process cross-view plug-in.

```shell {linenos=inline}
#!/bin/bash
# Get a cross-view of the processes running using the various methods
volatility --filename /tmp/malware/memory/sandbox-raw.dmp --profile Win7SP1x64 psxview
#Volatility Foundation Volatility Framework 2.4
#Offset(P)          Name                    PID pslist psscan thrdproc pspcid csrss session deskthrd ExitTime
#------------------ -------------------- ------ ------ ------ -------- ------ ----- ------- -------- --------
#(...)
#0x000000007e3d6740 WINWORD.EXE            2104 True   True   False    True   True  True    True
#(...)
#0x000000007de9bb30 svchost.exe             708 True   True   False    True   True  True    True
#(...)
```

Once again I was surprised, there was no trace of the malware process. From what I have observed in ProcessHacker, there should have been two entries (or a minimum of one) in the processes list (both named `lf.exe`), one for the original dropped and packed malware, and another one for the malware already unpacked.

```shell {linenos=inline}
#!/bin/bash
# Extract the strings from the dropped malware
strings -a -td /tmp/malware/troll.exe > /tmp/malware/troll-strings.txt
strings -a -td -el /tmp/malware/troll.exe >> /tmp/malware/troll-strings.txt

# Only noticed two interesting strings
cat /tmp/malware/troll-strings.txt
#(...)
# 133776 C:\Dachshunds4\Urged7\Vasoganglion0\VB6.OLB
#(...)
# 135280 C:\Dachshunds4\Urged7\Vasoganglion0\MSCOMCTL.oca
#(...)
```

With those two strings, I used the strings plug-in in Volatility in order to try and find the process(es) in memory.

```shell {linenos=inline}
#!/bin/bash
# Extract the strings from the sandbox memory dump
strings -a -td /tmp/malware/memory/sandbox-raw.dmp > /tmp/malware/sandbox-strings.txt
strings -a -td -el /tmp/malware/memory/sandbox-raw.dmp >> /tmp/malware/sandbox-strings.txt

# Will only search for those two strings
grep "Dachshunds4" /tmp/malware/sandbox-strings.txt | sed 's/\([0-9]\+\)\s\(.*\)/\1:\2/g' > /tmp/malware/strings-search.txt

# Search for the strings in the memory dump
volatility --filename /tmp/malware/memory/sandbox-raw.dmp --profile Win7SP1x64 strings -s /tmp/malware/strings-search.txt
#Volatility Foundation Volatility Framework 2.4
#1499365488 [FREE MEMORY] C:\Dachshunds4\Urged7\Vasoganglion0\MSCOMCTL.oca
#1503558288 [FREE MEMORY] C:\Dachshunds4\Urged7\Vasoganglion0\VB6.OLB
#1514606896 [2104:08812130] C:\Dachshunds4\Urged7\Vasoganglion0\MSCOMCTL.oca
#1515916112 [2104:08811b50] C:\Dachshunds4\Urged7\Vasoganglion0\VB6.OLB
#1524592928 [2104:087e1120] C:\Dachshunds4\Urged7\Vasoganglion0\MSCOMCTL.oca
#1526186640 [2104:07b68290] C:\Dachshunds4\Urged7\Vasoganglion0\VB6.OLB
#1526188144 [2104:07b68870] C:\Dachshunds4\Urged7\Vasoganglion0\MSCOMCTL.oca
#1527212864 [2104:087e0b40] C:\Dachshunds4\Urged7\Vasoganglion0\VB6.OLB
#2123231803 [kernel:fa8002edf23b] C:\Dachshunds4\Urged7\Vasoganglion0\VB6.OLB
#2123244143 [kernel:fa8002ee226f] C:\Dachshunds4\Urged7\Vasoganglion0\MSCOMCTL.oca
```

There are reference to both strings in Microsoft Word and in the Kernel. This means the malware didn't just disappear, but instead of continuing the hunt for it with Volatility, it became easier to dump the process of the unpacked version using *ProcessHacker*.

```shell {linenos=inline}
#!/bin/bash
# Getting the strings from the unpacked malware
strings -a -td /tmp/malware/lf.exe.dmp > /tmp/malware/lf-strings.txt
strings -a -td -el /tmp/malware/lf.exe.dmp >> /tmp/malware/lf-strings.txt

# Noticed a bunch of interesting strings
cat /tmp/malware/lf-strings.txt
#(...)
# 647259 GET %s HTTP/1.1
# 647276 Host: %s
# 647286 User-Agent: %s
# 647302 Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
# 647375 Accept-Language: en-us,en;q=0.5
# 647408 Keep-Alive: 300
# 647425 Connection: keep-alive
#(...)
# 652799 IMAP Password
# 652871 POP3 Password
# 652943 HTTP Password
# 653015 SMTP Password
# 653103 wine_get_unix_file_name
# 654359 IsWow64Process
# 654595 cmd.exe /c ping 127.0.0.1 -n 4&del "%s"
#(...)
# 656611 RegQueryValueExA
# 656631 RegOpenKeyA
# 656643 RegCloseKey
# 656655 Software\N3NNetwork\
```

From the strings it was possible to confirm that the malware is indeed using anti-virtualization techniques (reference to the function `wine_get_unix_file_name`). It is also possible that it has password stealing and key logging capabilities. With all this information, it is easy to create YARA rules.

```plaintext {linenos=inline}
rule cv_malware_packed {
meta:
    version="1.1"
    filetype="PE"
    author="Duarte Silva"
    license="GPLv3"
    reference="https://www.serializing.me/2015/05/03/check-my-cv-generating-yara-rules/"
    date="2015-04-03"
    description="Detection for the packed version of the malware downloaded using a rigged Word document"
strings:
    $a1="C:\\Dachshunds4\\Urged7\\Vasoganglion0\\VB6.OLB"
    $a2="C:\\Dachshunds4\\Urged7\\Vasoganglion0\\MSCOMCTL.oca"
condition:
    (all of ($a*))
}

rule cv_malware_unpacked {
meta:
    version="1.1"
    filetype="PE"
    author="Duarte Silva"
    license="GPLv3"
    reference="https://www.serializing.me/2015/05/03/check-my-cv-generating-yara-rules/"
    date="2015-04-03"
    description="Detection for the unpacked version of the malware downloaded using a rigged Word document"
strings:
    $cmd="cmd.exe /c ping 127.0.0.1 -n 4&del \"%s\""
    $regkey="Software\\N3NNetwork\\"
    $a1="C:\\Dachshunds4\\Urged7\\Vasoganglion0\\VB6.OLB"
    $a2="C:\\Dachshunds4\\Urged7\\Vasoganglion0\\MSCOMCTL.oca"
    $b1="IMAP Password"
    $b2="POP3 Password"
    $b3="HTTP Password"
    $b4="SMTP Password"
condition:
    $cmd and $regkey and (all of ($a*)) and (any of ($b*))
}
```

The received message with the attachment is available [here][2] (password without quotes is "Original message received with the malicious document."), happy YARA'ing!</a>

[1]: https://malwr.com/analysis/YmE4NmFiOTQyZWFmNDM4MTgwNmQ4YzAwNWQ1ZTU5YTg/ "Mawlr analysis"
[2]: /uploads/2015/05/email-message.zip  "e-Mail message"
