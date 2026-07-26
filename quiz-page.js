const QUIZ_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1EWli5lAQsObQA47T-OpwAjkXAFSgLcqqf7nCN5zjoEoNMPuA4FmsGSHHN9tKhJhj-w/exec";

function askForQuizName() {
  return new Promise(resolve => {
    const overlay = document.getElementById('namePopup');
    const input = document.getElementById('studentName');
    const btn = document.getElementById('submitNameBtn');

    if (!overlay || !input || !btn) {
      resolve('');
      return;
    }

    overlay.classList.add('active');
    input.focus();

    btn.onclick = () => {
      const name = input.value.trim();
      if (!name) return;
      overlay.classList.remove('active');
      resolve(name);
    };
  });
}

function showCheckedPopup() {
  const overlay = document.getElementById('submittedPopup');
  const btn = document.getElementById('submittedOkBtn');
  if (!overlay || !btn) return;

  overlay.classList.add('active');
  btn.onclick = () => overlay.classList.remove('active');
}

function markQuizProgress() {
  window.MirrorProgress?.setItem('quiz', true);
}

function getQuizAdvice(correct, total) {
  if (total === 0) return 'Responses recorded for teacher review.';
  if (correct === total) return 'Strong result. You are ready to move on or try another topic.';
  if (correct >= Math.ceil(total * 0.7)) return 'Good result. Revisit the questions marked in red, then try again.';
  return 'Do a quick reread of the matching theory section, then try this quiz again.';
}

function checkQuiz(form) {
  const fieldset = form.querySelector('fieldset');
  const results = [];
  const textResponses = [];
  let correct = 0;
  let total = 0;

  fieldset.querySelectorAll('li').forEach(li => {
    const question = li.querySelector('p')?.textContent.trim() || '';
    const textarea = li.querySelector('textarea');

    if (textarea) {
      textResponses.push({ question, answer: textarea.value.trim() });
      return;
    }

    const radios = Array.from(li.querySelectorAll('input[type="radio"]'));
    const selected = radios.find(radio => radio.checked);
    const isCorrect = Boolean(selected?.dataset.correct);

    radios.forEach(radio => radio.parentElement.removeAttribute('data-result'));
    if (selected) selected.parentElement.setAttribute('data-result', isCorrect ? 'right' : 'wrong');
    if (!selected) li.setAttribute('data-unanswered', 'true');
    if (selected) li.removeAttribute('data-unanswered');

    total += 1;
    if (isCorrect) correct += 1;

    results.push({
      question,
      answer: selected?.parentElement.textContent.trim() || ''
    });
  });

  const msg = form.querySelector('.quiz-msg');
  if (textResponses.length) {
    const answered = textResponses.filter(item => item.answer.length > 0).length;
    msg.textContent = `Responses recorded: ${answered}/${textResponses.length}. Your teacher can review them after submission.`;
    if (answered === textResponses.length) markQuizProgress();
  } else {
    msg.textContent = `You got ${correct} out of ${total} correct. ${getQuizAdvice(correct, total)}`;
    if (total > 0 && correct === total) markQuizProgress();
  }

  askForQuizName().then(studentName => {
    const payload = {
      quizType: form.dataset.quizTitle || 'Mirror Project Quiz',
      quizNumber: form.dataset.quizNumber || 'M-QUIZ',
      studentName,
      timestamp: new Date().toISOString()
    };

    if (textResponses.length) {
      payload.responses = textResponses;
    } else {
      payload.quiz = results;
      payload.score = `${correct}/${total}`;
    }

    fetch(QUIZ_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).finally(showCheckedPopup);
  });
}

function initQuizPage() {
  document.querySelectorAll('.quiz .check-btn').forEach(button => {
    button.addEventListener('click', () => checkQuiz(button.closest('form')));
  });
}

document.addEventListener('DOMContentLoaded', initQuizPage);
