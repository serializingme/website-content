+++
banner = "/uploads/2015/06/emofishes-row.png"
categories = [ "Malware", "Virtualization", "Windows" ]
date = "2015-06-26T10:44:13+00:00"
excerpt = "Emofishes is a collection of proof of concepts that help improve, bypass or detect virtualized malware analysis environments..."
format = "post"
tags = [ "Curious Fish", "Emofishes", "Paranoid Fish" ]
title = "Emotional Fishes are Emotional"

+++

Following my research with [Pafish][1] and subsequent development of [Cufish][2], I decided to create the [Emofishes][3] (Emotional Fishes) project.

<!--more-->

I had created a pull request seeking to integrate Cufish into Pafish, but after a short exchange of ideas with Alberto (Pafish maintainer), it was decided that Cufish was better fit in its own project. Since I'm still doing research in virtualized malware execution environments, it is likely that other tools and proof concepts will be published so I decided to create this new project that will contain all the code of tools and proof of concepts I will develop over time.

All code is licensed under GPLv3 and can be easily compiled with MinGW. As an example to compile Cufish:

{{< gist serializingme f127fbad352aeb023b29 "compile-instructions.sh" >}}

Under the `dist` directory there are compiled versions ready to be executed. All art present on the project (fishes images) and in the post banner image is courtesy of [Fasticon Design][4].

[1]: /2015/05/28/a-paranoid-fish-and-silver-bullets/ "Blog Post"
[2]: /2015/06/12/curious-fish-is-curious/ "Blog Post"
[3]: /project/emofishes/ "Project Page"
[4]: http://fasticon.com/ "Fasticon Design"
