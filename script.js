const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1EWli5lAQsObQA47T-OpwAjkXAFSgLcqqf7nCN5zjoEoNMPuA4FmsGSHHN9tKhJhj-w/exec";
const CLASSROOM_LINK = "https://classroom.google.com/c/NzkzNDk4NzYwODgw";

const synth = window.speechSynthesis;
let voices = [];
synth.onvoiceschanged = () => { voices = synth.getVoices(); };

function speakText(btn) {
  let text = '';
  if (btn.dataset.text) {
    text = btn.dataset.text;
  } else {
    const p = btn.closest('p');
    if (p) {
      text = Array.from(p.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join(' ');
    } else {
      const lbl = btn.closest('label');
      text = Array.from(lbl.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .filter(t => t.length)
        .join(' ');
    }
  }
  if (!voices.length) voices = synth.getVoices();
  const utt = new SpeechSynthesisUtterance(text);
  utt.voice = voices.find(v => v.name === 'Google UK English Female') ||
              voices.find(v => /Natural/.test(v.name)) ||
              voices[0];
  synth.speak(utt);
}

function showResultPopup(url) {
  const overlay = document.getElementById('resultPopup');
  const link = document.getElementById('popupClassroomLink');
  if (link) link.href = url || '#';
  if (overlay) overlay.classList.add('active');
}

function showSubmittedPopup(url) {
  const overlay = document.getElementById('submittedPopup');
  const btn = document.getElementById('submittedOkBtn');
  if (!overlay || !btn) { showResultPopup(url); return; }
  overlay.classList.add('active');
  btn.onclick = () => {
    overlay.classList.remove('active');
    showResultPopup(url);
  };
}

function askForName() {
  return new Promise(resolve => {
    const overlay = document.getElementById('namePopup');
    const input = document.getElementById('studentName');
    const btn = document.getElementById('submitNameBtn');
    if (!overlay || !input || !btn) { resolve(''); return; }
    overlay.classList.add('active');
    btn.onclick = () => {
      const name = input.value.trim();
      if (!name) return;
      overlay.classList.remove('active');
      resolve(name);
    };
  });
}

function shuffleQuizAnswers() {
  document.querySelectorAll('form.quiz li').forEach(li => {
    const labels = Array.from(li.querySelectorAll('label'));
    if (labels.length <= 1) return;
    li.querySelectorAll('br').forEach(br => br.remove());
    labels.forEach(l => l.remove());
    for (let i = labels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    labels.forEach((label, idx) => {
      li.appendChild(label);
      if (idx < labels.length - 1) li.appendChild(document.createElement('br'));
    });
  });
}

function initQuizFeatures() {
  shuffleQuizAnswers();
  const closeBtn = document.querySelector('#resultPopup .close-popup');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('resultPopup').classList.remove('active');
    });
  }
  document.querySelectorAll('form.quiz li > p button').forEach(btn => {
    if (!btn.hasAttribute('aria-label')) {
      btn.setAttribute('aria-label', 'Read question aloud');
    }
  });
  document.querySelectorAll('form.quiz label').forEach(label => {
    if (!label.querySelector('button')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Listen';
      const answerText = label.textContent.trim();
      btn.setAttribute('aria-label', 'Read answer ' + answerText);
      btn.addEventListener('click', e => { e.preventDefault(); speakText(btn); });
      label.appendChild(document.createTextNode(' '));
      label.appendChild(btn);
    }
  });
}

function initPage() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');

  function setActiveSection() {
    let targetID = window.location.hash.substring(1) || 'overview';
    if (!document.getElementById(targetID)) {
      targetID = 'overview';
    }

    navLinks.forEach(nav => {
      nav.classList.remove('active');
      if (nav.getAttribute('data-section') === targetID) {
        nav.classList.add('active');
      }
    });
    sections.forEach(sec => {
      sec.classList.remove('active');
      if (sec.id === targetID) {
        sec.classList.add('active');
      }
    });
  }

  setActiveSection();

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetID = link.getAttribute('data-section');
      window.location.hash = targetID;

      navLinks.forEach(nav => nav.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      link.classList.add('active');
      const targetSection = document.getElementById(targetID);
      if (targetSection) {
        targetSection.classList.add('active');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  window.addEventListener('hashchange', setActiveSection);
}

function updateProgressTracker(progress) {
  const fields = Array.from(document.querySelectorAll('[data-progress-item]'));
  const items = window.MirrorProgress?.items || [];
  const completed = items.filter(item => progress[item.key]).length;
  const total = items.length || fields.length;
  const count = document.getElementById('progressCount');
  const fill = document.getElementById('progressFill');
  const continueLink = document.getElementById('continueProgressLink');
  const nextItem = items.find(item => !progress[item.key]) || items[total - 1];

  fields.forEach(field => {
    field.checked = Boolean(progress[field.dataset.progressItem]);
  });
  if (count) count.textContent = `${completed}/${total} complete`;
  if (fill) fill.style.width = `${Math.round((completed / Math.max(total, 1)) * 100)}%`;
  if (continueLink && nextItem) continueLink.href = nextItem.href;
}

function initProgressTracker() {
  const fields = Array.from(document.querySelectorAll('[data-progress-item]'));
  if (!fields.length) return;

  let progress = window.MirrorProgress?.load() || {};
  updateProgressTracker(progress);

  window.addEventListener('mirror-progress-updated', event => {
    progress = event.detail || window.MirrorProgress?.load() || {};
    updateProgressTracker(progress);
  });
}

function submitQuiz(btn, week, level) {
  const form = btn.closest('form');
  const fieldset = form.querySelector('fieldset');
  let correct = 0, total = 0;
  const results = [];
  const textResponses = [];

  fieldset.querySelectorAll('li').forEach(li => {
    const textarea = li.querySelector('textarea');
    if (textarea) {
      textResponses.push({
        question: li.querySelector('p')?.textContent || '',
        answer: textarea.value.trim()
      });
      return;
    }

    const radios = li.querySelectorAll('input[type=radio]');
    let userCorrect = false;
    radios.forEach(radio => {
      if (radio.checked && radio.getAttribute('data-correct') === 'true') {
        userCorrect = true;
      }
      radio.parentElement.removeAttribute('data-result');
    });
    total += 1;
    radios.forEach(radio => {
      if (radio.checked) {
        radio.parentElement.setAttribute('data-result', userCorrect ? 'right' : 'wrong');
      }
    });
    if (userCorrect) correct += 1;
    results.push({
      question: li.querySelector('p')?.textContent || '',
      answer: Array.from(radios).find(r => r.checked)?.value || ''
    });
  });

  let msg;
  if (textResponses.length) {
    msg = 'Responses submitted. Your teacher will review them.';
  } else {
    msg = `You got ${correct} out of ${total} correct.`;
  }
  form.querySelector('.quiz-msg').textContent = msg;

  askForName().then(name => {
    const prefixes = { main: 'M', support: 'S', advanced: 'A' };
    const prefix = prefixes[level?.toLowerCase()] || 'M';
    const weekNumMatch = week.match(/\d+/);
    const weekNum = weekNumMatch ? parseInt(weekNumMatch[0], 10) : 0;
    const quizNumber = prefix + weekNum;
    const payload = {
      quizType: week,
      quizNumber,
      studentName: name,
      timestamp: new Date().toISOString()
    };
    if (textResponses.length) {
      payload.responses = textResponses;
    } else {
      payload.quiz = results;
      payload.score = `${correct}/${total}`;
    }
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => {
      showSubmittedPopup(CLASSROOM_LINK);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPage();
  initProgressTracker();
  initQuizFeatures();
});
