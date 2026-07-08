/* =========================================================
   Diagnóstico — formulário multi-etapas + motor de leitura
   ---------------------------------------------------------
   - Perguntas no array QUESTIONS (contador e barra automáticos).
   - A tela final NÃO é fixa: o motor buildDiagnosis() lê as
     respostas (faturamento, verba de ads e urgência), define o
     perfil do lead e personaliza a leitura, a prioridade e o CTA.
   ========================================================= */

/* Troque pelo WhatsApp real da Beam (só dígitos, com DDI 55). */
var WHATSAPP = '5517000000000';

var QUESTIONS = [
  {
    type: 'text',
    title: 'Como podemos te chamar?',
    help: 'Pra direcionar a conversa de forma mais pessoal.',
    placeholder: 'Seu nome',
    inputType: 'text',
    key: 'nome'
  },
  {
    type: 'text',
    title: 'Qual seu WhatsApp?',
    help: 'É por onde devolvemos a análise.',
    placeholder: '(00) 00000-0000',
    inputType: 'tel',
    key: 'whatsapp',
    mask: 'phone'
  },
  {
    type: 'text',
    title: 'Qual o Instagram da empresa?',
    help: 'Ajuda no diagnóstico antes da call.',
    placeholder: '@suaempresa',
    inputType: 'text',
    key: 'instagram'
  },
  {
    type: 'choice',
    title: 'Qual o faturamento mensal da empresa?',
    help: 'Pra calibrar a análise ao porte da operação.',
    key: 'faturamento',
    options: [
      'Até R$ 30 mil',
      'R$ 30 mil a R$ 50 mil',
      'R$ 50 mil a R$ 100 mil',
      'R$ 100 mil a R$ 250 mil',
      'R$ 250 mil a R$ 500 mil',
      'Acima de R$ 500 mil'
    ]
  },
  {
    type: 'choice',
    title: 'Quanto investe em ads por mês?',
    help: 'Verba atual ou pretendida em mídia paga.',
    key: 'investimento',
    options: [
      'Ainda não investe',
      'Até R$ 2 mil/mês',
      'R$ 2 mil a R$ 5 mil/mês',
      'R$ 5 mil a R$ 10 mil/mês',
      'R$ 10 mil a R$ 25 mil/mês',
      'Acima de R$ 25 mil/mês'
    ]
  },
  {
    type: 'choice',
    title: 'Qual a urgência pra começar?',
    help: 'Última pergunta. Sua análise sai em até 48h.',
    key: 'urgencia',
    hint: 'selecione pra enviar',
    isLast: true,
    options: [
      'Imediata, até 30 dias',
      'Planejando para os próximos 3 meses',
      'Ainda pesquisando opções'
    ]
  }
];

var state = { step: 0, answers: {} };

var card = document.getElementById('card');
var bar = document.getElementById('progressBar');
var label = document.getElementById('progressLabel');
var topProgress = bar ? bar.parentNode : null;

function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function maskPhone(v) {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 2) return v.length ? '(' + v : v;
  if (v.length <= 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2);
  if (v.length <= 10) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
  return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
}

function updateProgress() {
  var total = QUESTIONS.length;
  var pct = ((state.step + 1) / total) * 100;
  bar.style.width = pct + '%';
  label.textContent = 'PERGUNTA ' + (state.step + 1) + ' DE ' + total;
}

