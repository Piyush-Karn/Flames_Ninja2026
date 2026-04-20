        /* =====================================================
           DOM CACHE & INITIALIZATION
           ===================================================== */
        const DOM = {
            loadingScreen: document.getElementById('loading-screen'),
            loaderBar: document.getElementById('loader-bar'),
            loaderPercent: document.getElementById('loader-percent'),
            loaderCanvas: document.getElementById('loader-canvas'),
            header: document.querySelector('header'),
            heroTitle: document.getElementById('hero-title-main'),
            katanaBlade: document.getElementById('katana-blade'),
            smokeWrap: document.getElementById('smoke-parallax'),
            chapterLabel: document.getElementById('chapter-label'),
            bladeClipRect: document.getElementById('blade-clip-rect'),
            katanaStand: document.getElementById('katana-blade'),
            katanaGleam: document.getElementById('katana-gleam'),
            bladeFill: document.getElementById('katana-blade-fill'),
            hero: document.getElementById('hero'),
            transSection: document.getElementById('transformation'),
            compSlider: document.getElementById('comp-slider'),
            cinematicImg: document.querySelector('.cinematic-image')
        };

        const loaderCtx = DOM.loaderCanvas.getContext('2d');
        let loaderParticles = [];
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;

        const sectionCache = {};
        const updateWinSize = () => {
            winWidth = window.innerWidth;
            winHeight = window.innerHeight;
            DOM.loaderCanvas.width = winWidth;
            DOM.loaderCanvas.height = winHeight;

            // Background Cache Layout to avoid getBoundingClientRect in loop
            if (DOM.transSection) {
                const rect = DOM.transSection.getBoundingClientRect();
                sectionCache.transformation = {
                    top: rect.top + window.scrollY,
                    height: DOM.transSection.offsetHeight
                };
            }
            if (DOM.cinematicImg) {
                const rect = DOM.cinematicImg.getBoundingClientRect();
                sectionCache.cinematic = {
                    top: rect.top + window.scrollY,
                    height: DOM.cinematicImg.offsetHeight
                };
            }
        };
        window.addEventListener('resize', updateWinSize, { passive: true });
        updateWinSize();

        /* =====================================================
           0. LOADING SCREEN — CINEMATIC PRELUDE
           ===================================================== */
        class LoaderParticle {
            constructor() {
                this.x = Math.random() * winWidth;
                this.y = Math.random() * winHeight;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0) this.x = winWidth;
                if (this.x > winWidth) this.x = 0;
                if (this.y < 0) this.y = winHeight;
                if (this.y > winHeight) this.y = 0;
            }

            draw() {
                loaderCtx.fillStyle = `rgba(255, 106, 42, ${this.opacity})`;
                loaderCtx.beginPath();
                loaderCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                loaderCtx.fill();
            }
        }

        for (let i = 0; i < 80; i++) {
            loaderParticles.push(new LoaderParticle());
        }

        function animateLoaderParticles() {
            loaderCtx.clearRect(0, 0, winWidth, winHeight);
            const len = loaderParticles.length;
            for (let i = 0; i < len; i++) {
                const p = loaderParticles[i];
                p.update();
                p.draw();

                // Optimized connection logic
                for (let j = i + 1; j < len; j++) {
                    const b = loaderParticles[j];
                    const dx = p.x - b.x;
                    const dy = p.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        loaderCtx.strokeStyle = `rgba(255, 106, 42, ${0.05 * (1 - dist / 120)})`;
                        loaderCtx.lineWidth = 0.5;
                        loaderCtx.beginPath();
                        loaderCtx.moveTo(p.x, p.y);
                        loaderCtx.lineTo(b.x, b.y);
                        loaderCtx.stroke();
                    }
                }
            }

            if (!DOM.loadingScreen.classList.contains('fade-out')) {
                requestAnimationFrame(animateLoaderParticles);
            }
        }
        animateLoaderParticles();

        let loadProgress = 0;
        const loadInterval = setInterval(() => {
            loadProgress += Math.random() * 15 + 5;
            if (loadProgress >= 100) {
                loadProgress = 100;
                clearInterval(loadInterval);
                setTimeout(revealSite, 400);
            }
            DOM.loaderBar.style.transform = `scaleX(${loadProgress / 100})`;
            DOM.loaderPercent.textContent = Math.floor(loadProgress) + '%';
        }, 200);

        function revealSite() {
            DOM.loadingScreen.classList.add('fade-out');
            document.body.classList.add('curtains-open');

            const heroElements = document.querySelectorAll('.hero-element');
            heroElements.forEach((el, i) => {
                setTimeout(() => {
                    el.style.transition = 'opacity 1s cubic-bezier(0.2, 1, 0.3, 1), transform 1s cubic-bezier(0.2, 1, 0.3, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translate3d(0,0,0)';
                    el.style.willChange = 'opacity, transform';
                }, 800 + (i * 200));
            });

            setTimeout(() => {
                DOM.header.style.transform = 'translate3d(0,0,0)';
            }, 600);

            setTimeout(() => {
                DOM.loadingScreen.style.display = 'none';
                initLenis();
            }, 1500);
        }

        /* =====================================================
           1. LENIS SMOOTH SCROLL
           ===================================================== */
        const chapters = [
            { id: 'hero', label: 'I', name: 'THE AWAKENING' },
            { id: 'intel', label: 'II', name: 'TACTICAL INTEL' },
            { id: 'arsenal', label: 'III', name: 'THE ARSENAL' },
            { id: 'transformation', label: 'IV', name: 'THE REBIRTH' },
            { id: 'faq', label: 'V', name: 'DOJO INQUIRIES' },
            { id: 'reviews', label: 'VI', name: 'CLIENT INTEL' },
            { id: 'final-gate', label: 'VII', name: 'THE GATE' }
        ];

        let lenis;
        const BLADE_FULL_W = 710;
        let gleamFired = false;
        let rafPending = false;

        // Cache persistent chapter elements
        const chapterElements = chapters.map(ch => ({ ...ch, el: document.getElementById(ch.id) }));

        function initLenis() {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                smooth: true
            });

            function onScrollUpdate(scrollY) {
                const docHeight = document.documentElement.scrollHeight - winHeight;
                const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

                // Katana blade progress bar (top) — Static and visible on mobile
                if (winWidth > 768) {
                    DOM.bladeFill.style.transform = `scaleX(${scrollPercent / 100})`;
                    if (scrollPercent > 1) DOM.bladeFill.classList.add('drawing');
                    else DOM.bladeFill.classList.remove('drawing');
                } else {
                    DOM.bladeFill.style.transform = 'scaleX(1)';
                    DOM.bladeFill.classList.add('drawing');
                }

                // Chapter label
                let activeChapter = chapters[0];
                const viewThreshold = winHeight * 0.4;
                for (const ch of chapterElements) {
                    if (ch.el) {
                        const rect = ch.el.getBoundingClientRect();
                        if (rect.top <= viewThreshold) activeChapter = ch;
                    }
                }
                if (DOM.chapterLabel.dataset.lastId !== activeChapter.id) {
                    DOM.chapterLabel.dataset.lastId = activeChapter.id;
                    DOM.chapterLabel.innerHTML = `<span>${activeChapter.label}</span> — ${activeChapter.name}`;
                }

                // Hero parallax (only while in hero)
                if (scrollY < winHeight * 1.5) {
                    const scale = Math.max(0.7, 1 - scrollY * 0.0004);
                    const heroY = scrollY * 0.25;
                    const bladeY = scrollY * 0.15;

                    DOM.heroTitle.style.transform = `translate3d(0,${heroY}px,0) scale(${scale})`;
                    DOM.heroTitle.style.opacity = Math.max(0, 1 - scrollY * 0.001);
                    DOM.katanaBlade.style.transform = `translate3d(0,${bladeY}px,0)`;

                    // ── Scroll-driven unsheathe — Always visible on mobile ──
                    if (winWidth > 768) {
                        const unsheatheP = Math.min(1, scrollY / (winHeight * 0.6));
                        const bladeW = Math.round(unsheatheP * BLADE_FULL_W);
                        DOM.bladeClipRect.setAttribute('width', bladeW);

                        DOM.katanaStand.classList.remove('heated-1', 'heated-2');
                        if (unsheatheP > 0.7) DOM.katanaStand.classList.add('heated-2');
                        else if (unsheatheP > 0.35) DOM.katanaStand.classList.add('heated-1');

                        if (unsheatheP >= 0.98 && !gleamFired) {
                            gleamFired = true;
                            DOM.katanaGleam.classList.add('flash');
                            setTimeout(() => DOM.katanaGleam.classList.remove('flash'), 350);
                        } else if (unsheatheP < 0.9) gleamFired = false;
                    } else {
                        DOM.bladeClipRect.setAttribute('width', BLADE_FULL_W);
                        DOM.katanaStand.classList.add('heated-2');
                    }
                }

                // ── Transformation section expansion (LAYOUT-FREE MAPPING) ──
                if (DOM.transSection && DOM.compSlider && winWidth > 768 && sectionCache.transformation) {
                    const sectionTop = sectionCache.transformation.top;
                    const sectionH = sectionCache.transformation.height;
                    const maxScroll = sectionH - winHeight;

                    const relativeScroll = scrollY - sectionTop;
                    let progress = 0;
                    if (relativeScroll >= 0) progress = Math.min(1, relativeScroll / maxScroll);

                    let p = 0;
                    if (progress < 0.25) p = progress / 0.25;
                    else if (progress >= 0.25 && progress <= 0.75) p = 1;
                    else p = 1 - ((progress - 0.75) / 0.25);

                    if (!window._rebirthState) window._rebirthState = { lastP: -1, lastFull: null, lastNav: null };

                    if (Math.abs(p - window._rebirthState.lastP) > 0.003) {
                        window._rebirthState.lastP = p;
                        const scaleX = winWidth / 1000;
                        const scaleY = winHeight / 600;
                        const maxScale = Math.max(scaleX, scaleY);
                        const easeP = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

                        // Round to 3 decimal places to reduce sub-pixel recompositing
                        const scaleVal = Math.round((1 + (maxScale - 1) * easeP) * 1000) / 1000;
                        DOM.compSlider.style.transform = `scale(${scaleVal}) translate3d(0,0,0)`;

                        // Toggle is-fullscreen EARLY (at 5%) to kill expensive box-shadow,
                        // border-radius, and pseudo-element paints before heavy scaling kicks in
                        const isFull = easeP > 0.05;
                        if (isFull !== window._rebirthState.lastFull) {
                            window._rebirthState.lastFull = isFull;
                            DOM.compSlider.classList.toggle('is-fullscreen', isFull);
                        }

                        if (DOM.header) {
                            const hideNav = easeP > 0.02;
                            if (hideNav !== window._rebirthState.lastNav) {
                                window._rebirthState.lastNav = hideNav;
                                DOM.header.style.transform = hideNav ? 'translate3d(0,-100%,0)' : 'translate3d(0,0,0)';
                            }
                        }
                    }
                } else if (DOM.compSlider && winWidth <= 768) {
                    if (window._rebirthState?.lastFull !== null) {
                        DOM.compSlider.style.transform = '';
                        DOM.compSlider.classList.remove('is-fullscreen');
                        if (DOM.header) DOM.header.style.transform = '';
                        window._rebirthState = { lastP: -1, lastFull: null, lastNav: null };
                    }
                }

                DOM.smokeWrap.style.transform = `translate3d(0,${-scrollY * 0.05}px,0)`;

                if (DOM.cinematicImg && sectionCache.cinematic) {
                    const cTop = sectionCache.cinematic.top;
                    const cHeight = sectionCache.cinematic.height;
                    if (scrollY + winHeight > cTop && scrollY < cTop + cHeight) {
                        DOM.cinematicImg.classList.add('in-view');
                    }
                }
            }

            onScrollUpdate(window.scrollY);

            lenis.on('scroll', (e) => {
                if (!rafPending) {
                    rafPending = true;
                    requestAnimationFrame(() => {
                        onScrollUpdate(window.scrollY);
                        rafPending = false;
                    });
                }
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }


        /* =====================================================
           2. COUNTDOWN TIMER
           ===================================================== */
        let timeInSeconds = (2 * 24 * 3600) + (14 * 3600) + (55 * 60);
        function updateCountdown() {
            timeInSeconds--;
            if (timeInSeconds < 0) timeInSeconds = 0;
            const d = Math.floor(timeInSeconds / (24 * 3600));
            const h = Math.floor((timeInSeconds % (24 * 3600)) / 3600);
            const m = Math.floor((timeInSeconds % 3600) / 60);
            document.getElementById('cd-days').textContent = d.toString().padStart(2, '0');
            document.getElementById('cd-hours').textContent = h.toString().padStart(2, '0');
            document.getElementById('cd-minutes').textContent = m.toString().padStart(2, '0');
        }
        setInterval(updateCountdown, 60000);


        /* =====================================================
           3. FIRE PARTICLES (Interactive)
           ===================================================== */
        const fireCanvas = document.getElementById('fireParticles');
        const fireCtx = fireCanvas.getContext('2d');
        let fireParticles = [];
        let mouseX = winWidth / 2;
        let mouseY = winHeight;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const updateFireCanvasSize = () => {
            fireCanvas.width = winWidth;
            fireCanvas.height = winHeight;
        };
        window.addEventListener('resize', updateFireCanvasSize, { passive: true });
        updateFireCanvasSize();

        class FireParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * winWidth;
                this.y = winHeight + Math.random() * 50;
                this.size = Math.random() * 4 + 1;
                this.speedY = Math.random() * 2.5 + 0.8;
                this.speedX = (Math.random() - 0.5) * 1.2;
                this.life = 1;
                this.decay = Math.random() * 0.012 + 0.004;
                const colors = [
                    'rgba(255, 106, 42, ',
                    'rgba(255, 138, 77, ',
                    'rgba(255, 80, 20, ',
                    'rgba(255, 160, 60, '
                ];
                this.colorBase = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                const dx = mouseX - this.x;
                this.x += this.speedX + (dx * 0.001);
                this.y -= this.speedY;
                this.life -= this.decay;
                if (this.size > 0.1) this.size -= 0.02;
                if (this.life <= 0 || this.size <= 0) this.reset();
            }

            draw() {
                const alpha = this.life * 0.8;
                fireCtx.globalAlpha = alpha;
                fireCtx.fillStyle = this.colorBase + this.life + ')';
                fireCtx.beginPath();
                fireCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                fireCtx.fill();

                // Glow (optimized to draw less frequently or simpler)
                fireCtx.globalAlpha = alpha * 0.3;
                fireCtx.beginPath();
                fireCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                fireCtx.fill();
            }
        }

        for (let i = 0; i < 80; i++) {
            fireParticles.push(new FireParticle());
        }

        let isFireVisible = true;
        const fireObserver = new IntersectionObserver((entries) => {
            isFireVisible = entries[0].isIntersecting;
        }, { threshold: 0.1 });
        if (DOM.hero) fireObserver.observe(DOM.hero);

        function animateFireParticles() {
            if (isFireVisible) {
                fireCtx.clearRect(0, 0, winWidth, winHeight);
                const len = fireParticles.length;
                for (let i = 0; i < len; i++) {
                    const p = fireParticles[i];
                    p.update();
                    p.draw();
                }
            }
            requestAnimationFrame(animateFireParticles);
        }
        animateFireParticles();



        // =====================================================
        // BUTTON INTERACTIONS & SLASH TRANSITION
        // =====================================================
        const magneticBtn = document.getElementById('hero-btn');
        const katanaStandEl = document.getElementById('katana-blade');
        const slashOverlay = document.getElementById('slash-overlay');
        const particlesContainer = document.getElementById('slash-particles');
        let slashUsed = false;

        // Spark Generator
        function createSparks() {
            particlesContainer.innerHTML = '';
            // Generate 25 random sparks
            for (let i = 0; i < 25; i++) {
                let spark = document.createElement('div');
                spark.className = 'slash-spark';

                // Position sparks randomly along the *visible* middle portion of the blade
                spark.style.left = (35 + Math.random() * 30) + '%';
                spark.style.top = '50%';

                // Calculate random explosion physics
                let angle = Math.random() * Math.PI * 2;
                let distance = 60 + Math.random() * 200; // How far they fly
                spark.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                spark.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

                // Add slight delay variation
                spark.style.animationDelay = (Math.random() * 0.1) + 's';
                particlesContainer.appendChild(spark);
            }
        }

        // Magnetic effect
        magneticBtn.style.willChange = 'transform';
        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            magneticBtn.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
        }, { passive: true });

        magneticBtn.addEventListener('mouseleave', () => {
            magneticBtn.style.transform = 'translate3d(0, 0, 0)';
        }, { passive: true });

        // Blade glowing on hover
        magneticBtn.addEventListener('mouseenter', () => {
            katanaStandEl.classList.add('cta-active');
        });
        magneticBtn.addEventListener('mouseleave', () => {
            katanaStandEl.classList.remove('cta-active');
        });

        // Slash logic (click to fire)
        magneticBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (slashUsed) return;
            slashUsed = true;

            // Generate sparks before firing
            createSparks();

            // Fire the slash and screen shake
            slashOverlay.classList.add('firing');
            document.body.classList.add('shaking');

            // Scroll down slightly after the impact frame restored
            setTimeout(() => {
                const target = document.querySelector('#arsenal');
                if (target && lenis) {
                    lenis.scrollTo(target, { offset: -80, duration: 1.5 });
                } else if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 250);

            // Reset classes
            setTimeout(() => {
                slashOverlay.classList.remove('firing');
                document.body.classList.remove('shaking');
                slashUsed = false;
            }, 600);
        });


        /* =====================================================
           5. SCROLL REVEAL + COUNTING ANIMATION
           ===================================================== */
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');

                    // Counting animation
                    const counters = entry.target.querySelectorAll('[data-count]');
                    counters.forEach(counter => {
                        if (counter.dataset.counted) return;
                        counter.dataset.counted = 'true';

                        const target = parseInt(counter.dataset.count);
                        const suffix = counter.dataset.suffix || '';
                        const duration = 2000;
                        const start = performance.now();

                        function animateCount(currentTime) {
                            const elapsed = currentTime - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.floor(eased * target);
                            counter.textContent = current + suffix;

                            if (progress < 1) {
                                requestAnimationFrame(animateCount);
                            } else {
                                counter.textContent = target + suffix;
                            }
                        }
                        requestAnimationFrame(animateCount);
                    });
                } else {
                    // Optimized: remove class to pause animations when out of view
                    entry.target.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.reveal-up, .reveal-scale, .stat-card, #hero, #transformation').forEach(el => {
            revealObserver.observe(el);
        });

        // Philosophy text word-by-word animation
        document.querySelectorAll('.immersion-text').forEach(el => {
            const text = el.textContent.trim();
            el.innerHTML = text.split(' ').map((word, i) =>
                `<span style="transition-delay:${i * 60}ms">${word}</span>`
            ).join(' ');
            revealObserver.observe(el);
        });




        /* =====================================================
           8. BEFORE VS AFTER SLIDER LOGIC
           ===================================================== */
        (function () {
            const compSlider = DOM.compSlider;
            const afterPanel = document.getElementById('after-panel');
            const sliderHandle = document.getElementById('slider-handle');

            if (compSlider && winWidth > 768) {
                let isDragging = false;
                let sliderRect = null;

                const updateSlider = (x) => {
                    if (!sliderRect) sliderRect = compSlider.getBoundingClientRect();
                    let position = ((x - sliderRect.left) / sliderRect.width) * 100;

                    // Constraints
                    if (position < 2) position = 2;
                    if (position > 98) position = 98;

                    // Transition to transform or just keep clipPath if it's already performant 
                    // (Clip-path is generally fast on modern browsers but transform is safer)
                    afterPanel.style.clipPath = `inset(0 0 0 ${position}%)`;
                    sliderHandle.style.transform = `translate3d(${position}%, 0, 0)`;
                };

                compSlider.addEventListener('mousemove', (e) => {
                    if (!isDragging) updateSlider(e.clientX);
                }, { passive: true });

                compSlider.addEventListener('mousedown', () => {
                    isDragging = true;
                    sliderRect = compSlider.getBoundingClientRect(); // Update rect on start
                }, { passive: true });

                window.addEventListener('mouseup', () => isDragging = false, { passive: true });

                compSlider.addEventListener('touchstart', (e) => {
                    sliderRect = compSlider.getBoundingClientRect();
                    updateSlider(e.touches[0].clientX);
                }, { passive: true });

                compSlider.addEventListener('touchmove', (e) => {
                    updateSlider(e.touches[0].clientX);
                }, { passive: true });
            }
        })();

        /* =====================================================
           9. FAQ ACCORDION LOGIC
           ===================================================== */
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });

                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });

        /* =====================================================
           10. REVIEWS CAROUSEL LOGIC — SEAMLESS INFINITE LOOP
           ===================================================== */
        (function () {
            const track = document.getElementById('rev-track');
            const nextBtn = document.getElementById('rev-next');
            const prevBtn = document.getElementById('rev-prev');
            const progressLine = document.getElementById('rev-progress');

            if (!track) return;

            const cards = Array.from(track.children);
            const cardCount = cards.length;
            let index = 0;
            let isTransitioning = false;
            let autoRotateTimer = null;
            const ROTATION_SPEED = 6000;

            // Setup Clones for Seamless Loop
            const firstClone = cards[0].cloneNode(true);
            const lastClone = cards[cardCount - 1].cloneNode(true);

            track.appendChild(firstClone);
            track.insertBefore(lastClone, cards[0]);

            // Adjust initial position (start at first real card)
            const getCardWidth = () => {
                const card = track.querySelector('.review-bubble');
                // Capture the exact width + gap (40px)
                return card.offsetWidth + 40;
            };

            const updateUI = (instant = false) => {
                if (instant) track.style.transition = 'none';
                else track.style.transition = 'transform 0.8s cubic-bezier(0.2, 1, 0.3, 1)';

                // Offset +1 because of the prepended lastClone
                track.style.transform = `translateX(-${(index + 1) * getCardWidth()}px)`;

                if (progressLine) {
                    const realIndex = (index + cardCount) % cardCount;
                    progressLine.style.width = `${((realIndex + 1) / cardCount) * 100}%`;
                }

                if (instant) {
                    // Force reflow
                    track.offsetHeight;
                }
            };

            const next = () => {
                if (isTransitioning) return;
                isTransitioning = true;
                index++;
                updateUI();
            };

            const prev = () => {
                if (isTransitioning) return;
                isTransitioning = true;
                index--;
                updateUI();
            };

            track.addEventListener('transitionend', () => {
                isTransitioning = false;

                // Snap checks
                if (index >= cardCount) {
                    index = 0; // Jump to real first card
                    updateUI(true);
                } else if (index <= -1) {
                    index = cardCount - 1; // Jump to real last card
                    updateUI(true);
                }
            });

            // Controls
            nextBtn?.addEventListener('click', () => { next(); startAuto(); });
            prevBtn?.addEventListener('click', () => { prev(); startAuto(); });

            // Auto-rotation
            const startAuto = () => {
                stopAuto();
                autoRotateTimer = setInterval(next, ROTATION_SPEED);
            };
            const stopAuto = () => clearInterval(autoRotateTimer);

            track.addEventListener('mouseenter', stopAuto);
            track.addEventListener('mouseleave', startAuto);

            window.addEventListener('resize', () => updateUI(true));

            // Init
            updateUI(true);
            startAuto();
        })();


        /* =====================================================
           7. SMOOTH SCROLL NAVIGATION
           ===================================================== */
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target && lenis) {
                    lenis.scrollTo(target, { offset: -80, duration: 1.5 });
                }
            });
        });

        /* =====================================================
           12. HOW IT WORKS — RIBBON TIMELINE LOGIC
           ===================================================== */
        (function () {
            const tlData = [
                {
                    phase: 'Phase 01',
                    title: 'PICK YOUR TRACK',
                    text: 'Choose the path that matches your goal',
                    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6 4H14C15.1046 4 16 4.89543 16 6V18C16 19.1046 15.1046 20 14 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4Z" fill="#2a0a00" stroke="#ff5500" stroke-width="1.5"/><path d="M16 6C16 4.89543 16.8954 4 18 4C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20C16.8954 20 16 19.1046 16 18" fill="#ff8a5a" stroke="#ff5500" stroke-width="1.5"/><line x1="8" y1="9" x2="12" y2="9" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="13" x2="10" y2="13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/></svg>'
                },
                {
                    phase: 'Phase 02',
                    title: 'FOLLOW DAILY TASKS',
                    text: 'Show up every day. No skipping.',
                    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" style="transform: rotate(45deg);"><path d="M12 2L15 10L12 16L9 10L12 2Z" fill="#2a0a00" stroke="#ff5500" stroke-width="1.5" stroke-linejoin="round"/><rect x="11" y="16" width="2" height="4" fill="#ff8a5a" stroke="#ff5500" stroke-width="1.5"/><circle cx="12" cy="21.5" r="1.5" fill="none" stroke="#ffffff" stroke-width="1.5"/><line x1="12" y1="5" x2="12" y2="13" stroke="#ff8a5a" stroke-width="1.5"/></svg>'
                },
                {
                    phase: 'Phase 03',
                    title: 'BUILD PROJECTS',
                    text: 'Real projects that solve real problems',
                    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#2a0a00" stroke="#ff5500" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="#ff8a5a" stroke="#ffffff" stroke-width="1.5"/></svg>'
                },
                {
                    phase: 'Phase 04',
                    title: 'BECOME JOB-READY',
                    text: 'Walk out with a portfolio, not just notes',
                    icon: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#2a0a00" stroke="#ff5500" stroke-width="1.5"/><rect x="5.5" y="8" width="13" height="6" rx="3" fill="#ff8a5a" stroke="#ff5500" stroke-width="1.5"/><circle cx="9" cy="11" r="1.5" fill="#ffffff"/><circle cx="15" cy="11" r="1.5" fill="#ffffff"/><path d="M20 10.5L23 9M20.5 12.5L23 14" stroke="#ff5500" stroke-width="1.5" stroke-linecap="round"/></svg>'
                }
            ];

            const wrapper = document.getElementById('tl4-cards');
            const wrapContainer = document.getElementById('tl4-wrap');
            const pathEl = document.querySelector('#how-it-works .ribbon-path');
            const sparkEl = document.querySelector('#how-it-works .ribbon-spark');

            // Mathematical formula to track the stretched SVG bezier curve (1500px wide)
            function ribbonPoint(t) {
                if (t < 0.33) {
                    const lt = t / 0.33;
                    return { x: 0 + lt * 500, y: 200 + (80 - 200) * lt * lt };
                } else if (t < 0.67) {
                    const lt = (t - 0.33) / 0.34;
                    return { x: 500 + lt * (1000 - 500), y: 80 + (280 - 80) * lt };
                } else {
                    const lt = (t - 0.67) / 0.33;
                    return { x: 1000 + lt * (1500 - 1000), y: 280 + (160 - 280) * lt };
                }
            }

            // Positions mapping to nodes along the curve (matching the 4 phases)
            const ts = [0.12, 0.38, 0.62, 0.88];
            const ribbonNodes = [];

            ts.forEach((t, i) => {
                const pt = ribbonPoint(t);
                const xr = pt.x / 1500 * 100;
                const yr = pt.y / 320 * 100;

                // Determine strict alternation: Below, Above, Below, Above
                const above = (i % 2 !== 0);

                // Create Node (Diamond) with Number
                const node = document.createElement('div');
                node.className = 'ribbon-node';
                node.style.cssText = `left:${xr}%; top:${yr}%; opacity:0; transition:opacity 0.5s ${0.4 + i * 0.3}s;`;
                node.innerHTML = `<div class="gem"><span class="gem-text">0${i + 1}</span></div>`;
                wrapper.appendChild(node);
                ribbonNodes.push(node);

                // Create Associated Card
                const card = document.createElement('div');
                card.className = `ribbon-card ${above ? 'above' : 'below'}`;

                // Calculate top/bottom offset anchoring exactly to the node
                if (above) {
                    const bottomOffset = `calc(${100 - yr}% + 35px)`;
                    card.style.cssText = `left:${xr}%; bottom:${bottomOffset}; transition:all 0.7s ${0.6 + i * 0.3}s;`;
                } else {
                    const topOffset = `calc(${yr}% + 35px)`;
                    card.style.cssText = `left:${xr}%; top:${topOffset}; transition:all 0.7s ${0.6 + i * 0.3}s;`;
                }

                card.innerHTML = `
                <div class="weapon-card">
                  <span class="c-icon">${tlData[i].icon}</span>
                  <div class="c-year">${tlData[i].phase}</div>
                  <div class="c-title">${tlData[i].title}</div>
                  <div class="c-text">${tlData[i].text}</div>
                </div>
              `;
                wrapper.appendChild(card);
            });

            // ───── INTERSECTION OBSERVER FOR ANIMATION ─────
            const obs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    pathEl.classList.add('drawn');
                    sparkEl.classList.add('go');

                    setTimeout(() => {
                        ribbonNodes.forEach((n, i) => setTimeout(() => n.style.opacity = '1', i * 220));
                        document.querySelectorAll('#how-it-works .ribbon-card').forEach((c, i) => setTimeout(() => c.classList.add('visible'), 500 + i * 220));
                    }, 1200);

                    obs.disconnect();
                }
            }, { threshold: 0.3 });

            if (wrapContainer) obs.observe(wrapContainer);

            // ───── HORIZONTAL SCROLL WITH MOUSE WHEEL ─────
            const scrollWrapper = document.querySelector('#how-it-works .timeline-wrapper');
            scrollWrapper?.addEventListener('wheel', (e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && window.innerWidth <= 768) {
                    e.preventDefault();
                    scrollWrapper.scrollLeft += e.deltaY * 1.5;
                }
            }, { passive: false });

        })();

