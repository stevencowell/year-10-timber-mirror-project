const WORKBOOK_STORAGE_KEY = 'mirror_portfolio_workbook_v1';

function getWorkbookFields() {
  return Array.from(document.querySelectorAll('[data-save]'));
}

function collectWorkbookData() {
  const data = {};
  getWorkbookFields().forEach(field => {
    const key = field.dataset.save;
    data[key] = field.type === 'checkbox' ? field.checked : field.value;
  });
  data.saved_at = new Date().toISOString();
  return data;
}

function setStatus(message) {
  const status = document.getElementById('saveStatus');
  if (status) status.textContent = message;
}

function saveWorkbook() {
  localStorage.setItem(WORKBOOK_STORAGE_KEY, JSON.stringify(collectWorkbookData()));
  updateWorkbookProgress();
  setStatus('Saved ' + new Date().toLocaleTimeString());
}

function loadWorkbook() {
  const raw = localStorage.getItem(WORKBOOK_STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    getWorkbookFields().forEach(field => {
      const key = field.dataset.save;
      if (!(key in data)) return;
      if (field.type === 'checkbox') {
        field.checked = Boolean(data[key]);
      } else {
        field.value = data[key];
      }
    });
    setStatus('Loaded saved work.');
  } catch {
    setStatus('Could not load saved work.');
  }
}

function exportWorkbook() {
  const data = collectWorkbookData();
  const lines = [
    'Mirror Project Portfolio Workbook',
    'Exported: ' + new Date().toLocaleString(),
    ''
  ];

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'saved_at') return;
    const label = key.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
    lines.push(label + ':');
    lines.push(String(value || ''));
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mirror-project-portfolio-workbook.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus('Exported text file.');
}

function clearWorkbook() {
  const confirmed = window.confirm('Clear saved workbook data from this browser?');
  if (!confirmed) return;

  localStorage.removeItem(WORKBOOK_STORAGE_KEY);
  getWorkbookFields().forEach(field => {
    if (field.type === 'checkbox') {
      field.checked = false;
    } else {
      field.value = '';
    }
  });
  updateWorkbookProgress();
  setStatus('Saved work cleared.');
}

function printWorkbook() {
  window.print();
}

function hasText(data, key) {
  return String(data[key] || '').trim().length > 0;
}

function updateWorkbookProgress() {
  if (!window.MirrorProgress) return;
  const data = collectWorkbookData();
  window.MirrorProgress.setItems({
    design: hasText(data, 'design_brief') && hasText(data, 'target_user'),
    materials: hasText(data, 'materials_list') && hasText(data, 'cut_part_1'),
    evaluation: hasText(data, 'final_evaluation') || hasText(data, 'evaluation_strengths') || hasText(data, 'evaluation_improvements')
  });
}

function initWorkbook() {
  loadWorkbook();
  updateWorkbookProgress();

  getWorkbookFields().forEach(field => {
    field.addEventListener('input', saveWorkbook);
    field.addEventListener('change', saveWorkbook);
  });

  document.getElementById('saveWorkbookBtn')?.addEventListener('click', saveWorkbook);
  document.getElementById('exportWorkbookBtn')?.addEventListener('click', exportWorkbook);
  document.getElementById('printWorkbookBtn')?.addEventListener('click', printWorkbook);
  document.getElementById('clearWorkbookBtn')?.addEventListener('click', clearWorkbook);
}

document.addEventListener('DOMContentLoaded', initWorkbook);
