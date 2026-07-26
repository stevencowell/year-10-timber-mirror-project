const THEORY_ANSWERS_STORAGE_KEY = 'mirror_theory_quick_check_answers_v1';

function getTheoryAnswerFields() {
  return Array.from(document.querySelectorAll('[data-theory-answer]'));
}

function setTheoryStatus(message) {
  const status = document.getElementById('theorySaveStatus');
  if (status) status.textContent = message;
}

function collectTheoryAnswers() {
  const answers = {};
  getTheoryAnswerFields().forEach(field => {
    answers[field.dataset.theoryAnswer] = field.value;
  });
  answers.saved_at = new Date().toISOString();
  return answers;
}

function saveTheoryAnswers() {
  localStorage.setItem(THEORY_ANSWERS_STORAGE_KEY, JSON.stringify(collectTheoryAnswers()));
  updateTheoryProgress();
  setTheoryStatus('Saved ' + new Date().toLocaleTimeString());
}

function loadTheoryAnswers() {
  const raw = localStorage.getItem(THEORY_ANSWERS_STORAGE_KEY);
  if (!raw) return;

  try {
    const answers = JSON.parse(raw);
    getTheoryAnswerFields().forEach(field => {
      const key = field.dataset.theoryAnswer;
      if (key in answers) field.value = answers[key];
    });
    setTheoryStatus('Loaded saved Quick Check answers.');
  } catch {
    setTheoryStatus('Could not load saved answers.');
  }
}

function clearTheoryAnswers() {
  const confirmed = window.confirm('Clear saved Quick Check answers from this browser?');
  if (!confirmed) return;

  localStorage.removeItem(THEORY_ANSWERS_STORAGE_KEY);
  getTheoryAnswerFields().forEach(field => {
    field.value = '';
  });
  updateTheoryProgress();
  setTheoryStatus('Quick Check answers cleared.');
}

const THEORY_PROGRESS_GROUPS = {
  safety: ['safety_1', 'safety_2', 'safety_3'],
  timber: ['materials_1', 'materials_2', 'materials_3'],
  marking: ['marking_1', 'marking_2', 'marking_3'],
  joinery: ['joinery_1', 'joinery_2', 'joinery_3'],
  routing: ['routing_1', 'routing_2', 'routing_3'],
  finishing: ['finishing_1', 'finishing_2', 'finishing_3'],
  design: ['design_1', 'design_2', 'design_3'],
  fitting: ['fitting_1', 'fitting_2', 'fitting_3'],
  evaluation: ['evaluation_1', 'evaluation_2', 'evaluation_3']
};

function updateTheoryProgress() {
  if (!window.MirrorProgress) return;
  const answers = collectTheoryAnswers();
  const updates = {};
  Object.entries(THEORY_PROGRESS_GROUPS).forEach(([progressKey, answerKeys]) => {
    updates[progressKey] = answerKeys.every(key => String(answers[key] || '').trim().length > 0);
  });
  window.MirrorProgress.setItems(updates);
}

function initTheoryAnswers() {
  loadTheoryAnswers();
  updateTheoryProgress();

  getTheoryAnswerFields().forEach(field => {
    field.addEventListener('input', saveTheoryAnswers);
    field.addEventListener('change', saveTheoryAnswers);
  });

  document.getElementById('saveTheoryAnswersBtn')?.addEventListener('click', saveTheoryAnswers);
  document.getElementById('clearTheoryAnswersBtn')?.addEventListener('click', clearTheoryAnswers);
}

document.addEventListener('DOMContentLoaded', initTheoryAnswers);
