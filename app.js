'use strict';
(() => {
const $ = id => document.getElementById(id);
const semAnimacao = matchMedia('(prefers-reduced-motion: reduce)').matches;
const espera = ms => new Promise(r => setTimeout(r, semAnimacao ? 0 : ms));

/* ---------- 1. Coraçõezinhos flutuando ---------- */
(function coracoes() {
  const caixa = $('coracoes');
  if (!caixa || semAnimacao) return;
  const simbolos = ['♡', '💗', '♥', '🌸'];
  setInterval(() => {
    if (document.hidden || caixa.children.length > 22) return;
    const s = document.createElement('span');
    s.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = (12 + Math.random() * 16) + 'px';
    const dur = 9 + Math.random() * 7;
    s.style.animationDuration = dur + 's';
    caixa.appendChild(s);
    setTimeout(() => s.remove(), dur * 1000);
  }, 1100);
})();

/* ---------- 2. Abertura ---------- */
const abertura = $('abertura');
const fase1 = $('fase1');
const cantinho = $('cantinho');

function revelarFase(fase) {
  fase.classList.add('on');
  // força o navegador a "ver" o estado inicial antes de animar
  void fase.offsetWidth;
  fase.classList.add('revelar');
}

$('btnSurpresa').addEventListener('click', async () => {
  const ursinhos = document.querySelector('.ursinhos');
  const btn = $('btnSurpresa');
  btn.disabled = true;
  ursinhos.style.transition = 'opacity .5s, transform .5s';
  ursinhos.style.opacity = '0';
  ursinhos.style.transform = 'scale(.85)';
  btn.style.transition = 'opacity .5s';
  btn.style.opacity = '0';
  await espera(450);
  document.querySelector('.ursinhos').hidden = true;
  btn.hidden = true;
  revelarFase(fase1);
});

$('btnContinuar').addEventListener('click', async () => {
  fase1.classList.remove('revelar');
  fase1.style.transition = 'opacity .7s ease, transform .7s ease';
  fase1.style.opacity = '0';
  fase1.style.transform = 'translateY(-16px)';
  await espera(700);

  abertura.classList.add('sumindo');
  abertura.style.transition = 'opacity .8s ease';
  abertura.style.opacity = '0';
  await espera(800);

  abertura.hidden = true;
  cantinho.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // cartinha aparece
  $('cartinha').classList.add('laco');
  await espera(1200);
  // só então o player surge, abaixo dela
  const player = $('player');
  player.classList.add('on');
  await espera(400);
  player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/* ---------- 3. Player ---------- */
const audio = $('audio');
const barra = $('barra');
const progresso = $('progresso');
const pPlay = $('pPlay');

let musicaPronta = false;

function tocar() { audio.play().catch(() => {}); }
function pausar() { audio.pause(); }

pPlay.addEventListener('click', () => {
  if (!musicaPronta) return;
  audio.paused ? tocar() : pausar();
});
audio.addEventListener('play', () => { pPlay.textContent = '❚❚'; });
audio.addEventListener('pause', () => { pPlay.textContent = '▶'; });
audio.addEventListener('ended', () => { pPlay.textContent = '▶'; barra.style.width = '0%'; });

const mmss = s => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return m + ':' + String(r).padStart(2, '0');
};
audio.addEventListener('loadedmetadata', () => {
  $('pDur').textContent = mmss(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  barra.style.width = pct + '%';
  $('pTemp').textContent = mmss(audio.currentTime);
});

function buscar(e) {
  if (!audio.duration) return;
  const r = progresso.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  audio.currentTime = pct * audio.duration;
}
progresso.addEventListener('click', buscar);
progresso.addEventListener('keydown', e => {
  if (!audio.duration) return;
  if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
  if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
});

/* Escolher um arquivo de áudio do aparelho */
$('btnArquivo').addEventListener('click', () => $('arquivo').click());
$('arquivo').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  audio.src = url;
  musicaPronta = true;
  $('pMusica').textContent = f.name.replace(/\.[^.]+$/, '');
  $('pArtista').textContent = 'nosso arquivo ♡';
  $('aviso').textContent = 'Pronto! Toque no botão redondo para ouvir.';
  tocar();
});

/* Se existir um arquivo musica.mp3 na pasta, ele já carrega sozinho */
audio.addEventListener('loadedmetadata', function tentou() {
  musicaPronta = true;
}, { once: true });
audio.src = 'musica.mp3';
audio.addEventListener('error', () => {
  if (!$('arquivo').files?.length) {
    musicaPronta = false;
    $('aviso').textContent = 'Toque em "Escolher música" e selecione um arquivo de áudio do seu celular ou computador.';
  }
}, { once: true });
})();
