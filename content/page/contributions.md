+++
date = "2015-04-20T16:18:20+00:00"
excerpt = "Chronologically ordered list of contributions to various open source projects."
title = "Contributions"

[menu.main]
name = "Contributions"
weight = 3
+++

Over time, I have contributed to some Open Source Software projects. What follows a list of such contributions. The list of contributions is grouped by project and sorted in chronological order.

### Metasploit

1. Fixed AnyConnect IPC message format ([#17564][26]).

### IVRE

1. Minor fixes to IVRE's web interface ([#601][19]).
1. NSE script `sslv2-drown` causes import error ([#631][20]).
1. Added the `display:vulnerability` search filter directive ([#634][21]).
1. Fixed an issue with the calculation of the top CPEs ([#635][22]).

### stoQ Framework

1. Integration between stoQ Framework and LIEF ([#22][18]).
1. Updated integration between stoQ Framework and LIEF to the latest API ([#44][23]).
1. Fix LIEF plugin usage of stoQ's configuration API ([#107][24]).

### Pafish

1. Fix the compilation under Linux with MinGW cross-compiler ([#29][1]).
1. Added extra checks for VMWare and Wine ([#31][2], as reported in [#15][3]).
1. Disabled Wow64 file system redirection ([#34][4]).
1. Added a check for less than one GiB of memory ([#35][5]).
1. Fixed some compilation warnings ([#37][6]).
1. Added HackingTeam VM detection methods ([#39][7]).

### Evilarc

1. Added support to prepending a path to a transversal ([#3][8]).

### bash-portscanner

1. Some fixes and improvements ([#1][25])

### Suricata

1. Cleaned up repeated code ([#482][9]).
1. Unified2 alert output `X-Forwarded-For` support rewrite and improvement ([#544][10]).
1. Fix the segmentation fault while logging the host on the custom HTTP logger ([#734][11]).
1. Simple code fixes ([#1105][12]).
1. Added `X-Forwarded-For` support to JSON logging ([#1254][13]).
1. Added support for SHA1 and SHA256 ([#2252][14]).

### AisLib

1. Added missing AIS message types ([#1][15]).

### Logback

1. Fixed an issue where exception stack traces were being included ([#34][16]).

### Nmap

Change log can be found [here][17].

1. Improvements to `smtp-open-relay.nse`;
1. Created the `smtp-enum-users.nse`, which attempts to find user account names over SMTP by brute force testing using RCPT, VRFY, and EXPN tests.
1. Created the `http-vuln-cve2011-3192.nse` that detects a denial of service vulnerability in the way the Apache web server handles requests for multiple overlapping/simple ranges of a page.
1. Made `http-wordpress-enum.nse` able to get names of users who have no posts.
1. Added path argument to the `http-auth.nse` script and update the script to use `stdnse.format_output`.
1. Added new fingerprints to `http-enum.nse` for Subversion, CVS and Apache Archiva.
1. Applied patch to `snmp-brute.nse` that solves problems with handling errors that occur during community list file parsing.
1. Added new services and the ATTACK category to the dnsbl script.
1. Fixed a bug in `http-wordpress-users.nse` that could cause extraneous output to be captured as part of a username.

[1]: https://github.com/a0rtega/pafish/pull/29 "GitHub Pull Request"
[2]: https://github.com/a0rtega/pafish/pull/31 "GitHub Pull Request"
[3]: https://github.com/a0rtega/pafish/issues/15 "GitHub Issue"
[4]: https://github.com/a0rtega/pafish/pull/34 "GitHub Pull Request"
[5]: https://github.com/a0rtega/pafish/pull/35 "GitHub Pull Request"
[6]: https://github.com/a0rtega/pafish/pull/37 "GitHub Pull Request"
[7]: https://github.com/a0rtega/pafish/pull/39 "GitHub Pull Request"
[8]: https://github.com/ptoomey3/evilarc/pull/3 "GitHub Pull Request"
[9]: https://github.com/inliniac/suricata/pull/482 "GitHub Pull Request"
[10]: https://github.com/inliniac/suricata/pull/544 "GitHub Pull Request"
[11]: https://github.com/inliniac/suricata/pull/734 "GitHub Pull Request"
[12]: https://github.com/inliniac/suricata/pull/1105 "GitHub Pull Request"
[13]: https://github.com/inliniac/suricata/pull/1254 "GitHub Pull Request"
[14]: https://github.com/inliniac/suricata/pull/2252 "GitHub Pull Request"
[15]: https://github.com/dma-ais/AisLib/pull/1 "GitHub Pull Request"
[16]: https://github.com/tony19/logback-android/pull/34 "GitHub Pull Request"
[17]: http://nmap.org/changelog.html "Change Log"
[18]: https://github.com/PUNCH-Cyber/stoq-plugins-public/pull/22 "GitHub Pull Request"
[19]: https://github.com/cea-sec/ivre/pull/601 "GitHub Pull Request"
[20]: https://github.com/cea-sec/ivre/pull/631 "GitHub Pull Request"
[21]: https://github.com/cea-sec/ivre/pull/634 "GitHub Pull Request"
[22]: https://github.com/cea-sec/ivre/pull/635 "GitHub Pull Request"
[23]: https://github.com/PUNCH-Cyber/stoq-plugins-public/pull/44 "GitHub Pull Request"
[24]: https://github.com/PUNCH-Cyber/stoq-plugins-public/pull/107 "GitHub Pull Request"
[25]: https://github.com/astryzia/bash-portscanner/pull/1 "GitHub Pull Request"
[26]: https://github.com/rapid7/metasploit-framework/pull/17564 "GitHub Pull Request"
