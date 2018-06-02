+++
banner = "/uploads/2016/09/wordpress-to-hugo.png"
categories = [ "Linux" ]
date = "2016-09-14T19:14:28+02:00"
excerpt = "Finally finished migrating from WordPress to Hugo..."
format = "post"
tags = [ "LEMP", "Hugo", "WordPress" ]
title = "Migrated From WordPress to Hugo"

+++

I have been using WordPress since I started blogging, but since then, the blogging landscape changed a lot. Welcome to the age of static site generators.

<!--more-->

WordPress is a very good Content Management System (CMS), but with it comes maintenance. There is a lot of time spent applying updates (most of them security related) and ensuring that all the required middleware (i.e. PHP, MariaDB, etc.) is running in tip top condition. With the WordPress updates, I also had to update the customizations I created for the theme every time there was a new version in order to ensure everything was working properly. Mostly due to the parent/child theme architecture of WordPress.

There is also something that irritated me a little, the page generation process. I'm not talking about the speed, but rather the output of the generation. It is very hard if not impossible to generate a clean page that doesn't have CSS or JavaScript all over the place.

For those reasons, I decided to search for alternatives to traditional CMSs. After a little searching, I found that static site generators have been getting a lot of traction for a while, and were in a stage that they can be considered production ready.

In the end, decided to go for Hugo, not because I perceived it to be simpler than its competitors, or more feature rich, but  because it was the simplest to start using. No dependencies, just a simple executable. The only thing I struggled with, was Go Templates and their inability to handle variable scoping properly. Other than that it was a pretty good experience. Got to clean my web server of all the dependencies required by WordPress and in exchange got a cleaner and faster web site.

Now back to creating content :D
