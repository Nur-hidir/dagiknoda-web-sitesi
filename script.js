// ============ AYARLAR ============
// Sayfa çevirme sesi için bir ses dosyası koy (aynı klasöre). Dosya yoksa okuyucu sessiz çalışır.
const SOUND_FILE = 'sayfa.mp3';

// ============ 1. AÇIK KİTAP OKUYUCU ============
const reader = document.getElementById('reader');
const pgLeft = document.getElementById('pg-left');
const pgRight = document.getElementById('pg-right');
const leaf = document.getElementById('leaf');
const leafFront = document.getElementById('leaf-front');
const leafBack = document.getElementById('leaf-back');
const book = document.getElementById('book');
const btnPrev = document.getElementById('reader-prev');
const btnNext = document.getElementById('reader-next');
const btnClose = document.getElementById('reader-close');
const btnSound = document.getElementById('reader-sound');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrow = window.matchMedia('(max-width: 899px)');
const postIds = Array.from(document.querySelectorAll('.post-source')).map(el => el.id);

let cur = null, curId = null, pos = 0, busy = false, lastFocus = null;
let soundOn = true;
try { if (localStorage.getItem('book-sound') === 'off') soundOn = false; } catch (e) {}

// Sayfa çevirme sesi (gerçek ses dosyası)
let flipSound = null;
try {
    flipSound = new Audio(SOUND_FILE);
    flipSound.preload = 'auto';
    flipSound.volume = 0.6;
} catch (e) {}

function playSound() {
    if (!soundOn || !flipSound) return;
    try {
        flipSound.currentTime = 0;
        const p = flipSound.play();
        if (p && p.catch) p.catch(() => {});
    } catch (e) {}
}

function renderSound() {
    btnSound.firstElementChild.className = soundOn ? 'ph ph-speaker-high' : 'ph ph-speaker-slash';
    btnSound.setAttribute('aria-pressed', String(soundOn));
    btnSound.setAttribute('aria-label', soundOn ? 'Sesi kapat' : 'Sesi aç');
}
renderSound();

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const isSingle = () => narrow.matches;
const maxPos = () => {
    const last = cur.pages.length - 1;
    return isSingle() ? last : last - (last % 2);
};

// Bir sayfanın HTML'i
function pageHTML(i) {
    if (i < 0 || i >= cur.pages.length) {
        return '<div class="pg-inner pg-empty"><i class="ph ph-feather"></i><p>Dağınık Oda</p></div>';
    }
    const last = i === cur.pages.length - 1;
    let h = '<div class="pg-inner">';
    if (i === 0) {
        h += `<header>
                <p class="bp-date">${esc(cur.date)}</p>
                <h2 class="bp-title">${esc(cur.title)}</h2>
                <div class="bp-orn"><span></span><i class="ph ph-feather"></i><span></span></div>
              </header>`;
    } else {
        h += `<p class="bp-running">${esc(cur.title)}</p>`;
    }
    h += `<div class="bp-body${i === 0 ? ' dropcap' : ''}">${cur.pages[i]}</div>`;
    if (last) {
        const nextId = postIds[postIds.indexOf(curId) + 1];
        h += `<div class="bp-end"><p class="bp-fin">— son —</p><div class="bp-actions">
                <button class="bp-btn" onclick="closeBook()">Deftere dön</button>
                ${nextId ? `<button class="bp-btn" onclick="openBook('${nextId}')">Sonraki yazı →</button>` : ''}
              </div></div>`;
    }
    h += `<p class="pg-num">${i + 1}</p></div>`;
    return h;
}

function render() {
    if (isSingle()) {
        pgLeft.innerHTML = '';
        pgRight.innerHTML = pageHTML(pos);
    } else {
        pgLeft.innerHTML = pageHTML(pos);
        pgRight.innerHTML = pageHTML(pos + 1);
    }
    btnPrev.disabled = pos <= 0;
    btnNext.disabled = pos >= maxPos();
}

function openBook(id) {
    const src = document.getElementById(id);
    if (!src) return;
    const pages = Array.from(src.querySelectorAll('.bp')).map(p => p.innerHTML);
    if (!pages.length) return;
    cur = { title: src.dataset.title, date: src.dataset.date, pages: pages };
    curId = id;
    pos = 0;
    busy = false;
    leaf.hidden = true;
    leaf.className = 'leaf';
    pgRight.classList.remove('out');
    render();
    if (reader.hidden) lastFocus = document.activeElement;
    reader.hidden = false;
    document.body.classList.add('reader-open');
    btnClose.focus();
    playSound();
}

