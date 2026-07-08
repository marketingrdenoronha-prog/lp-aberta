/* =========================================================
   Diagnóstico — multi-step form logic (data-driven)
   Para editar/adicionar perguntas, mexa apenas no array QUESTIONS.
   O contador ("PERGUNTA X DE N") e a barra de progresso se
   ajustam automaticamente ao total de perguntas.
   ========================================================= */

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

  /* --- PERGUNTAS 5 e 6: placeholders editáveis ---------------------
     Substitua o conteúdo abaixo quando definir as perguntas finais.
     A estrutura (type/title/help/options) segue o mesmo padrão acima. */
  {
    type: 'choice',
    title: 'Já investe em anúncios hoje?',
    help: 'Pra entender o momento da operação.',
    key: 'investe',
    options: [
      'Sim, com agência',
      'Sim, por conta própria',
      'Já investi e parei',
      'Nunca investi'
    ]
  },
  {
    type: 'text',
    title: 'O que você espera dessa parceria?',
    help: 'Em uma frase, qual o resultado que você quer.',
    placeholder: 'Escreva aqui...',
    inputType: 'text',
    key: 'objetivo',
    isLast: true
  }
];

var state = { step: 0, answers: {} };

var card = document.getElementById('card');
var bar = document.getElementById('progressBar');
var label = document.getElementById('progressLabel');

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

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
        'placeholder="' + q.placeholder + '" value="' + current.replace(/"/g, '&quot;') + '" />' +
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
      return '<button class="option' + sel + '" data-val="' + opt.replace(/"/g, '&quot;') + '">' +
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
        '<span class="hint">selecione uma opção</span>' +
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

function finish() {
  bar.style.width = '100%';
  label.textContent = 'CONCLUÍDO';
  var nome = (state.answers.nome || '').split(' ')[0];
  card.innerHTML =
    '<div class="done">' +
      '<div class="check">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '</div>' +
      '<h2>Recebido' + (nome ? ', ' + nome : '') + '!</h2>' +
      '<p>Nossa equipe vai analisar as informações e retornar pelo seu WhatsApp em até 48h com o diagnóstico do seu funil de aquisição.</p>' +
      '<a class="btn btn-primary" href="index.html">Voltar ao início</a>' +
    '</div>';
  // TODO: integrar com backend / CRM / WhatsApp API.
  // Os dados coletados estão em: state.answers
  console.log('Respostas do diagnóstico:', state.answers);
}

render();
