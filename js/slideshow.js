document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.hero-background img');
    let currentImage = 0;

    function nextImage() {
        images[currentImage].classList.remove('active');
        currentImage = (currentImage + 1) % images.length;
        images[currentImage].classList.add('active');
    }

    // Set the first image as active
    images[0].classList.add('active');

    // Change image every 5 seconds
    setInterval(nextImage, 5000);
});