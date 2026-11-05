/* Dr. Walliston Emmanuel — interações do site */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var WHATS = '559392029989';
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------- Ano no rodapé ---------- */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Cabeçalho com sombra ao rolar ---------- */
  var header = $('.header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = $('.nav-toggle');
  var nav = $('#menu');
  var closeMenu = function () {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  };
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Link ativo no menu conforme a seção ---------- */
  var links = $$('.nav ul a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Animação de entrada ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contadores (12 pós / 7.940 h) ---------- */
  var counters = $$('[data-count]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animateCount = function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var start = null, dur = 1400;
    var step = function (t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Filtro de serviços ---------- */
  var filters = $$('.filter');
  var cards = $$('#service-cards .card');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      cards.forEach(function (c) {
        c.classList.toggle('is-hidden', f !== 'all' && c.getAttribute('data-cat') !== f);
      });
    });
  });

  /* ---------- Modal "Saiba mais" ---------- */
  var modal = $('#modal');
  var mTitle = $('#modal-title');
  var mTag = $('#modal-tag');
  var mBody = $('#modal-body');
  var lastFocus = null;

  var openModal = function (card) {
    lastFocus = document.activeElement;
    mTitle.textContent = $('h3', card).textContent;
    mTag.textContent = $('.card__tag', card).textContent;
    mBody.innerHTML = $('.card__full', card).innerHTML;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    $('.modal__close', modal).focus();
  };
  var closeModal = function () {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  };

  cards.forEach(function (card) {
    $('.card__more', card).addEventListener('click', function () { openModal(card); });
  });
  $$('[data-close]', modal).forEach(function (el) { el.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      var f = $$('button, a[href]', modal);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Formulário → WhatsApp (não armazena dados) ---------- */
  var form = $('#form-agendamento');
  var err = $('#form-error');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var contato = form.contato.value.trim();
    var modalidade = (form.querySelector('input[name="modalidade"]:checked') || {}).value || 'Ainda não sei';

    form.nome.classList.toggle('is-invalid', !nome);
    form.contato.classList.toggle('is-invalid', !contato);
    if (!nome || !contato) {
      err.hidden = false;
      (nome ? form.contato : form.nome).focus();
      return;
    }
    err.hidden = true;

    var msg = 'Olá! Gostaria de informações para agendar uma consulta com o Dr. Walliston Emmanuel. ' +
      'Poderia me informar a disponibilidade, o valor e a modalidade de atendimento?\n\n' +
      'Nome: ' + nome + '\n' +
      'Contato: ' + contato + '\n' +
      'Modalidade de interesse: ' + modalidade;

    window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();
