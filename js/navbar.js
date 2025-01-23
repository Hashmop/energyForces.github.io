// components/navbar.js
class Navbar {
    constructor() {
        this.navbar = document.createElement('nav');
        this.navbar.className = 'navbar';
    }

    createNavLinks() {
        return [
            { href: '../html/index.html', text: 'Home' },
            { href: '../html/ev-charging.html', text: 'EV Charging' },
            { href: '../html/careers.html', text: 'Careers' },
            { href: '../html/about-us.html', text: 'About Us' },
            { href: '../html/services.html', text: 'Services' },
            { href: '../html/resources.html', text: 'Resources' },
            { href: '../html/contact-us.html', text: 'Contact Us' }
        ];
    }

    render() {
        // Create brand section
        const brand = document.createElement('div');
        brand.className = 'navbar-brand';
        brand.innerHTML = `
            <a href="../html/index.html">
                <img src="../images/logo.png" alt="Energy Force Logo" width="103" height="106" class="navbar-logo">
            </a>
        `;

        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'navbar-toggle';
        toggle.id = 'navbar-toggle';
        toggle.setAttribute('aria-label', 'Toggle navigation');
        toggle.innerHTML = '&#9776;';

        // Create menu
        const menu = document.createElement('div');
        menu.className = 'navbar-menu';
        menu.id = 'navbar-menu';

        // Add nav links
        this.createNavLinks().forEach(link => {
            const div = document.createElement('div');
            div.className = 'navbar-link';
            div.innerHTML = `<a href="${link.href}">${link.text}</a>`;
            menu.appendChild(div);
        });

        // Assemble navbar
        this.navbar.appendChild(brand);
        this.navbar.appendChild(toggle);
        this.navbar.appendChild(menu);

        return this.navbar;
    }

    init() {
        // Add event listeners
        const toggle = this.navbar.querySelector('#navbar-toggle');
        const menu = this.navbar.querySelector('#navbar-menu');

        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            if (!this.navbar.contains(event.target)) {
                menu.classList.remove('active');
            }
        });
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    const navbar = new Navbar();
    const renderedNav = navbar.render();
    document.body.insertBefore(renderedNav, document.body.firstChild);
    navbar.init();
});