# Auditoria completa do referencias.bib

Escopo: todas as 92 entradas originais (89 após remoção de 3 duplicatas). Método: cada DOI/metadado foi confrontado com a fonte real (página do publisher, IEEE Xplore, ACM DL, Springer, MDPI, Semantic Scholar, dblp, HAL). Nenhuma correção foi aplicada sem verificação; o que não pôde ser verificado está listado com instrução de validação manual.

Resultado da checagem de integridade: toda `\cite{}` dos `.tex` resolve para uma entrada do bib (zero chaves quebradas).

---

## 1. CORRIGIDAS NESTA AUDITORIA (verificadas contra a fonte)

| Entrada | Erro encontrado | Correção aplicada |
|---|---|---|
| blinowski2022monolithic | "DOI" era ID do Xplore; tipo errado | @article, IEEE Access 10:20357-20374, DOI 10.1109/ACCESS.2022.3152803 |
| oumoussa2024evolution | idem | @article, IEEE Access 12:23389-23405, DOI 10.1109/ACCESS.2024.3365079 |
| deLauretis2019from | tinha o ID do Xplore DO PAPER DO OUMOUSSA (entrada cruzada) | ISSREW 2019, pp. 93-96, DOI 10.1109/ISSREW.2019.00050 |
| salii2023migrating | ID do Xplore como DOI | MIPRO 2023, pp. 1670-1677, DOI 10.23919/MIPRO57284.2023.10159894 |
| berry2024isItWorth | idem | IEEE ICWS 2024, pp. 944-954, DOI 10.1109/ICWS62655.2024.00112 |
| arya2024beyond | idem | ACET 2024, pp. 1-6, DOI 10.1109/ACET61898.2024.10730456 |
| jin2021 | DOI e páginas errados | DOI 10.1109/TSE.2019.2910531; pp. 987-1007 (confirmar pp., ver §2) |
| gysel2016service | capítulo errado no DOI (_13) | DOI 10.1007/978-3-319-44482-6_12 |
| alshuqayran2016systematic | autores errados ("Noor/Noor/Richard"); pp. 1-9 | Nuha Alshuqayran, Nour Ali, Roger Evans; pp. 44-51 |
| dragoni2017microservices | lista de autores de OUTRO capitulo do Dragoni | Dragoni, Giallorenzo, Lluch Lafuente, Mazzara, Montesi, Mustafin, Safina |
| kazanavicius2019 | DOI com dígito errado (8732172) | 10.1109/eStream.2019.8732170 |
| taibi2018definition | TITULO INEXISTENTE ("Defining microservices architectural style", ICSA-C) | Substituído pela obra real mais próxima dos mesmos autores/ano: "Architectural Patterns for Microservices: A SMS", CLOSER 2018, pp. 221-232, DOI 10.5220/0006798302210232. **REVISAR encaixe das 2 citações no Cap2 (linhas ~24 e ~28)** |
| crowne2002 | volume 331 (inexistente) e sem DOI | vol. 1, DOI 10.1109/IEMC.2002.1038454 |
| paternoster2014 | sem DOI | DOI 10.1016/j.infsof.2014.04.014 |
| stranglerPatterns | sem venue/fonte | PLoP 2020 + URL hillside.net |
| vitharana2024challenges | sem journal/vol/pp. | ACM Queue 22(1):48-72 |
| bozan2020transition | sem journal; ano 2020 (online-first) | CACM 64(1):79-85, ano 2021 |
| wolfart2021 / lima2024 / tsechelidis2023 / ng2024 / jatkiewicz2023 | sem booktitle | EASE 2021 / SBQS 2024 / eSAAM 2023 / ICIIT 2024 (pp. 536-541) / SAC 2023 (pp. 1038-1041) |
| prakash2024systematic | ID do Xplore como DOI | venue/pp. adicionados (TRONSHOW 2024, pp. 1-8); DOI inválido removido; DOI real: manual (§2) |
| hmue2024microservices, nassima2024dynamic | ID do Xplore como DOI | DOI inválido removido; existência confirmada no Xplore; DOI real: manual (§2) |
| griffin2022moving | ID do Xplore como DOI; obra NÃO ENCONTRADA fora do Xplore | DOI inválido removido + comentário de alerta no bib (§2) |

Corrigidas no commit anterior (a6657d4): rocha2021catalogingDI (Laigner et al. 2022, JSS 184:111125), abgaz2023decomposition (TSE 49(8):4213-4242), montesi2021sliceable (SCC, pp. 364-366), gravanis2021dont (ESSE/ACM) + baselines adicionadas (taibi2018smells, neri2020multivocal, cerny2023tertiary, garousi2019mlr).

## 2. VALIDAR MANUALMENTE (não foi possível confirmar daqui)

Para cada item, abra o link com seu acesso institucional e compare título/autores; copie o DOI exibido no campo "DOI:" da página.

1. **prakash2024systematic**, DOI real: https://ieeexplore.ieee.org/document/10826056 (o PDF do paper não traz DOI; ISBN do TRONSHOW 978-4-89362-412-3 confirmado e adicionado)
2. ~~hmue2024microservices~~ RESOLVIDO via PDF do paper: ICAIT 2024, DOI 10.1109/ICAIT65209.2024.10754922 (obs.: entrada segue não citada em nenhum .tex)
3. **nassima2024dynamic**, venue + DOI: https://ieeexplore.ieee.org/document/10697026
4. **griffin2022moving**, EXISTÊNCIA/título/autores/DOI: https://ieeexplore.ieee.org/document/9984719 (não achei esta obra em nenhuma outra base; entrada NÃO é citada; recomendo remover se não confirmar)
5. **jin2021**, páginas 987-1007: confirmar em https://doi.org/10.1109/TSE.2019.2910531
6. **gysel2016service**, páginas 185-200: confirmar em https://doi.org/10.1007/978-3-319-44482-6_12
7. **lima2024accelerating**, lista de autores: confirmar em https://doi.org/10.1145/3701625.3701632
8. **bozan2020transition**, ano alterado 2020→2021 (edição CACM 64(1) é jan/2021): confirmar em https://doi.org/10.1145/3378064
9. **taibi2018definition**, encaixe de conteúdo: reler Cap2 linhas ~24 e ~28 com o paper substituto (CLOSER 2018)

