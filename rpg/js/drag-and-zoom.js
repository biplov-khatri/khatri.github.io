let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let scale = 1;

const overlayImg = document.getElementById("overlay-img");
const photoFrame = document.querySelector('.photo-frame');

// Reset transform when new image is loaded
overlayImg.addEventListener('load', () => {
    scale = 1;
    xOffset = 0;
    yOffset = 0;
    setTransform(overlayImg);
});

overlayImg.addEventListener("mousedown", dragStart);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", dragEnd);

// Touch events
overlayImg.addEventListener("touchstart", dragStart);
document.addEventListener("touchmove", drag);
document.addEventListener("touchend", dragEnd);

// Zoom with mouse wheel
overlayImg.addEventListener("wheel", handleZoom);

function dragStart(e) {
    e.preventDefault();
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }
    
    if (e.target === overlayImg) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTransform(overlayImg);
    }
}

function dragEnd() {
    isDragging = false;
}

function handleZoom(e) {
    e.preventDefault();
    
    const delta = Math.sign(e.deltaY) * -0.1;
    // Allow much smaller scale to ensure image can be zoomed out completely
    scale = Math.max(0.1, scale + delta);
    // Remove upper limit to allow unlimited zoom in
    
    setTransform(overlayImg);
}

function setTransform(element) {
    element.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${scale})`;
}

// Add pinch zoom support for mobile devices
let initialDistance = 0;
overlayImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
    }
});

overlayImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );
        
        const delta = (currentDistance - initialDistance) * 0.01;
        scale = Math.max(0.1, scale + delta);
        setTransform(overlayImg);
        
        initialDistance = currentDistance;
    }
});
