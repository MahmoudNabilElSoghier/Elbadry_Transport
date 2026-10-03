/* ============================================================================
   شركة البدري لنقل — El Badry Transport Company
   script.js — All interactions (Vanilla JS, no frameworks)

   FEATURES
   1.  AOS (Animate On Scroll) init
   2.  Mobile drawer menu (open / close / overlay / Esc / focus)
   3.  Sticky header scroll state
   4.  Active nav link highlighting
   5.  Smooth scroll for anchor links (with header offset)
   6.  Back-to-top button
   7.  Animated stat counters
   8.  Gallery lightbox (prev / next / keyboard)
   9.  Quote form validation + submission (Formspree / Web3Forms ready)
    10. "Coming soon" social link guard
    11. Year auto-update + 12. Offline map fallback
    ========================================================================== */

(function () {
    'use strict';

    /* i18n helper (js/lang.js loads first; fallback = return key) */
    var t = (typeof window.t === 'function') ? window.t : function (k) { return k; };

    /* Debounced scroll handler helper ------------------------------------ */
    var ticking = false;
    function onScroll(fn) {
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () { fn(); ticking = false; });
                ticking = true;
            }
        }, { passive: true });
    }

    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    /* ========================================================================
       1. AOS — Animate On Scroll
       ===================================================================== */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 750,
            easing: 'ease-out-cubic',
            once: true,          /* animate only once */
            offset: 90,
            disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        });
    } else {
        /* Fallback: if the AOS CDN fails, never leave content hidden */
        $$('[data-aos]').forEach(function (el) { el.removeAttribute('data-aos'); });
    }

    /* ========================================================================
       2. MOBILE DRAWER MENU
       ===================================================================== */
    var menuToggle = $('#menu-toggle');
    var navbar     = $('#navbar');
    var overlay    = $('#nav-overlay');
    var header     = $('#header');

    function openMenu() {
        if (!navbar) return;
        navbar.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'إغلاق القائمة');
        document.body.classList.add('nav-open');
        if (overlay) { overlay.hidden = false; requestAnimationFrame(function () { overlay.classList.add('show'); }); }
    }

    function closeMenu() {
        if (!navbar) return;
        navbar.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'فتح القائمة');
        document.body.classList.remove('nav-open');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(function () { overlay.hidden = true; }, 300);
        }
    }

    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', function () {
            navbar.classList.contains('active') ? closeMenu() : openMenu();
        });

        /* Close when a nav link is chosen */
        $$('#navbar a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        /* Close on overlay click */
        if (overlay) overlay.addEventListener('click', closeMenu);

        /* Close on Escape (keyboard accessibility) */
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navbar.classList.contains('active')) {
                closeMenu();
                menuToggle.focus();
            }
        });

        /* Close the drawer if the viewport grows to desktop width */
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 992 && navbar.classList.contains('active')) closeMenu();
        });
    }

    /* ========================================================================
       3. STICKY HEADER — solid / blurred state on scroll
       ===================================================================== */
    function updateHeader() {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 60);
    }
    onScroll(updateHeader);
    updateHeader();

    /* ========================================================================
       4. ACTIVE NAV LINK HIGHLIGHTING
       ===================================================================== */
    var navLinks = $$('#navbar a[href^="#"]');
    var sections = navLinks
        .map(function (a) { return document.querySelector(a.getAttribute('href')); })
        .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (a) {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(function (s) { sectionObserver.observe(s); });
    }

    /* ========================================================================
       5. SMOOTH SCROLL FOR ANCHOR LINKS (respects fixed header)
       ===================================================================== */
    $$('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (!href || href === '#') { e.preventDefault(); return; }  /* placeholder social links */

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            var headerOffset = (header ? header.offsetHeight : 0) + 8;
            var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: Math.max(top, 0),
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });

            /* Keep keyboard focus on the destination for screen readers */
            target.setAttribute('tabindex', '-1');
            setTimeout(function () { target.focus({ preventScroll: true }); }, 600);
        });
    });

    /* ========================================================================
       6. BACK-TO-TOP BUTTON
       ===================================================================== */
    var backToTop = $('#backToTop');
    if (backToTop) {
        onScroll(function () {
            backToTop.classList.toggle('show', window.scrollY > 450);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ========================================================================
       7. ANIMATED STAT COUNTERS (count-up when the section is visible)
       ===================================================================== */
    var counters = $$('.counter');

    function formatNumber(n) { return n.toLocaleString('en-US'); }

    function runCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var duration = 1800;                 /* ms */
        var start = null;

        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            /* easeOutCubic for a natural deceleration */
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + formatNumber(Math.floor(eased * target));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = prefix + formatNumber(target);
            }
        }
        requestAnimationFrame(step);
    }

    var statsSection = $('.stats');
    if (statsSection && counters.length) {
        if ('IntersectionObserver' in window) {
            var statsObserver = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        counters.forEach(runCounter);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.35 });
            statsObserver.observe(statsSection);
        } else {
            counters.forEach(runCounter);   /* fallback */
        }
    }

    /* ========================================================================
       8. GALLERY LIGHTBOX
       ===================================================================== */
    var lightbox      = $('#lightbox');
    var lightboxImg   = $('#lightbox-img');
    var lightboxCap   = $('#lightbox-caption');
    var galleryItems  = $$('.gallery-item');
    var currentIndex  = 0;
    var lastFocused   = null;

    function showImage(i) {
        if (!galleryItems.length) return;
        currentIndex = (i + galleryItems.length) % galleryItems.length;
        var item  = galleryItems[currentIndex];
        var img   = item.querySelector('img');
        var cap   = item.querySelector('figcaption');
        lightboxImg.src = img.getAttribute('src');
        lightboxImg.alt = img.getAttribute('alt') || '';
        lightboxCap.textContent = cap ? cap.textContent : '';
    }

    function openLightbox(i) {
        if (!lightbox) return;
        lastFocused = document.activeElement;
        showImage(i);
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () { lightbox.classList.add('show'); });
        var closeBtn = $('.lightbox-close', lightbox);
        if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(function () {
            lightbox.hidden = true;
            lightboxImg.src = '';
        }, 250);
        if (lastFocused) lastFocused.focus();
    }

    function refreshGalleryAria() {
        galleryItems.forEach(function (item) {
            var cap = item.querySelector('figcaption');
            item.setAttribute('aria-label', t('js_gallery_zoom') + ((cap && cap.textContent) || ''));
        });
    }
    galleryItems.forEach(function (item, i) {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.addEventListener('click', function () { openLightbox(i); });
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
        });
    });
    refreshGalleryAria();
    document.addEventListener('langchange', refreshGalleryAria);

    if (lightbox) {
        $('.lightbox-close', lightbox).addEventListener('click', closeLightbox);
        $('.lightbox-prev', lightbox).addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex - 1); });
        $('.lightbox-next', lightbox).addEventListener('click', function (e) { e.stopPropagation(); showImage(currentIndex + 1); });

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (e) {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') closeLightbox();
            /* RTL: ArrowLeft = next, ArrowRight = previous */
            if (e.key === 'ArrowLeft')  showImage(currentIndex + 1);
            if (e.key === 'ArrowRight') showImage(currentIndex - 1);
        });
    }

    /* ========================================================================
       9. QUOTE FORM — validation + submission
       ===================================================================== */
    var form        = $('#contactForm');
    var formMessage = $('#formMessage');

    /* Egyptian mobile numbers: 010 / 011 / 012 / 015 + 8 digits */
    var PHONE_REGEX = /^01[0125]\d{8}$/;

    function normalizePhone(value) {
        var v = (value || '').replace(/[\s\-\(\)\.]/g, '');
        if (v.indexOf('+20') === 0) v = '0' + v.slice(3);
        else if (v.indexOf('0020') === 0) v = '0' + v.slice(4);
        else if (v.indexOf('20') === 0 && v.length === 12) v = '0' + v.slice(2);
        return v;
    }

    function setError(field, message) {
        var errorEl = document.getElementById(field.id + '-error');
        field.classList.toggle('invalid', !!message);
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (errorEl) errorEl.textContent = message || '';
        return !message;
    }

    function validateField(field) {
        var value = (field.value || '').trim();

        switch (field.id) {
            case 'name':
                if (!value) return setError(field, t('js_val_name_required'));
                if (value.length < 3) return setError(field, t('js_val_name_short'));
                if (!/^[\u0600-\u06FFa-zA-Z\s'’\-\.]{3,}$/.test(value)) {
                    return setError(field, t('js_val_name_letters'));
                }
                return setError(field, '');

            case 'phone': {
                var phone = normalizePhone(value);
                if (!phone) return setError(field, t('js_val_phone_required'));
                if (!PHONE_REGEX.test(phone)) {
                    return setError(field, t('js_val_phone_invalid'));
                }
                field.value = phone;
                return setError(field, '');
            }

            case 'service':
                if (!value) return setError(field, t('js_val_service_required'));
                return setError(field, '');

            default:
                return true;
        }
    }

    if (form) {
        /* Live re-validation once a field has already errored */
        ['name', 'phone', 'service'].forEach(function (id) {
            var field = document.getElementById(id);
            if (!field) return;
            var eventName = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventName, function () {
                if (field.classList.contains('invalid') || (field.value || '').trim()) validateField(field);
            });
            field.addEventListener('blur', function () {
                if ((field.value || '').trim() || field.classList.contains('invalid')) validateField(field);
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name    = document.getElementById('name');
            var phone   = document.getElementById('phone');
            var service = document.getElementById('service');

            /* Validate in order; focus the first invalid field */
            var results = [validateField(name), validateField(phone), validateField(service)];
            if (results.indexOf(false) !== -1) {
                var firstInvalid = form.querySelector('.invalid');
                if (firstInvalid) firstInvalid.focus();
                formMessage.textContent = t('js_form_fix_errors');
                formMessage.className = 'form-message error';
                return;
            }

            var submitBtn = form.querySelector('button[type="submit"]');
            var label     = $('.btn-label', submitBtn);
            var spinner   = $('.btn-spinner', submitBtn);

            /* --- Loading state --- */
            submitBtn.disabled = true;
            if (label) label.textContent = t('js_form_sending');
            if (spinner) spinner.hidden = false;

            var action = form.getAttribute('action') || '';
            var isPlaceholder = action.indexOf('YOUR_FORM_ID') !== -1 || action.indexOf('YOUR_ACCESS_TOKEN') !== -1;

            function success(msg) {
                formMessage.textContent = msg;
                formMessage.className = 'form-message success';
                form.reset();
                ['name', 'phone', 'service'].forEach(function (id) {
                    var f = document.getElementById(id);
                    if (f) setError(f, '');
                });
            }

            function fail(msg) {
                formMessage.textContent = msg;
                formMessage.className = 'form-message error';
            }

            function resetBtn() {
                submitBtn.disabled = false;
                if (label) label.textContent = t('js_form_send');
                if (spinner) spinner.hidden = true;
            }

            /* --- NO-BACKEND MODE: no endpoint configured yet ----------------
               A fake "success" here would lose real customer leads, so the
               validated quote is handed to WhatsApp instead (same number as
               the site's wa.me links). Paste a Formspree / Web3Forms URL into
               the form's `action` and the real POST below takes over.     */
            if (isPlaceholder) {
                var waNumber = '201097304445';
                var svcOpt = service.options[service.selectedIndex];
                var svcKey = svcOpt ? svcOpt.getAttribute('data-i18n') : null;
                var svcName = svcKey ? t(svcKey) : service.value;
                var lines = [
                    t('js_wa_title'),
                    '———————————',
                    t('js_wa_name') + name.value.trim(),
                    t('js_wa_phone') + phone.value.trim(),
                    t('js_wa_city') + (document.getElementById('city').value.trim() || '—'),
                    t('js_wa_service') + svcName,
                    t('js_wa_details') + (document.getElementById('details').value.trim() || '—')
                ];
                window.open(
                    'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(lines.join('\n')),
                    '_blank', 'noopener'
                );
                formMessage.textContent = t('js_wa_ready');
                formMessage.className = 'form-message success';
                resetBtn();
                return;
            }

            /* --- REAL SUBMISSION (Formspree / Web3Forms compatible) ------- */
            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            })
                .then(function (res) {
                    if (res.ok) {
                        success(t('js_form_sent'));
                        form.reset();
                    } else {
                        fail(t('js_form_fail'));
                    }
                })
                .catch(function () {
                    fail(t('js_form_offline'));
                })
                .finally(resetBtn);
        });
    }

    /* ========================================================================
       10. "COMING SOON" SOCIAL LINKS
           Social pages are not created yet → href="#" + data-todo="create-page".
           Prevents a jump to the top and shows a friendly Arabic tooltip.
       ===================================================================== */
    $$('a[data-todo="create-page"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var raw = link.getAttribute('aria-label') || t('js_social_soon_b');
            var clean = raw.replace(/ \(قريباً\)| \(soon\)/i, '').replace(/^(صفحة|page)\s+/i, '');
            showToast(t('js_social_soon') + clean + t('js_social_todo'));
        });
    });

    /* Lightweight toast (no dependencies) */
    function showToast(message) {
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'status');
        toast.textContent = message;
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%) translateY(16px)',
            background: '#0B1F3A',
            color: '#fff',
            padding: '.75rem 1.25rem',
            borderRadius: '999px',
            fontSize: '.88rem',
            fontWeight: '700',
            boxShadow: '0 14px 34px rgba(0,0,0,.35)',
            zIndex: '3000',
            opacity: '0',
            transition: 'opacity .3s ease, transform .3s ease',
            pointerEvents: 'none',
            border: '1px solid rgba(245,166,35,.5)'
        });
        document.body.appendChild(toast);
        requestAnimationFrame(function () {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(16px)';
            setTimeout(function () { toast.remove(); }, 350);
        }, 2600);
    }

    /* ========================================================================
       11. YEAR — keeps the copyright line current automatically
       ===================================================================== */
    var yearEl = document.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ========================================================================
       12. OFFLINE MAP FALLBACK — static branded map when Google can't load
       ===================================================================== */
    var mapWrap = $('.map-wrap');
    var mapFrame = mapWrap ? mapWrap.querySelector('iframe') : null;
    var mapFallback = mapWrap ? mapWrap.querySelector('.map-fallback') : null;
    var mapLiveSrc = mapFrame ? mapFrame.getAttribute('src') : null;

    function setMapMode(online) {
        if (!mapWrap || !mapFrame || !mapFallback) return;
        if (online) {
            /* Restore the live map (in case a previous check hid it) */
            if (!mapFrame.getAttribute('src') && mapLiveSrc) mapFrame.setAttribute('src', mapLiveSrc);
            mapFrame.hidden = false;
            mapFallback.hidden = true;
        } else {
            /* Stop the doomed request, show the branded fallback + live link */
            mapFrame.removeAttribute('src');
            mapFrame.hidden = true;
            mapFallback.hidden = false;
        }
    }

    function checkMapConnectivity() {
        if (!navigator.onLine) { setMapMode(false); return; }
        /* navigator.onLine lies behind captive portals — probe Google fast */
        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
        fetch('https://maps.google.com/favicon.ico', {
            mode: 'no-cors',
            cache: 'no-store',
            signal: ctrl ? ctrl.signal : undefined
        }).then(function () {
            clearTimeout(timer);
            setMapMode(true);
        }).catch(function () {
            clearTimeout(timer);
            setMapMode(false);
        });
    }

    if (mapWrap) {
        checkMapConnectivity();
        window.addEventListener('online', checkMapConnectivity);
        window.addEventListener('offline', function () { setMapMode(false); });
    }

})();
