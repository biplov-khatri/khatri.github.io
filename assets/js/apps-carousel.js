// This JS will fetch the applist.xml, parse it, and populate the apps carousel

document.addEventListener('DOMContentLoaded', function() {
    // Enable horizontal swipe/drag scrolling for the carousel on mobile
    const outer = document.getElementById('apps-carousel-outer');
    if (outer) {
      let isDown = false;
      let startX, scrollLeft;
      outer.addEventListener('touchstart', function(e) {
        isDown = true;
        startX = e.touches[0].pageX - outer.offsetLeft;
        scrollLeft = outer.scrollLeft;
      });
      outer.addEventListener('touchmove', function(e) {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - outer.offsetLeft;
        const walk = (startX - x);
        outer.scrollLeft = scrollLeft + walk;
      }, { passive: false });
      outer.addEventListener('touchend', function() { isDown = false; });
      outer.addEventListener('touchcancel', function() { isDown = false; });
      // Also support mouse drag for desktop
      let isMouseDown = false, mouseStartX, mouseScrollLeft;
      outer.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        mouseStartX = e.pageX - outer.offsetLeft;
        mouseScrollLeft = outer.scrollLeft;
        outer.classList.add('dragging');
      });
      outer.addEventListener('mouseleave', function() { isMouseDown = false; outer.classList.remove('dragging'); });
      outer.addEventListener('mouseup', function() { isMouseDown = false; outer.classList.remove('dragging'); });
      outer.addEventListener('mousemove', function(e) {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - outer.offsetLeft;
        const walk = (mouseStartX - x);
        outer.scrollLeft = mouseScrollLeft + walk;
      });
    }
  fetch('/applist/applist.xml')
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
    .then(data => {
      const apps = data.getElementsByTagName('app');
      const container = document.getElementById('apps-carousel-inner');
      if (!container) return;
      // Inject modal HTML if not present
      if (!document.getElementById('app-modal')) {
        const modal = document.createElement('div');
        modal.id = 'app-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
          <div id="app-modal-backdrop" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;">
            <div id="app-modal-content" style="background:#fff;border-radius:16px;max-width:95vw;width:400px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:2rem;position:relative;">
              <button id="app-modal-close" style="position:absolute;top:12px;right:12px;font-size:1.5rem;background:none;border:none;cursor:pointer;">&times;</button>
              <div id="app-modal-body"></div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('app-modal-close').onclick = function() {
          document.getElementById('app-modal').style.display = 'none';
        };
        document.getElementById('app-modal-backdrop').onclick = function(e) {
          if (e.target === this) document.getElementById('app-modal').style.display = 'none';
        };
      }

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
          <div class="card h-100 text-center p-3" style="overflow: hidden; cursor:pointer;">
            <img src="${icon}" alt="${name}" class="app-icon mx-auto mb-2" style="width:64px;height:64px;object-fit:contain;">
            <h5 class="mt-2">${name}</h5>
            <div style="height: 48px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal;">
              <p class="small mb-2">${desc}</p>
            </div>
            <div class="d-flex justify-content-center">${links}</div>
          </div>
        `;
        // Add click event to show modal with full details
        slide.querySelector('.card').onclick = function(e) {
          e.stopPropagation();
          const modalBody = document.getElementById('app-modal-body');
          modalBody.innerHTML = `
            <img src="${icon}" alt="${name}" class="app-icon mx-auto mb-3" style="width:80px;height:80px;object-fit:contain;display:block;">
            <h4 class="mb-2">${name}</h4>
            <p style="color:#444;font-size:1rem;">${desc}</p>
            <div class="d-flex justify-content-center mt-3">${links}</div>
          `;
          document.getElementById('app-modal').style.display = 'block';
        };
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