function render() {
  updateProgress();
  var q = QUESTIONS[state.step];
  var isFirst = state.step === 0;
  var nextLabel = q.isLast ? 'Agendar diagnóstico →' : 'Continuar →';

  if (q.type === 'text') {
    var current = state.answers[q.key] || '';
    card.innerHTML =
      '<div class="step-num">' + pad2(state.step + 1) + '</div>' +
      '<h1 class="q-title">' + q.title + '</h1>' +
      '<p class="q-help">' + q.help + '</p>' +
      '<input class="text-input" id="field" type="' + q.inputType + '" ' +
        'placeholder="' + q.placeholder + '" value="' + esc(current) + '" />' +
      '<div class="actions">' +
        (isFirst ? '' : '<button class="btn btn-back" id="back">← Voltar</button>') +
        '<button class="btn btn-primary" id="next">' + nextLabel + '</button>' +
      '</div>';

    var field = document.getElementById('field');
    field.focus();
    if (q.mask === 'phone') {
      field.addEventListener('input', function () { field.value = maskPhone(field.value); });
    }
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); goNext(); }
    });
    document.getElementById('next').addEventListener('click', goNext);
  } else if (q.type === 'choice') {
    var selected = state.answers[q.key];
    var opts = q.options.map(function (opt, i) {
      var keyChar = String.fromCharCode(65 + i);
      var sel = selected === opt ? ' selected' : '';
      return '<button class="option' + sel + '" data-val="' + esc(opt) + '">' +
               '<span class="key">' + keyChar + '</span>' + opt +
             '</button>';
    }).join('');
    card.innerHTML =
      '<div class="step-num">' + pad2(state.step + 1) + '</div>' +
      '<h1 class="q-title">' + q.title + '</h1>' +
      '<p class="q-help">' + q.help + '</p>' +
      '<div class="options">' + opts + '</div>' +
      '<div class="actions">' +
        (isFirst ? '' : '<button class="btn btn-back" id="back">← Voltar</button>') +
        '<span class="hint">' + (q.hint || 'selecione uma opção') + '</span>' +
      '</div>';

    card.querySelectorAll('.option').forEach(function (b) {
      b.addEventListener('click', function () {
        state.answers[q.key] = b.getAttribute('data-val');
        card.querySelectorAll('.option').forEach(function (o) { o.classList.remove('selected'); });
        b.classList.add('selected');
        setTimeout(goNext, 220);
      });
    });
  }

  var back = document.getElementById('back');
  if (back) back.addEventListener('click', goBack);
}

function goNext() {
  var q = QUESTIONS[state.step];
  if (q.type === 'text') {
    var val = (document.getElementById('field').value || '').trim();
    if (!val) { document.getElementById('field').focus(); return; }
    state.answers[q.key] = val;
  }
  if (state.step < QUESTIONS.length - 1) {
    state.step++;
    render();
  } else {
    finish();
  }
}

function goBack() {
  if (state.step > 0) { state.step--; render(); }
}

/* =========================================================
   MOTOR DE LEITURA — decide o resultado a partir das respostas
   ========================================================= */
function buildDiagnosis(a) {
  var fat = { 'Até R$ 30 mil': 1, 'R$ 30 mil a R$ 50 mil': 2, 'R$ 50 mil a R$ 100 mil': 3,
              'R$ 100 mil a R$ 250 mil': 4, 'R$ 250 mil a R$ 500 mil': 5, 'Acima de R$ 500 mil': 6 }[a.faturamento] || 0;
  var inv = { 'Ainda não investe': 0, 'Até R$ 2 mil/mês': 1, 'R$ 2 mil a R$ 5 mil/mês': 2,
              'R$ 5 mil a R$ 10 mil/mês': 3, 'R$ 10 mil a R$ 25 mil/mês': 4, 'Acima de R$ 25 mil/mês': 5 }[a.investimento] || 0;
  var urg = { 'Imediata, até 30 dias': 3, 'Planejando para os próximos 3 meses': 2, 'Ainda pesquisando opções': 1 }[a.urgencia] || 0;

  var faturamento = a.faturamento || 'o porte informado';
  var verba = (a.investimento || '').toLowerCase();

  // Perfil do lead
  var tier;
  if (fat >= 4 && inv >= 3) tier = 'escala';
  else if (fat >= 3 && inv >= 1) tier = 'tracao';
  else if (fat >= 3 && inv === 0) tier = 'estruturar';
  else if (inv >= 1) tier = 'otimizar';
  else tier = 'inicio';

  var D = {
    escala: {
      badge: 'PRIORIDADE ALTA',
      insight: 'Pelo porte da operação (' + faturamento + ') e pela verba que você já roda em mídia, o maior espaço de ganho raramente está em "gastar mais" — está na estrutura de campanha, na oferta e na leitura de dado. É exatamente isso que a análise vai destrinchar.'
    },
    tracao: {
      badge: 'BOM ENCAIXE',
      insight: 'Você já valida produto e investe em mídia (' + verba + '). A análise vai focar em onde o funil está vazando lead e em como escalar a verba sem perder eficiência de aquisição.'
    },
    estruturar: {
      badge: 'POTENCIAL PARADO',
      insight: 'Sua operação fatura (' + faturamento + '), mas a mídia paga ainda está subaproveitada. A análise vai mostrar o volume de aquisição que hoje está parado e o caminho mais seguro pra ligar a máquina.'
    },
    otimizar: {
      badge: 'AJUSTE DE ROTA',
      insight: 'Você já investe em ads, mas no seu porte cada real precisa render mais. A análise vai apontar onde a verba está sendo desperdiçada e o que priorizar antes de aumentar o orçamento.'
    },
    inicio: {
      badge: 'BASE PRIMEIRO',
      insight: 'No seu momento de operação, escalar verba cedo é o erro mais caro. A análise vai priorizar a base — oferta, funil e primeiros criativos — pra você crescer com o menor risco possível.'
    }
  }[tier];

  var urgNote = {
    3: 'Você marcou urgência imediata — sua análise entra como prioridade na fila.',
    2: 'Como você está planejando os próximos meses, a análise já te entrega o mapa pra decidir com dado.',
    1: 'Mesmo em fase de pesquisa, você recebe um raio-x da operação, sem compromisso.'
  }[urg] || '';

  var priority = (tier === 'escala' || tier === 'tracao' || urg === 3);

  return { tier: tier, badge: D.badge, insight: D.insight, urgNote: urgNote, priority: priority };
}