function closeBook() {
    if (reader.hidden) return;
    reader.hidden = true;
    document.body.classList.remove('reader-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function turn(dir) {
    if (busy || !cur) return;
    const step = isSingle() ? 1 : 2;
    const np = pos + dir * step;
    if (np < 0 || np > maxPos()) return;
    playSound();

    if (reduceMotion.matches) {
        pos = np;
        render();
        return;
    }

    busy = true;

    // Tek sayfa (telefon): yumuşak geçiş
    if (isSingle()) {
        pgRight.classList.add('out');
        setTimeout(() => {
            pos = np;
            render();
            pgRight.classList.remove('out');
            setTimeout(() => { busy = false; }, 220);
        }, 200);
        return;
    }

    // Çift sayfa: yaprak çevirme
    if (dir > 0) {
        leafFront.innerHTML = pageHTML(pos + 1);   // çevrilen sağ sayfa
        leafBack.innerHTML  = pageHTML(pos + 2);   // yaprağın arkası (yeni sol sayfa)
        pgRight.innerHTML   = pageHTML(pos + 3);   // altta açılan yeni sağ sayfa
        leaf.className = 'leaf fwd';
    } else {
        leafFront.innerHTML = pageHTML(pos);       // çevrilen sol sayfa
        leafBack.innerHTML  = pageHTML(pos - 1);   // yaprağın arkası (yeni sağ sayfa)
        pgLeft.innerHTML    = pageHTML(pos - 2);   // altta açılan yeni sol sayfa
        leaf.className = 'leaf back';
    }
    leaf.hidden = false;

    setTimeout(() => {
        pos = np;
        render();
        leaf.hidden = true;
        leaf.className = 'leaf';
        busy = false;
    }, 820);
}

btnPrev.addEventListener('click', () => turn(-1));
btnNext.addEventListener('click', () => turn(1));
btnClose.addEventListener('click', closeBook);

btnSound.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('book-sound', soundOn ? 'on' : 'off'); } catch (e) {}
    renderSound();
    playSound();
});

// Sayfanın kenarlarına tıklayınca da çevrilir
book.addEventListener('click', e => {
    if (e.target.closest('button, a')) return;
    const r = book.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const edge = isSingle() ? 0.35 : 0.2;
    if (x > 1 - edge) turn(1);
    else if (x < edge) turn(-1);
});

document.addEventListener('keydown', e => {
    if (reader.hidden) return;
    if (e.key === 'Escape') closeBook();
    else if (e.key === 'ArrowRight') turn(1);
    else if (e.key === 'ArrowLeft') turn(-1);
});

// Telefonda kaydırarak çevirme
let touchX = null;
book.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
book.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (dx < -50) turn(1);
    else if (dx > 50) turn(-1);
});

// Pencere boyutu değişirse (tek/çift sayfa geçişi) yeniden çiz
narrow.addEventListener('change', () => {
    if (!cur || reader.hidden) return;
    if (!isSingle()) pos -= pos % 2;
    busy = false;
    leaf.hidden = true;
    leaf.className = 'leaf';
    pgRight.classList.remove('out');
    render();
});

// Blog kartlarına tıklayınca (ya da Enter/Boşluk ile) yazıyı aç
document.querySelectorAll('[data-post]').forEach(card => {
    card.addEventListener('click', () => openBook(card.dataset.post));
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openBook(card.dataset.post);
        }
    });
});

// ============ 2. SEKME GEÇİŞİ ============
const views = Array.from(document.querySelectorAll('[id^="view-"]'))
                   .map(el => el.id.replace('view-', ''));

function showTab(tabId) {
    closeBook();
    if (!views.includes(tabId)) tabId = 'home';
    views.forEach(id => {
        document.getElementById('view-' + id).classList.add('hidden');
    });
    document.getElementById('view-' + tabId).classList.remove('hidden');

    // Portfolyo sekmesinde sol menüyü gizle ve ekranı tam kapla
    const sidebar = document.querySelector('aside.sidebar');
    const mainArea = document.querySelector('main');
    if (tabId === 'projects') {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('flex');
        mainArea.classList.remove('md:ml-64', 'md:w-[calc(100%-16rem)]');
        mainArea.classList.add('w-full');
    } else {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('flex');
        mainArea.classList.add('md:ml-64', 'md:w-[calc(100%-16rem)]');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });
    const activeBtn = document.getElementById('nav-' + tabId);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-current', 'page');
    }
    window.scrollTo(0, 0);
}

function switchTab(tabId) {
    if (location.hash === '#' + tabId) {
        showTab(tabId);
    } else {
        location.hash = tabId;
    }
}

window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
showTab(location.hash.slice(1) || 'home');

// ============ 3. SÖZ DÖNGÜSÜ (10 dakikada bir, rastgele başlar) ============
const quotes = [
    { text: "“Yaratamadığımı anlamış sayılmam.”", author: "Richard Feynman" },
    { text: "“Her yaratma eylemi, önce bir yıkma eylemidir.”", author: "Pablo Picasso" },
    { text: "“Dans eden bir yıldız doğurmak için içinde kaos taşımalısın.”", author: "Friedrich Nietzsche" },
    { text: "“Bütün insanlar doğaları gereği bilmek ister.”", author: "Aristoteles" },
    { text: "“Bilmeye cesaret et.”", author: "Immanuel Kant" }
];
let currentQuoteIndex = Math.floor(Math.random() * quotes.length);

function updateQuote() {
    const box = document.getElementById('quote-container');
    const q = quotes[currentQuoteIndex];
    box.innerHTML = `${q.text}<br><span class="not-italic mt-2 block font-bold">- ${q.author}</span>`;
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
}
updateQuote();
setInterval(updateQuote, 600000);