let img = document.getElementById('overlay-img');
let isDragging = true;
let startX, startY, initialX = 0, initialY = 0, scale = 1;

img.addEventListener('load', () => {
    // Ensure the image is fully loaded before any transformations
    img.style.transform = `translate(${initialX}px, ${initialY}px) scale(${scale})`;
});

img.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - initialX;
    startY = e.clientY - initialY;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        initialX = e.clientX - startX;
        initialY = e.clientY - startY;
        img.style.transform = `translate(${initialX}px, ${initialY}px) scale(${scale})`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

img.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale += e.deltaY * -0.01;
    scale = Math.min(Math.max(0.5, scale), 3);
    img.style.transform = `translate(${initialX}px, ${initialY}px) scale(${scale})`;
});