function whatsappLink(a) {
  var msg = 'Olá! Sou ' + (a.nome || '') + ', acabei de preencher o diagnóstico da Beam.' +
            '\nFaturamento: ' + (a.faturamento || '-') +
            '\nInvestimento em ads: ' + (a.investimento || '-') +
            '\nUrgência: ' + (a.urgencia || '-') +
            (a.instagram ? '\nInstagram: ' + a.instagram : '');
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
}

function finish() {
  var a = state.answers;
  var d = buildDiagnosis(a);
  var nome = (a.nome || '').split(' ')[0];

  document.body.classList.add('result-mode');
  if (topProgress) topProgress.style.display = 'none';
  if (label) label.style.display = 'none';
  window.scrollTo(0, 0);

  var ctaBtn = d.priority
    ? '<a class="btn btn-primary result-cta" href="' + whatsappLink(a) + '" target="_blank" rel="noopener">Falar agora no WhatsApp →</a>'
    : '';

  card.innerHTML =
    '<div class="result">' +
      '<div class="kicker">' + d.badge + ' · SOLICITAÇÃO RECEBIDA</div>' +
      '<div class="kicker-bar"></div>' +
      '<h1>Sua análise do funil<br>está a caminho' + (nome ? ', ' + esc(nome) : '') + '.</h1>' +
      '<p class="intro">Um especialista da Beam vai mapear a sua operação e devolver a análise em até 48h, antes de qualquer proposta.</p>' +
      '<div class="insight">' +
        '<span class="tag">LEITURA PRELIMINAR</span>' +
        '<p>' + d.insight + '</p>' +
        (d.urgNote ? '<p class="urg">' + d.urgNote + '</p>' : '') +
      '</div>' +
      ctaBtn +
      '<div class="steps-box">' +
        '<div class="rstep"><span class="n">01</span><div><h3>Mapeamento do funil</h3><p>A equipe levanta o cenário atual: canais, criativos, métricas e pontos de vazamento de lead.</p></div></div>' +
        '<div class="rstep"><span class="n">02</span><div><h3>Entrega da análise em até 48h</h3><p>Você recebe o documento com os principais gargalos identificados e o maior espaço de ganho da operação.</p></div></div>' +
        '<div class="rstep"><span class="n">03</span><div><h3>Conversa estratégica (opcional)</h3><p>Se fizer sentido, agendamos uma conversa para revisar a análise juntos e desenhar os próximos passos.</p></div></div>' +
      '</div>' +
      '<div class="rfoot">' +
        '<a href="index.html">← Voltar para o site</a>' +
        '<span class="rbrand">BEAM.</span>' +
      '</div>' +
    '</div>';

  // TODO: enviar `state.answers` + perfil (d.tier) para o CRM / backend / WhatsApp API.
  console.log('Diagnóstico:', { answers: a, perfil: d.tier, prioridade: d.priority });
}

render();
