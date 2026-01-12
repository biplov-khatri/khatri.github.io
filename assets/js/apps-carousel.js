// This JS will fetch the applist.xml, parse it, and populate the apps carousel

document.addEventListener('DOMContentLoaded', function() {
  fetch('applist/applist.xml')
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
    .then(data => {
      const apps = data.getElementsByTagName('app');
      const container = document.getElementById('apps-carousel-inner');
      if (!container) return;
      for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        const name = app.getElementsByTagName('name')[0].textContent;
        const icon = app.getElementsByTagName('icon')[0].textContent;
        const desc = app.getElementsByTagName('description')[0].textContent;
        const android = app.getElementsByTagName('android')[0].textContent;
        const ios = app.getElementsByTagName('ios')[0].textContent;
        let links = '';
        if (android && android.trim()) {
          links += `<a href="${android}" class="btn btn-success btn-sm mx-1" target="_blank"><i class="bi bi-android"></i> Android</a>`;
        }
        if (ios && ios.trim()) {
          links += `<a href="${ios}" class="btn btn-primary btn-sm mx-1" target="_blank"><i class="bi bi-apple"></i> iOS</a>`;
        }
        const slide = document.createElement('div');
        slide.className = 'apps-slide';
        slide.innerHTML = `
          <div class="card h-100 text-center p-3">
            <img src="${icon}" alt="${name}" class="app-icon mx-auto mb-2" style="width:64px;height:64px;object-fit:contain;">
            <h5 class="mt-2">${name}</h5>
            <p class="small">${desc}</p>
            <div class="d-flex justify-content-center">${links}</div>
          </div>
        `;
        container.appendChild(slide);
      }
      // Start the animation
      startAppsCarousel();
    });
});

function startAppsCarousel() {
  const carousel = document.getElementById('apps-carousel-inner');
  if (!carousel) return;
  let scrollAmount = 0;
  function scroll() {
    scrollAmount += 1;
    if (scrollAmount >= carousel.scrollWidth - carousel.clientWidth) {
      scrollAmount = 0;
    }
    carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    requestAnimationFrame(scroll);
  }
  requestAnimationFrame(scroll);
}
