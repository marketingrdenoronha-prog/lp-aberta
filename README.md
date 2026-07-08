# Beam Mídia Digital — Landing Page (São José do Rio Preto)

Landing page da Beam Mídia Digital, assessoria de Meta Ads e Google Ads para PMEs de **São José do Rio Preto**. Clone da versão de Florianópolis, com toda a copy adaptada para Rio Preto.

## Estrutura

```
index.html          Landing page principal (hero, método, parceiros, FAQ, etc.)
diagnostico.html    Formulário de diagnóstico (CTA de todos os botões)
css/styles.css      Estilos da landing page
css/form.css        Estilos do formulário
js/main.js          Accordion do FAQ
js/form.js          Lógica do formulário multi-etapas (data-driven)
assets/img/         Imagens (placeholders SVG — trocar pelas fotos reais)
```

## Como rodar

É um site estático. Abra `index.html` no navegador ou sirva a pasta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Editar as perguntas do formulário

Todas as perguntas ficam no array `QUESTIONS` em `js/form.js`. O contador
("PERGUNTA X DE N") e a barra de progresso se ajustam automaticamente ao total.

> As perguntas **5 e 6** estão como placeholders editáveis — substitua o
> conteúdo quando as perguntas finais forem definidas.

Ao concluir, as respostas ficam em `state.answers` (ver `finish()`), pronto
para integrar com CRM / WhatsApp / backend.

## Trocar as imagens

Substitua os arquivos em `assets/img/` (hero, office-1..4, founders) pelas
fotos reais, mantendo os mesmos nomes — ou ajuste os caminhos no HTML.
