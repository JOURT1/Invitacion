const cover = document.getElementById('cover');
const introVideo = document.getElementById('introVideo');
const pages = [...document.querySelectorAll('.page')];
const navigation = document.getElementById('navigation');
const replay = document.getElementById('replay');
const pageNumber = document.getElementById('currentPage');
document.getElementById('totalPages').textContent = String(pages.length + 1).padStart(2, '0');
let current = -1;
let butterflyLanded = false;
let animationRun = 0;

function showPage(index) {
  current = Math.max(0, Math.min(index, pages.length - 1));
  pages.forEach((page, i) => page.classList.toggle('active', i === current));
  pageNumber.textContent = String(current + 2).padStart(2, '0');
  document.getElementById('previous').disabled = current === 0;
  document.getElementById('next').textContent = current === pages.length - 1 ? '↻' : '›';
  replay.hidden = current !== pages.length - 1;
  const invitation = document.getElementById('invitation');
  if (butterflyLanded) invitation.classList.add('landed');
}

function openInvitation() {
  if (current !== -1) return;
  const run = ++animationRun;
  butterflyLanded = false;
  const invitation = document.getElementById('invitation');
  invitation.classList.remove('landed');
  cover.classList.remove('video-ending');
  showPage(0);

  const useFallback = () => {
    navigation.hidden = false;
    invitation.classList.add('flying');
    cover.classList.add('opening');
    setTimeout(() => { if (run === animationRun) cover.hidden = true; }, 1450);
    setTimeout(() => {
      if (run !== animationRun) return;
      butterflyLanded = true;
      invitation.classList.remove('flying');
      invitation.classList.add('landed');
    }, 3900);
  };

  if (!introVideo || !introVideo.querySelector('source')?.getAttribute('src')) {
    useFallback();
    return;
  }
  cover.classList.add('video-playing');
  invitation.classList.add('video-playing');
  const play = introVideo.play();
  if (play && typeof play.catch === 'function') {
    play.catch(() => {
      if (run !== animationRun) return;
      cover.classList.remove('video-playing');
      invitation.classList.remove('video-playing');
      useFallback();
    });
  }
}

introVideo.addEventListener('ended', () => {
  cover.hidden = true;
  navigation.hidden = false;
  cover.classList.remove('video-playing');
  const invitation = document.getElementById('invitation');
  invitation.classList.remove('flying', 'video-playing');
  invitation.classList.add('landed');
  butterflyLanded = true;
});

introVideo.addEventListener('timeupdate', () => {
  if (Number.isFinite(introVideo.duration) && introVideo.duration - introVideo.currentTime < 0.65) {
    cover.classList.add('video-ending');
  }
});

function sparkles() {
  const scene = pages[current];
  for (let i = 0; i < 16; i += 1) {
    const star = document.createElement('span');
    star.className = 'sparkle';
    star.textContent = ['✦', '✧', '·'][i % 3];
    star.style.left = `${15 + Math.random() * 70}%`;
    star.style.top = `${20 + Math.random() * 60}%`;
    star.style.setProperty('--x', `${(Math.random() - 0.5) * 110}px`);
    star.style.setProperty('--y', `${(Math.random() - 0.5) * 130}px`);
    scene.appendChild(star);
    setTimeout(() => star.remove(), 1500);
  }
}

function advance(step) {
  if (current < 0 || document.getElementById('invitation').classList.contains('video-playing')) return;
  if (current === pages.length - 1 && step > 0) {
    restart();
    return;
  }
  showPage(current + step);
  sparkles();
}

function restart() {
  animationRun += 1;
  butterflyLanded = false;
  current = -1;
  document.getElementById('invitation').classList.remove('flying', 'landed');
  document.getElementById('invitation').classList.remove('video-playing');
  cover.classList.remove('video-playing');
  cover.classList.remove('video-ending');
  introVideo.pause();
  introVideo.currentTime = 0;
  pages.forEach(page => page.classList.remove('active'));
  cover.hidden = false;
  cover.classList.remove('opening');
  navigation.hidden = true;
  replay.hidden = true;
}

cover.addEventListener('click', openInvitation);
cover.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openInvitation();
  }
});
document.getElementById('next').addEventListener('click', () => advance(1));
document.getElementById('previous').addEventListener('click', () => advance(-1));
replay.addEventListener('click', restart);
pages.forEach(page => page.addEventListener('click', event => {
  if (!event.target.closest('button')) advance(1);
}));

let touchStartX = 0;
let touchStartY = 0;
document.getElementById('invitation').addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });
document.getElementById('invitation').addEventListener('touchend', event => {
  if (current < 0) return;
  const dx = event.changedTouches[0].screenX - touchStartX;
  const dy = event.changedTouches[0].screenY - touchStartY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) advance(dx < 0 ? 1 : -1);
}, { passive: true });
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') advance(1);
  if (event.key === 'ArrowLeft') advance(-1);
  if ((event.key === 'Enter' || event.key === ' ') && current === -1) openInvitation();
});
