// Hero video — loop com crossfade suave entre as repetições.
// Cada vídeo toca até o FIM; ~1s antes do fim o outro entra por baixo
// e fazemos o cross-fade de opacidade, evitando o corte seco do loop.
(function heroLoop() {
  var a = document.getElementById('heroVidA');
  var b = document.getElementById('heroVidB');
  if (!a || !b) return;

  var FADE = 1.0;            // segundos de sobreposição/crossfade
  var cur = a, nxt = b, armed = false;
  cur.classList.add('is-active');

  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  function onTime(v) {
    if (v !== cur || !cur.duration || isNaN(cur.duration)) return;
    if (!armed && cur.currentTime >= cur.duration - FADE) {
      armed = true;
      nxt.currentTime = 0;
      play(nxt);
      nxt.classList.add('is-active');   // entra
      cur.classList.remove('is-active'); // sai (transição de opacidade no CSS)
    }
  }

  function onEnded(v) {
    if (v !== cur) return;
    cur.pause();
    var tmp = cur; cur = nxt; nxt = tmp; // troca de papéis
    armed = false;
  }

  [a, b].forEach(function (v) {
    v.addEventListener('timeupdate', function () { onTime(v); });
    v.addEventListener('ended', function () { onEnded(v); });
  });

  play(cur);
})();

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.faq-item');
    var answer = item.querySelector('.faq-a');
    var isOpen = item.classList.contains('open');

    // close all
    document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-a').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});
