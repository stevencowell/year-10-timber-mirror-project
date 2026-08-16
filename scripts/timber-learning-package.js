(function () {
  'use strict';

  const videos = {
    'module-01': { id: 'XOkPcLD5Soo', title: 'The Hierarchy of Controls', source: 'Healthier Workforce Center', watch: 'how stronger risk controls are selected before relying on PPE.' },
    'module-02': { id: 'oZkYLVrTYe4', title: 'The Way Wood Works — What Every Woodworker Needs to Know About Wood', source: 'Workshop Companion', watch: 'how grain direction and timber movement affect accurate frame components.' },
    'module-03': { id: 'SNaSW5b9aWE', title: 'Face edge and face side', source: 'Mike Worth', watch: 'how datum faces and edges keep related measurements consistent.' },
    'module-04': { id: 'aBodzmUGtdw', title: 'How to make a Mortise and Tenon Joint', source: 'Paul Sellers', watch: 'how shoulders, cheeks and repeated fitting produce a strong accurate joint.' },
    'module-05': { id: '-KGOSwbHIuc', title: 'Rebates / Rabbets with a Router', source: 'Mitch Peacock — Designer Woodworker', watch: 'how the work is supported and the rebate is produced in controlled passes.' },
    'module-06': { id: 'rLLn19Y3ULc', title: 'Safety Tips for Working with Wood Finishing Products', source: 'Rockler Woodworking and Hardware', watch: 'the ventilation, PPE and product-handling controls used during finishing.' },
    'module-07': { id: 'BiwmJ4t2KWM', title: 'Introduction to orthographic drawing', source: 'Riaan Meeser', watch: 'how views communicate form clearly enough to support a design decision.' },
    'module-08': { id: '3qGQPd8GaHU', title: 'Glass Handling Best Practices', source: 'Southwind Safety Ambassadors', watch: 'how preparation, support and controlled handling reduce glass damage and injury.' },
    'module-09': { id: 'XDqQcdYjRlI', title: 'Product Research using the PMI Method', source: 'Mr Daniels', watch: 'how evidence is separated into strengths, limitations and useful next questions.' }
  };

  const moduleId = (location.pathname.match(/module-\d+/i) || [])[0]?.toLowerCase();

  function alignBreadcrumb() {
    const breadcrumb = document.querySelector('.crumbs');
    const presentation = document.querySelector('.module-presentation-card');
    if (breadcrumb && presentation) presentation.before(breadcrumb);
  }

  function alignStudentEvidence() {
    const fields = document.querySelector('.mirror-student-fields');
    const theory = document.querySelector('.content-section');
    if (!fields || !theory || document.querySelector('.aligned-student-evidence')) return;

    fields.classList.add('student-fields');
    const section = document.createElement('section');
    section.className = 'student-strip aligned-student-evidence';
    section.setAttribute('aria-labelledby', 'student-details-title');
    section.innerHTML = '<div><p class="section-kicker">Student evidence</p><h2 id="student-details-title">Your details</h2><p>Your entries save automatically in this browser. Use <strong>Print / Save PDF</strong> before leaving the page.</p></div>';
    section.append(fields);

    const status = document.getElementById('save-status');
    if (status) {
      status.classList.add('save-state');
      if (!status.textContent.trim()) status.textContent = 'Autosave is on';
      section.append(status);
    }
    theory.before(section);

    const printButton = document.getElementById('download-pdf-button');
    if (printButton) printButton.textContent = 'Print / Save PDF';
    const completionCopy = document.querySelector('.mirror-completion-card > div:first-child p:last-child');
    if (completionCopy) completionCopy.textContent = 'Your answers save in this browser while you work. Use Print / Save PDF before moving devices or clearing browser data, then upload it when your teacher asks.';

    const completionActions = document.querySelector('.mirror-completion-card .mirror-button-row');
    if (completionActions && !completionActions.querySelector('[data-folio-link]')) {
      const folio = document.createElement('a');
      folio.className = 'mirror-secondary-button';
      folio.dataset.folioLink = '';
      folio.href = '../mirror_folio.html';
      folio.textContent = 'Open project folio';
      completionActions.append(folio);
    }
  }

  function addVideo() {
    const video = videos[moduleId];
    const section = document.querySelector('.content-section');
    if (!video || !section || section.querySelector(`.section-video[data-video-id="${video.id}"]`)) return;

    const block = document.createElement('aside');
    block.className = 'section-video screen-only';
    block.dataset.videoId = video.id;
    block.setAttribute('aria-label', `Video support: ${video.title}`);
    block.innerHTML = '<div class="section-video__copy"><p class="section-kicker">Watch beside the theory</p><h3></h3><p class="section-video__source"></p><p><strong>Watch for:</strong> <span class="section-video__watch"></span></p><a class="section-video__fallback" target="_blank" rel="noopener">Open video on YouTube</a></div><div class="section-video__frame"><button class="section-video__launch" type="button">Load the video</button></div>';
    block.querySelector('h3').textContent = video.title;
    block.querySelector('.section-video__source').textContent = `YouTube · ${video.source}`;
    block.querySelector('.section-video__watch').textContent = video.watch;
    block.querySelector('.section-video__fallback').href = `https://www.youtube.com/watch?v=${video.id}`;

    const frame = block.querySelector('.section-video__frame');
    frame.style.backgroundImage = `linear-gradient(rgba(7,31,38,.32),rgba(7,31,38,.32)),url("https://i.ytimg.com/vi/${video.id}/hqdefault.jpg")`;
    frame.querySelector('button').addEventListener('click', (event) => {
      const iframe = document.createElement('iframe');
      iframe.title = video.title;
      iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?rel=0&autoplay=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      event.currentTarget.replaceWith(iframe);
    });

    const firstCheck = section.querySelector('.quiz-card, #knowledge-checks');
    if (firstCheck) firstCheck.before(block);
    else section.append(block);
  }

  alignBreadcrumb();
  alignStudentEvidence();
  addVideo();
}());
