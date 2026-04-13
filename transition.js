/**
 * =====================================================
 * SHADOW DOJO — TRANSITION SCREEN (道場の門)
 * Japanese-themed loading overlay for course page transitions.
 * Prevents content flash by covering the page until dynamic
 * course data is fully injected.
 * 
 * NOTE: The overlay HTML + CSS must be placed directly in the 
 * HTML file (in <head> style + <body> first child) for instant 
 * rendering. This script only handles the particle animation,
 * progress bar simulation, and the dismiss/exit sequence.
 * =====================================================
 */

(function () {
    'use strict';

    // --- 1. Particle System (Floating Embers) ---
    function initParticleSystem() {
        const canvas = document.getElementById('transition-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;
        let running = true;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: canvas.height + 10,
                size: Math.random() * 3 + 1,
                speedY: -(Math.random() * 1.5 + 0.5),
                speedX: (Math.random() - 0.5) * 0.8,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() > 0.5 ? 0 : 25,
                life: 0,
                maxLife: Math.random() * 200 + 100
            };
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < 40; i++) {
                const p = createParticle();
                p.y = Math.random() * canvas.height;
                p.life = Math.random() * p.maxLife;
                particles.push(p);
            }
        }

        function drawParticles() {
            if (!running) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.life++;
                p.x += p.speedX;
                p.y += p.speedY;
                p.speedX += (Math.random() - 0.5) * 0.05;

                const lifeRatio = p.life / p.maxLife;
                const alpha = lifeRatio < 0.1 ? lifeRatio * 10 :
                    lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.hue === 0
                    ? `rgba(204, 0, 0, ${p.opacity * alpha})`
                    : `rgba(255, 106, 42, ${p.opacity * alpha * 0.7})`;
                ctx.fill();

                // Glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                grad.addColorStop(0, p.hue === 0
                    ? `rgba(204, 0, 0, ${0.15 * alpha})`
                    : `rgba(255, 106, 42, ${0.1 * alpha})`);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();

                if (p.life >= p.maxLife || p.y < -20) {
                    particles[i] = createParticle();
                }
            });
            animFrame = requestAnimationFrame(drawParticles);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        initParticles();
        drawParticles();

        // Expose cleanup
        window._transitionCleanup = function () {
            running = false;
            cancelAnimationFrame(animFrame);
            window.removeEventListener('resize', resizeCanvas);
        };
    }

    // --- 2. Progress Bar Simulation ---
    function initProgressBar() {
        const progressBar = document.getElementById('trans-progress-brush');
        if (!progressBar) return;

        let progress = 0;

        function tick() {
            if (progress < 85) {
                const increment = progress < 30 ? 3 : progress < 60 ? 2 : 0.5;
                progress += increment;
                progressBar.style.width = progress + '%';
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);

        // Store ref for completeTransition
        window._transProgressBar = progressBar;
    }

    // --- 3. Public API: Complete & Dismiss ---
    window.completeTransition = function () {
        // Fill progress to 100%
        const bar = window._transProgressBar || document.getElementById('trans-progress-brush');
        if (bar) bar.style.width = '100%';

        // Short delay then exit
        setTimeout(() => {
            const el = document.getElementById('dojo-transition');
            if (el) {
                el.classList.add('trans-exit');

                // Reveal the hidden main content
                const main = document.querySelector('main');
                if (main) main.style.visibility = 'visible';

                // Cleanup after animation
                setTimeout(() => {
                    if (window._transitionCleanup) window._transitionCleanup();
                    el.remove();
                }, 900);
            }
        }, 400);
    };

    // --- 4. Initialize when DOM is ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initParticleSystem();
            initProgressBar();
        });
    } else {
        initParticleSystem();
        initProgressBar();
    }

})();