Como validar qualquer DOI manualmente: cole `https://doi.org/<DOI>` no navegador; a página de destino deve exibir exatamente o título e autores da entrada. Alternativa: https://search.crossref.org (busque pelo título).

## 3. VERIFICADAS SEM ALTERAÇÃO

alqoran2025mma (MDPI) · parnas1972informationhiding (CACM, DOI canônico) · lehman1980programs (Proc. IEEE, DOI canônico) · fritzsch2019 (ICSME, pp. 481-490) · su2024modular (ACM SATrends) · su2024from (Electronics) · ghemawat2023towards (HotOS) · dragoni2017 (DOI/pp.) · gysel2016 (volume/série) · kitchenham2007 (relatório técnico EBSE, citação padrão) · johnson2024serviceweaver (arXiv 2404.09357; manter rotulado como preprint) · fowler2014/2015/2020 (bliki/martinfowler.com, URLs estáveis) · jovanovic2024rewriting, shopify2020monolith, thoughtworks2017fitnessfunction (URLs vistas ativas durante esta sessão).

## 4. LIVROS (16) — risco baixo, validação opcional por ISBN

Todos são títulos canônicos e conferem com editora/ano: Evans 2003, Richardson 2018, Ford/Parsons/Kua 2017, Brooks 1995, Yourdon & Constantine 1979, Fairbanks 2010, Beck 1999, Foote & Yoder 1999 (capítulo PLoPD4), Ries 2011, Blank & Dorf 2012, Weinberg & Mares 2015, Marks 2013, Doerr 2018, Marr (KPI) 2020, Ravikant 2020, fowler2002patterns (PoEAA 2002). Validação manual: buscar o ISBN da entrada em https://search.worldcat.org.

## 5. GREY/ONLINE (~26) — checagem por clique

Conferir se cada URL abre e o título bate (úteis para `urldate`): conway2003, fowler2003, tilkov2015, dhh2021, segment2023, auth02019, medium2019, shopify2022, garg2023, celozzi2020, primevideo2023, grzybek2020modular, martin2011screaming, martin2012clean, cockburn2005hexagonal, palermo2008onion, shaw2018vertical, fowler2015presentationdomaindatalayering, demandsage2023, chesky2024, graham2012, osci2024, nx2024, tinystore2026 (este revela sua autoria; já mapeado no plano de anonimização do paper).

## 6. DUPLICATAS RESOLVIDAS

- `parnas1972criteria` removida (idêntica a `parnas1972informationhiding`); citação única retargetada em `foundations-...-g1-g2-g3.tex`.
- `fowler2002` removida (idêntica a `fowler2002patterns`); citações retargetadas em `g1_modular.tex` e `Cap2/cap2.tex`.
- `graham2012growth` removida (idêntica a `graham2012`; não era citada).
- `conway2003` × `fowler2003`: mesmo título, fontes distintas (melconway.com vs martinfowler.com); NÃO são duplicatas; mantidas.

## 7. ENTRADAS NO BIB SEM CITAÇÃO NOS .TEX (informativo; não renderizam)

cerny2023tertiary, garousi2019mlr, neri2020multivocal, taibi2018smells (adicionadas de propósito como baseline do paper SBCARS) · fowler2003 · fowler2015presentationdomaindatalayering · vitharana2024challenges · griffin2022moving · hmue2024microservices (estas três últimas: citar ou remover).


## 8. CONFIRMAÇÃO PADRÃO-OURO VIA PDFs (texto integral fornecido pelo autor)

Verificados diretamente na primeira página dos papers: abgaz (TSE 49(8), p.4213, DOI ok), arya (ACET, DOI ok), berry (ICWS 2024, DOI ok), blinowski (IEEE Access, DOI ok), cerny (JSS 206:111829), deLauretis (ISSREW, DOI ok), ghemawat (DOI ok), gravanis (DOI ok), hmue (ICAIT 2024, DOI obtido), montesi (SCC, DOI ok), ng (DOI ok), prakash (ISBN TRONSHOW; sem DOI impresso), strangler (PLoP, ISBN 978-1-941652-16-9), su2024from (Electronics, DOI ok), su2024modular (preprint conferido; DOI ACM já validado), johnson2024serviceweaver (arXiv 2404.09357), tsechelidis (eSAAM, DOI ok), vitharana (layout ACM Queue), wolfart (EASE, DOI ok), garousi2019 (guidelines; e o paper EASE 2016 'The need for MLRs' foi ADICIONADO ao bib como garousi2016need), colanzi2021industry (SBCARS 2021, DOI 10.1145/3483899.3483904, ADICIONADO; estava na RSL mas faltava no bib).

Pendentes manuais remanescentes: prakash (DOI do Xplore), nassima (venue+DOI), griffin (existência; não citado), jin (páginas), gysel (páginas), lima (autores), bozan (ano 2021), taibi2018definition (encaixe das citações no Cap2).