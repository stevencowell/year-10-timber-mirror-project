const MIRROR_PROGRESS_STORAGE_KEY = 'mirror_site_progress_v1';

const MIRROR_PROGRESS_ITEMS = [
  { key: 'safety', href: 'mirror_theory_safety.html' },
  { key: 'timber', href: 'mirror_theory_timber.html' },
  { key: 'marking', href: 'mirror_theory_marking.html' },
  { key: 'joinery', href: 'mirror_theory_joinery.html' },
  { key: 'routing', href: 'mirror_theory_routing.html' },
  { key: 'finishing', href: 'mirror_theory_finishing.html' },
  { key: 'design', href: 'mirror_portfolio_workbook.html#brief-heading' },
  { key: 'materials', href: 'mirror_portfolio_workbook.html#materials-heading' },
  { key: 'fitting', href: 'mirror_theory_fitting.html' },
  { key: 'evaluation', href: 'mirror_portfolio_workbook.html#evaluation-heading' },
  { key: 'quiz', href: 'mirror_quizzes.html' }
];

function mirrorLoadProgress() {
  try {
    return JSON.parse(localStorage.getItem(MIRROR_PROGRESS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function mirrorSaveProgress(progress) {
  localStorage.setItem(MIRROR_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent('mirror-progress-updated', { detail: progress }));
}

function mirrorSetProgressItem(key, complete) {
  const progress = mirrorLoadProgress();
  progress[key] = Boolean(complete);
  mirrorSaveProgress(progress);
}

function mirrorSetProgressItems(updates) {
  const progress = mirrorLoadProgress();
  Object.entries(updates).forEach(([key, complete]) => {
    progress[key] = Boolean(complete);
  });
  mirrorSaveProgress(progress);
}

window.MirrorProgress = {
  items: MIRROR_PROGRESS_ITEMS,
  load: mirrorLoadProgress,
  save: mirrorSaveProgress,
  setItem: mirrorSetProgressItem,
  setItems: mirrorSetProgressItems
};

(() => { if (!document.querySelector('script[src*="shared/hub-navigation.js"]')) { const script = document.createElement('script'); script.src = '/year-10-timber-mirror-project/shared/hub-navigation.js'; document.head.append(script); } })();

