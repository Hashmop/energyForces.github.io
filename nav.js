// nav.js

document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("navbar-toggle");
    const navbarMenu = document.getElementById("navbar-menu");

    // Toggle mobile menu on button click
    toggleButton.addEventListener("click", function() {
        navbarMenu.classList.toggle("active");
    });

    // Add event listeners to each dropdown menu
    document.querySelectorAll('.navbar-links > li > a').forEach(link => {
        if (link.nextElementSibling) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault(); // Prevent default action for mobile view
                    link.nextElementSibling.classList.toggle('active'); // Toggle the visibility of the dropdown
                }
            });
        }
    });

    // Hide dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navbarMenu.contains(event.target) || toggleButton.contains(event.target);
        if (!isClickInside) {
            document.querySelectorAll('.navbar-links .dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            navbarMenu.classList.remove('active'); // Close mobile menu if open
        }
    });
});
