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
})();