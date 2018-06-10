+++
date = "2016-09-08T19:54:00+00:00"
excerpt = "SerializingMe responsible security vulnerabilities disclosure (bug bounty) program rules, scope and how to report."
title = "Security"

+++

I appreciate the efforts of fellow security researchers and provide secure means for disclosing security vulnerabilities responsibly. As a reward, I will feature in the [hall of fame][2] the name, handle (e.g. Twitter) and/or website of the reporter of any valid vulnerability. Additional rewards are at my discretion.

## Scope and Rules

A positive outcome of the validation of a submitted vulnerability can only be achieved if the following rules and scope are respected by the researcher.

### Rules

The researcher __shall not__:

* Use of automated tools to find vulnerabilities.
* Conduct non-technical attacks (e.g. social engineering, phishing, etc.).
* Perform any attack to systems that aren't listed under the scope section.
* Perform any attack that could harm the reliability or integrity of target systems (e.g. denial of service, spam, etc.).

The researcher __shall__:

* Respect responsible disclosure principles independently of the time taken to validate the report.
* If it is noticeable any performance degradation of the target systems, all testing must be immediately suspended.

Vulnerabilities report __will__ be accepted as long as:

* Any materials related with the vulnerability aren't hosted on a public platform (e.g. YouTube) without prior consent.
* Hasn't already been submitted by another researcher, or it isn't already known.
* The risk represented by the vulnerability isn't considered acceptable.
* The affected systems are in scope as defined bellow.

### Scope

Any system that can be reached through a `serializing.me` (sub-)domain, with the notable exception of `www.serializing.me` that is hosted by [GitHub][3], are in scope. Also take into account that the following vulnerabilities types are specifically __excluded__:

* Descriptive error messages (e.g. Stack Traces, application or server errors).
* HTTP 404 codes/pages or other HTTP non-200 codes/pages.
* Fingerprinting or banner disclosure on common/public services.
* Disclosure of known public files or directories (e.g. robots.txt, etc.)
* Clickjacking and issues only exploitable through clickjacking.
* Lack of Secure/HTTPOnly flags on non-sensitive cookies.
* Lack of security speedbump when leaving the website.
* OPTIONS HTTP method enabled.
* Missing HTTP security headers (e.g. Strict-Transport-Security, X-Frame-Options, etc.)
* TLS issues and attacks (e.g. BEAST, BREACH, forward secrecy not enabled, etc.)

## How to Report

Please contact me2 using the GPG/PGP key as shown in the [contact][1] page.

[1]: /contacts/ "Contact Page"
[2]: /security/hall-of-fame/ "Hall of Fame"
[3]: https://www.github.com/ "GitHub"
