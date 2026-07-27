(() => {
  const graphics = [
    ['Project Brief and Success Criteria', '01-project-brief.png'],
    ['Work Health and Safety', '02-whs.png'],
    ['Timber and Cutting List', '03-timber.png'],
    ['Measuring and Marking', '04-marking.png'],
    ['Joinery', '05-joinery.png'],
    ['Shaping and Routing', '06-shaping-routing.png'],
    ['Dry Fit and Assembly', '07-dry-fit-assembly.png'],
    ['Sanding and Finishing', '08-sanding-finishing.png'],
    ['Mirror, Backing and Hardware Fitting', '09-backing-hardware.png'],
    ['Quality Checks', '10-quality-checks.png'],
    ['Problems and Solutions', '11-problems-solutions.png'],
    ['Final Evaluation', '12-final-evaluation.png']
  ];

  function addInfographics() {
    const cards = document.querySelectorAll('#folioCards .folio-card');
    cards.forEach((card, index) => {
      const graphic = graphics[index];
      const header = card.querySelector('.folio-head');
      if (!graphic || !header || card.querySelector('.folio-card-graphic')) return;
      const figure = document.createElement('figure');
      figure.className = 'folio-card-graphic';
      figure.innerHTML = `
        <img src="images/mirror-folio/cards/${graphic[1]}" alt="${graphic[0]} infographic" loading="lazy" decoding="async">
        <figcaption>Use this visual to help you identify the evidence and explanation needed for this stage.</figcaption>
      `;
      header.insertAdjacentElement('afterend', figure);
    });
  }

  function start() { requestAnimationFrame(addInfographics); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
