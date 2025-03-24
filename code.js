'use strict';

// Theme toggle functionality
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}

// Initialize theme
(function () {
    // Default to dark theme if no theme is stored
    if (localStorage.getItem('theme') === 'theme-light') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
    
    // Set up theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Set up mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            document.body.classList.toggle('mobile-menu-active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            document.body.classList.remove('mobile-menu-active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navbar = document.querySelector('.navbar');
        const mobileMenuActive = document.body.classList.contains('mobile-menu-active');
        
        if (mobileMenuActive && !navbar.contains(event.target)) {
            document.body.classList.remove('mobile-menu-active');
        }
    });
    
    // Function to highlight sidebar links based on scroll position
    function updateSidebarHighlight() {
        // Get all section elements
        const sections = document.querySelectorAll('.content-section, .card[id]');
        const sidebarLinks = document.querySelectorAll('.sidebar-link, .sidebar-sublink');
        
        // Track visible sections and their visibility percentages
        const visibleSections = [];
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Check if section is visible
            const isVisible = (
                rect.top < viewportHeight && 
                rect.bottom > 0 && 
                rect.height > 0
            );
            
            if (isVisible) {
                // Calculate visibility ratio (how much is visible)
                const visibleTop = Math.max(rect.top, 0);
                const visibleBottom = Math.min(rect.bottom, viewportHeight);
                const visibleHeight = visibleBottom - visibleTop;
                
                // Include element position in scoring (prefer elements near top of viewport)
                // This helps with small elements
                const positionScore = 1 - (visibleTop / viewportHeight);
                
                // Apply a minimum threshold for small elements
                const threshold = Math.min(0.3, rect.height / viewportHeight / 2);
                
                // Calculate weighted score: visibility ratio + position advantage
                const score = (visibleHeight / rect.height) + positionScore;
                
                visibleSections.push({
                    id: section.id,
                    score: score,
                    threshold: threshold
                });
            }
        });
        
        // No visible sections
        if (visibleSections.length === 0) return;
        
        // Sort by score (highest first)
        visibleSections.sort((a, b) => b.score - a.score);
        
        // Get the highest scoring section that meets the minimum threshold
        const currentSection = visibleSections[0];
        
        // Remove active class from all links
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to the corresponding link
        if (currentSection && currentSection.id) {
            const activeLink = document.querySelector(`.sidebar-link[href="#${currentSection.id}"], .sidebar-sublink[href="#${currentSection.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                
                // If it's a sublink, keep the parent section expanded and highlighted
                if (activeLink.classList.contains('sidebar-sublink')) {
                    const parentSubsection = activeLink.closest('.sidebar-subsection');
                    if (parentSubsection) {
                        // Ensure parent subsection is visible
                        parentSubsection.style.display = 'flex';
                        
                        // Highlight the parent link if it exists
                        const parentLink = parentSubsection.previousElementSibling;
                        if (parentLink && parentLink.classList.contains('sidebar-link')) {
                            parentLink.classList.add('active');
                        }
                        
                        // Scroll the sidebar to make the active link visible
                        activeLink.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                }
            }
        }
    }

    // Add scroll event listener with debounce for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateSidebarHighlight, 10); // Short timeout for smoother experience
    });

    // Initialize sidebar highlight on page load
    document.addEventListener('DOMContentLoaded', function() {
        updateSidebarHighlight();
        // Any other initialization code
    });
    
    // Add smooth scrolling with offset for anchor links
    document.addEventListener('DOMContentLoaded', function() {
        // Get all links that point to an anchor on the same page
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        // Add click handler to each anchor link
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Prevent default anchor jump behavior
                e.preventDefault();
                
                // Get the target element
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Get the height of the navbar and any other fixed elements
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const offset = navbarHeight + 20; // Add some extra padding (20px)
                    
                    // Calculate the correct scroll position
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - offset;
                    
                    // Scroll smoothly to the target with offset
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update the URL hash without jumping
                    history.pushState(null, null, '#' + targetId);
                    
                    // Highlight the active sidebar link
                    setTimeout(updateSidebarHighlight, 500);
                }
            });
        });
        
        // Handle initial page load with hash in URL
        if (window.location.hash) {
            // Get the target element from the URL hash
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Wait a moment for the page to fully load
                setTimeout(function() {
                    // Get the height of the navbar
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const offset = navbarHeight + 20; // Add some extra padding
                    
                    // Calculate the correct scroll position
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - offset;
                    
                    // Scroll to the target with offset
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'auto'
                    });
                }, 100);
            }
        }
    });
})();