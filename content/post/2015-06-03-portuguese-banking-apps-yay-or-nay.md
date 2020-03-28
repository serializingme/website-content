+++
banner = "/uploads/2015/06/barclays-app.png"
categories = [ "Case Study", "Reverse Engineering" ]
date = "2015-06-03T20:46:43+00:00"
excerpt = "This is an account of my findings on seven online banking apps available in the Portuguese market..."
format = "post"
tags = [ "ActivoBank", "Android", "Banco Popular", "Banco Português de Investimento", "Banking", "Barclays", "Caixa Geral de Depósitos", "Caixadirecta", "Millennium", "Novo Banco", "TLS" ]
title = "Portuguese Banking Apps, Yay or Nay?"

+++

I have been using my bank mobile application for a while, but never had a look at its security. This is an account of my findings, not only on that specific application, but on eight of the offerings available in the Portuguese market.

<!--more-->

I have focused my research in one of the most important aspects of any type of banking applications, how secure are the communications with the bank systems (API endpoints). In simple terms, how hard would it be for a threat actor to intercept and subsequently decrypt the mobile application communications in order to impersonate the user.

{{< alert >}}This research targeted only the *Android* version of the applications and any communications of the applications with services other than the API endpoints, was ignored.{{< /alert >}}

* ActivoBank and Millennium (same base application and endpoint)
* Banco Popular
* Barclays
* BPI App (Banco Português de Investimento)
* Caixadirecta (Caixa Geral de Depósitos, CGD)
* NBapp (Novo Banco)
* Santander Totta

What follows is the grade of resilience against attack by both the endpoint, and the application of each bank. The higher the grade (being A+ the best, and F the worst), the harder is for a threat actor to successfully attack the communications.

{{< alert >}}The _higher_ the points, the easier it is to attack the communications (values range from 1 to 6).{{< /alert >}}

{{< alert class="warning" >}}The application tests were limited to how the endpoint certificate is validated. TLS/SSL support (protocols, cipher suites, etc.) wasn't tested, since the Android platform varies widely in versions, and by consequence, so will the TLS/SSL implementation/features.{{< /alert >}}

{{< html >}}
<table class="table table-bordered">
  <thead>
    <tr>
      <th style="text-align: center; vertical-align: middle;" rowspan="2">Bank</th>
      <th style="text-align: center; vertical-align: middle;" colspan="2">Points</th>
      <th style="text-align: center; vertical-align: middle;" rowspan="2">Grade</th>
    </tr>
    <tr>
      <th style="text-align: center; vertical-align: middle;">Endpoint</th>
      <th style="text-align: center; vertical-align: middle;">Application</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Barclays</td>
      <td style="text-align: center; vertical-align: middle;">2,267</td>
      <td style="text-align: center; vertical-align: middle;">1</td>
      <td style="color: #4ec83d; text-align: center; vertical-align: middle;">A</td>
    </tr>
    <tr>
      <td>CGD
      </td><td style="text-align: center; vertical-align: middle;">2,367</td>
      <td style="text-align: center; vertical-align: middle;">1,5</td>
      <td style="color: #4ec83d; text-align: center; vertical-align: middle;">A-</td>
    </tr>
    <tr>
      <td>Santander Totta</td>
      <td style="text-align: center; vertical-align: middle;">1,833</td>
      <td style="text-align: center; vertical-align: middle;">2</td>
      <td style="color: #4ec83d; text-align: center; vertical-align: middle;">A-</td>
    </tr>
    <tr>
      <td>ActivoBank</td>
      <td style="text-align: center; vertical-align: middle;" rowspan="2">1,833</td>
      <td style="text-align: center; vertical-align: middle;" rowspan="2">2</td>
      <td style="color: #4ec83d; text-align: center; vertical-align: middle;" rowspan="2">A-</td>
    </tr>
    <tr>
      <td>Millennium</td>
    </tr>
    <tr>
      <td>BPI</td>
      <td style="text-align: center; vertical-align: middle;">2,233</td>
      <td style="text-align: center; vertical-align: middle;">2</td>
      <td style="color: #009ddf; text-align: center; vertical-align: middle;">B</td>
    </tr>
    <tr>
      <td>Novo Banco</td>
      <td style="text-align: center; vertical-align: middle;">2,267</td>
      <td style="text-align: center; vertical-align: middle;">2</td>
      <td style="color: #009ddf; text-align: center; vertical-align: middle;">B</td>
    </tr>
    <tr>
      <td>Banco Popular</td>
      <td style="text-align: center; vertical-align: middle;">6</td>
      <td style="text-align: center; vertical-align: middle;">5,5</td>
      <td style="color: #ef251e; text-align: center; vertical-align: middle;">F</td>
    </tr>
  </tbody>
