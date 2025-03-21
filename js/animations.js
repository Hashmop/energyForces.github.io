document.addEventListener("DOMContentLoaded", () => {
    // Select the elements you want to animate on scroll
    const elements = document.querySelectorAll(".info-section, .feature-card, .testimonial");

    // Add the initial 'fade-in' class to each element to set them up for animation
    elements.forEach(el => el.classList.add("fade-in"));

    // Create the observer with a threshold of 0.8 (80% of element visible)
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                // Optionally, stop observing once animation has triggered
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    // Start observing each target element
    elements.forEach(el => observer.observe(el));
});
