                (function () {
                    const counters = document.querySelectorAll('.counter-value[data-target]');
                    const counterObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const el = entry.target;
                                const target = +el.dataset.target;
                                const duration = 1800;
                                const start = performance.now();
                                function tick(now) {
                                    const elapsed = now - start;
                                    const progress = Math.min(elapsed / duration, 1);
                                    const eased = 1 - Math.pow(1 - progress, 4);
                                    el.textContent = Math.floor(eased * target);
                                    if (progress < 1) requestAnimationFrame(tick);
                                    else el.textContent = target;
                                }
                                requestAnimationFrame(tick);
                                counterObserver.unobserve(el);
                            }
                        });
                    }, { threshold: 0.3 });
                    counters.forEach(c => counterObserver.observe(c));
                })();
        lucide.createIcons();

        document.addEventListener('DOMContentLoaded', () => {

            if (typeof COURSE_DATA === 'undefined') {
                window.COURSE_DATA = {
                    'mern': {
                        hero: { title: "MASTER<br>THE MERN<br>STACK", tag: "プレミアムな選択" },
                        overlay: { title: "PRODUCTION<br>LEVEL<br>SKILLS", tag: "WARRIORS PATH" },
                        pricing: { oldPrice: "₹3999.00", newPrice: "₹2999.00", offer: "Limited-time offer" },
                        curriculum: { stats: "Core<br>Essentials.<br><span id='stepper-highlight' class='text-[#ff6a2a]'>Master Skill.</span>", phases: [] }
                    }
                };
            }

            function renderCourse() {
                const params = new URLSearchParams(window.location.search);
                const courseId = params.get('course') || 'mern';
                const data = COURSE_DATA[courseId] || COURSE_DATA['mern'];

                const cleanTitle = data.hero.title.replace(/<br>/g, ' ');
                document.getElementById('page-title').innerText = `${cleanTitle} | Shadow Dojo`;

                document.getElementById('hero-tag-jp').innerHTML = data.hero.tag;
                document.getElementById('hero-title').innerHTML = data.hero.title;

                document.getElementById('old-price').innerText = data.pricing.oldPrice;
                document.getElementById('new-price').innerText = data.pricing.newPrice;
                
                const hOldPrice = document.getElementById('hero-old-price');
                if (hOldPrice) hOldPrice.innerText = data.pricing.oldPrice;
                
                const hNewPrice = document.getElementById('hero-new-price');
                if (hNewPrice) hNewPrice.innerText = data.pricing.newPrice;

                const offerEl = document.getElementById('price-offer');
                if (offerEl) offerEl.innerHTML = `${data.pricing.offer}`;

                document.querySelectorAll('.hero-price-display').forEach(el => el.innerText = data.pricing.newPrice);

                // Dynamically calculate phase and module counts
                const numPhases = data.curriculum.phases ? data.curriculum.phases.length : 0;
                const numModules = data.curriculum.phases ? data.curriculum.phases.reduce((acc, p) => acc + (p.modules ? p.modules.length : 0), 0) : 0;
                
                // Extract unique tagline from data (e.g., "Zero Fluff")
                const statsParts = data.curriculum.stats.split('<br>');
                const tagline = statsParts[statsParts.length - 1];

                document.getElementById('curriculum-stats').innerHTML = `${numModules} Modules.<br>${numPhases} Phases.<br>${tagline}`;

                const scrollScreen = document.getElementById('scroll-screen');
                scrollScreen.innerHTML = '';

                if (data.curriculum.phases) {
                    data.curriculum.phases.forEach((phase, index) => {
                        const slide = document.createElement('div');
                        slide.className = `screen-slide ${index === 0 ? 'active' : ''}`;
                        slide.setAttribute('data-slide', index + 1);

                        let modulesHtml = '';
                        phase.modules.forEach(mod => {
                            modulesHtml += `
                                <div class="replica-section">
                                    <h3 class="replica-section-title">${mod.title}</h3>
                                    <p class="replica-section-list">${mod.desc}</p>
                                </div>
                            `;
                        });

                        slide.innerHTML = `
                            <div><span class="replica-vol">${phase.tag}</span></div>
                            <h2 class="replica-title-brush">${phase.title}</h2>
                            <div class="replica-subtitle">
                                THE KNOWLEDGE <span class="replica-stamp-core">NINJA</span>
                            </div>
                            ${modulesHtml}
                            <div class="replica-stamp-master">
                                <div class="replica-stamp-master-inner">MASTER<br>SKILL</div>
                            </div>
                        `;
                        scrollScreen.appendChild(slide);
                    });
                }

                const phaseDotsContainer = document.getElementById('phase-dots');
                phaseDotsContainer.innerHTML = '';
                if (data.curriculum.phases) {
                    const numPhases = data.curriculum.phases.length;
                    data.curriculum.phases.forEach((phase, index) => {
                        const dot = document.createElement('div');
                        dot.className = `phase-dot ${index === 0 ? 'active' : ''}`;
                        dot.setAttribute('data-dot', index + 1);
                        dot.innerHTML = `<div class="dot-circle"></div><span class="dot-label">${phase.title}</span>`;
                        
                        // Interaction: Clicking a dot scrolls the page to that specific phase in the scroll-bound section
                        dot.addEventListener('click', () => {
                            const stepper = document.getElementById('vertical-stepper');
                            if (!stepper) return;

                            // These constants must match the ones in applyCurriculumDOMWrites
                            const openEnd = 0.20;
                            const closeStart = 0.85;

                            // Calculate target progress (midpoint of the phase's scroll range)
                            const targetContentProgress = (index + 0.5) / numPhases;
                            const targetProgress = openEnd + (targetContentProgress * (closeStart - openEnd));

                            // Calculate current absolute scroll position of the section
                            const rect = stepper.getBoundingClientRect();
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            const sectionTop = rect.top + scrollTop;
                            const scrollableHeight = rect.height - window.innerHeight;

                            // Final target scroll position
                            const targetY = sectionTop + (targetProgress * scrollableHeight);

                            window.scrollTo({
                                top: targetY,
                                behavior: 'smooth'
                            });
                        });

                        phaseDotsContainer.appendChild(dot);
                    });
                }
            }

            renderCourse();

            function executeTransitionSpin() {
                const params = new URLSearchParams(window.location.search);
                const targetCourseId = params.get('course') || 'mern';
                const ul = document.getElementById('transition-list');
                const listContainer = document.getElementById('transition-list-container');

                const getCleanTitle = (courseKey) => {
                    if (!COURSE_DATA[courseKey] || !COURSE_DATA[courseKey].hero) return courseKey.toUpperCase();
                    return COURSE_DATA[courseKey].hero.title.replace(/<br>/g, ' ').replace('MASTER ', '');
                };

                const courseKeys = Object.keys(COURSE_DATA);
                const targetKey = courseKeys.includes(targetCourseId) ? targetCourseId : courseKeys[0];
                const otherKeys = courseKeys.filter(k => k !== targetKey);

                const spinSequence = [];
                const numSpins = 3;

                for (let i = 0; i < numSpins; i++) {
                    const shuffled = [...otherKeys].sort(() => Math.random() - 0.5);
                    shuffled.forEach(key => spinSequence.push(getCleanTitle(key)));
                }

                spinSequence.push(getCleanTitle(targetKey));

                spinSequence.forEach(text => {
                    const li = document.createElement('li');
                    li.textContent = text;
                    ul.appendChild(li);
                });

                const startTime = Date.now();
                const totalDuration = 4500; // Duration in ms before we force complete

                const forceComplete = () => {
                    gsap.killTweensOf(listContainer);
                    document.getElementById('dojo-transition').classList.add('trans-exit');
                    document.querySelector('main').style.visibility = 'visible';
                    document.removeEventListener('visibilitychange', checkVisibility);
                };

                const checkVisibility = () => {
                    if (document.visibilityState === 'visible' && (Date.now() - startTime) >= totalDuration) {
                        forceComplete();
                    }
                };

                document.addEventListener('visibilitychange', checkVisibility);

                setTimeout(() => {
                    const maxScroll = listContainer.scrollHeight - listContainer.clientHeight;

                    gsap.to(listContainer, {
                        scrollTop: maxScroll,
                        duration: 3.5,
                        ease: "power3.inOut",
                        onComplete: () => {
                            setTimeout(() => {
                                if (document.getElementById('dojo-transition').classList.contains('trans-exit')) return;
                                forceComplete();
                            }, 800);
                        }
                    });
                }, 50);
            }

            executeTransitionSpin();

            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                question.addEventListener('click', () => {
                    const isOpen = item.classList.contains('faq-open');
                    faqItems.forEach(otherItem => otherItem.classList.remove('faq-open'));
                    if (!isOpen) item.classList.add('faq-open');
                });
            });

            const cinematicObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        cinematicObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
            document.querySelectorAll('.reveal-cinematic').forEach(el => cinematicObserver.observe(el));


            // --- HIGH PERFORMANCE SCROLL LOOP LOGIC ---
            // Fix layout thrashing by separating reads and writes
            let ticking = false;
            let currentPhase = 0;

            const curriculumSection = document.getElementById('vertical-stepper');
            const scrollScreen = document.getElementById('scroll-screen');
            const scrollWaxSeal = document.getElementById('scroll-wax-seal');
            const scrollGlow = document.getElementById('scroll-glow');

            function applyCurriculumDOMWrites(rect, progress) {
                const scrollable = rect.height - window.innerHeight;
                if (scrollable <= 0) return;

                const params = new URLSearchParams(window.location.search);
                const courseId = params.get('course') || 'mern';
                const data = COURSE_DATA[courseId] || COURSE_DATA['mern'];

                if (!data.curriculum.phases || data.curriculum.phases.length === 0) return;

                const numPhases = data.curriculum.phases.length;

                const openStart = 0.08;
                const openEnd = 0.20;
                const closeStart = 0.85;
                const closeEnd = 0.95;

                const maxPaperHeight = 640;

                let paperHeight = 0;
                if (progress <= openStart) {
                    paperHeight = 0;
                } else if (progress <= openEnd) {
                    const openProgress = (progress - openStart) / (openEnd - openStart);
                    const eased = 1 - Math.pow(1 - openProgress, 3);
                    paperHeight = eased * maxPaperHeight;
                } else if (progress <= closeStart) {
                    paperHeight = maxPaperHeight;
                } else if (progress <= closeEnd) {
                    const closeProgress = (progress - closeStart) / (closeEnd - closeStart);
                    const eased = 1 - Math.pow(closeProgress, 3);
                    paperHeight = eased * maxPaperHeight;
                } else {
                    paperHeight = 0;
                }

                // Batching writes
                if (scrollScreen.style.height !== paperHeight + 'px') {
                    scrollScreen.style.height = paperHeight + 'px';
                }

                if (scrollWaxSeal) {
                    const sealVisible = progress > openEnd && progress < closeStart;
                    if (sealVisible !== scrollWaxSeal.classList.contains('visible')) {
                        scrollWaxSeal.classList.toggle('visible', sealVisible);
                    }
                }

                if (paperHeight > 100) {
                    const contentProgress = (progress - openEnd) / (closeStart - openEnd);
                    const clampedContent = Math.max(0, Math.min(1, contentProgress));
                    let phase = Math.min(Math.ceil(clampedContent * numPhases) || 1, numPhases);

                    if (phase !== currentPhase) {
                        currentPhase = phase;

                        const slides = scrollScreen.querySelectorAll('.screen-slide');
                        slides.forEach(s => s.classList.remove('active'));
                        const targetSlide = scrollScreen.querySelector(`.screen-slide[data-slide="${phase}"]`);
                        if (targetSlide) {
                            targetSlide.classList.add('active');
                        }

                        const dots = document.querySelectorAll('.phase-dot');
                        dots.forEach(dot => {
                            const dPhase = parseInt(dot.getAttribute('data-dot'));
                            dot.classList.remove('active', 'completed');
                            if (dPhase === phase) {
                                dot.classList.add('active');
                            } else if (dPhase < phase) {
                                dot.classList.add('completed');
                            }
                        });

                        if (scrollGlow) {
                            scrollGlow.style.background = (phase % 2 === 0) ? 'rgba(255,106,42,0.15)' : 'rgba(255,255,255,0.15)';
                        }
                    }
                }
            }

            function updateScrollAnimations() {
                let currRect = null;
                if (curriculumSection) currRect = curriculumSection.getBoundingClientRect();

                let currProgressToApply = null;
                if (currRect && currRect.top < window.innerHeight && currRect.bottom > 0) {
                    const scrollable = currRect.height - window.innerHeight;
                    let progress = -currRect.top / scrollable;
                    currProgressToApply = Math.max(0, Math.min(1, progress));
                }

                if (currRect && currProgressToApply !== null && scrollScreen) {
                    applyCurriculumDOMWrites(currRect, currProgressToApply);
                }

                ticking = false;
            }

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateScrollAnimations);
                    ticking = true;
                }
            }, { passive: true });

            // Initial call
            updateScrollAnimations();

            // --- GSAP INJECTIONS ---
            gsap.registerPlugin(ScrollTrigger);

            gsap.to("#stats-section", {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                scrollTrigger: {
                    trigger: "#stats-section",
                    start: "top top",
                    end: "+=200",
                    scrub: true,
                }
            });

        });