</table>
{{< /html >}}

{{< html >}}
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>Starting from the top, the Barclays endpoint could improve in three points, uses a weak signature algorithm, still supports weak cipher suites and doesn't support forward secrecy. The application on the other hand, couldn't do it any better, since it is pinning the certificate that the server should present. That renders man-in-the-middle (MiTM) attacks impossible.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2015/06/barclays-error.png" alternative="Barclays error" caption="MiTM was being performed." thumbnail="/uploads/2015/06/barclays-error-169x300.png" >}}
  </div>
</div>
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>The CGD endpoint could improve in two points, only supports TLS 1.0 and doesn't support forward secrecy. The application does certificate pinning, but only to the level of the root certificate authority.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2015/06/cgd-error.png" alternative="CGD error" caption="MiTM was being performed." thumbnail="/uploads/2015/06/cgd-error-169x300.png" >}}
  </div>
</div>
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>With the same exact points, both in the endpoint and in the application, Santander Totta, ActivoBank and Millennium can improve by deploying better forward secrecy support, enabling TLS downgrade prevention, increase the cipher suite strength, and add certificate pinning to the application.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2015/06/activobank-error.png" alternative="Activobank error" caption="MiTM was being performed." thumbnail="/uploads/2015/06/activobank-error-169x300.png" >}}
  </div>
</div>
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>BPI and Novo Banco, have in common weak cipher suites, no forward secrecy and no certificate pinning. Novo Banco could also improve by increasing the signature algorithm strength while BPI could improve by supporting TLS versions higher than 1.0 and prevent TLS downgrade.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2015/06/bpi-error.png" alternative="BPI error" caption="MiTM was being performed." thumbnail="/uploads/2015/06/bpi-error-169x300.png" >}}
  </div>
</div>
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>The worst of the test, was Banco Popular, both in the endpoint and in the application. The endpoint is vulnerable to POODLE, supports the Export algorithms (very insecure), TLS only goes up to version 1.0, supports both SSL 2 and SSL 3 (both vulnerable to all sorts of attacks), does not support forward secrecy and does not prevent TLS downgrade.</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2015/06/bpopular-warning-001.png" alternative="Banco Popular warning" caption="Warning asking the user if he/she wants to continue." thumbnail="/uploads/2015/06/bpopular-warning-001-169x300.png" >}}
  </div>
</div>
<div class="row">
  <div class="col-md-7 col-sm-6">
    <p>In the application, there is validation of the certificate presented by the endpoint, but the application ask if the user wants to continue, leaving to the user the choice to continue over an insecure connection (most users will do the wrong choice!). Anyone using this application, is risking a bank account compromise and consequently, financial loss. The verdict is to stay clear from using it!</p>
  </div>
  <div class="col-md-5 col-sm-6">
  {{< figure image="/uploads/2015/06/bpopular-warning-002.png" alternative="Banco Popular warning" caption="Credentials being submitted since the user choose to continue." thumbnail="/uploads/2015/06/bpopular-warning-002-169x300.png" >}}
  </div>
</div>
{{< /html >}}

There is still a lot of room for improvement, but overall, it was a nice surprise to verify that almost all the applications fared quite well on the tests.
