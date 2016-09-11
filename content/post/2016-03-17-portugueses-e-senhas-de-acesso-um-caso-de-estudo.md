+++
banner = "/uploads/2016/03/wordcloud.png"
date = "2016-03-17T22:14:13+00:00"
categories = [ "Case Study", "Education" ]
excerpt = "Caso de estudo basead em três listas de senhas de acesso de sítios portugueses..."
format = "post"
tags = [ "Passwords", "Portuguese", "Portugueses", "Senhas" ]
title = "Portugueses e Senhas de Acesso, Um Caso de Estudo"

+++

Nos últimos anos tenho tido a oportunidade de coleccionar várias listas de senhas de acesso. O que se segue é um caso de estudo focado em três dessas listas. Sendo que estas, são de sítios portugueses.

<!--more-->

Destes três sítios, foram analisadas 377.887 senhas de acesso, das quais 248.270 são únicas (65,7%). Ao analisar as listas de senhas, algumas ocorrências já habituais saltam à vista, como `12345`, `123456`, `password` e `qwerty`. Também parece existir uma tendência para se utilizar nomes de clubes de futebol (por exemplo, `benfica`, `sporting` e `fcporto`), nomes próprios (por exemplo, `ricardo`, `catarina` e `miguel`), e o nome dos sítios nos quais estão registados, por exemplo, `Site 1` e `Site 2` (o nome dos sítios foram substituídos por nomes fictícios).

{{< figure image="/uploads/2016/03/top-password.png" alternative="Top Senhas" >}}

No que toca ao comprimento das senhas, existe uma clara preferência pelas senhas de 6 a 8 caracteres.

{{< figure image="/uploads/2016/03/top-length.png" alternative="Top Comprimento" >}}

No total, as 377.887 senhas são constituídas por 2.831.757 caracteres/símbolos dos quais, 116 são únicos.

{{< figure image="/uploads/2016/03/top-characters.png" alternative="Top Caracteres" >}}
{{< figure image="/uploads/2016/03/top-symbols.png" alternative="Top Símbolos" >}}

Fazendo a análise da frequência de conjunto de caracteres (excluindo símbolos) torna-se claro que as senhas constituídas só por letras minúsculas são usadas de forma prevalecente. Seguida da combinação de minúsculas e números e posteriormente só de números.

{{< figure image="/uploads/2016/03/top-charactersets.png" alternative="Top Conjuntos de Caracteres" >}}

No caso específico dos números, é possível encontrar várias combinações semelhantes a números de telemóveis. A distribuição entre os três operadores nacionais é bastante interessante, talvez reflectindo o mercado de telecomunicações móveis na data de criação das listas.

{{< figure image="/uploads/2016/03/top-mobile.png" alternative="Top Números de Telemóvel" >}}

Em conclusão, os portugueses não são muito bons a escolher senhas de acesso, utilizando senhas que podem facilmente ser descobertas visto que, muitas destas são palavras de dicionário. De uma forma geral a entropia das senhas é baixa com um conjunto de caracteres reduzido. Desejos de boas escolhas x)