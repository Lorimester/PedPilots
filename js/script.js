/**
 * PedPilots - Main Application Logic
 * Supports modular lesson loading and dynamic persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    let currentLessonId = null;
    let ui = {}; // Container for dynamic UI elements

    // --- Static UI Elements ---
    const dashboardView = document.getElementById('dashboard-view');
    const lessonView = document.getElementById('lesson-view');
    const lessonContent = document.getElementById('lesson-content');
    const lessonNav = document.getElementById('lesson-nav');
    const progressBar = document.getElementById('progress-bar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    // --- Data ---
    const varkQuestions = [
        { q: "Amikor valami újat tanul, jobban szeret...", a: "bemutatót nézni", b: "utasításokat vagy kézikönyvet olvasni", c: "meghallgatni egy magyarázatot", d: "kipróbálni saját maga" },
        { q: "Ha meg kell értenie, hogyan működik valami, akkor...", a: "megnéz egy videót vagy ábrákat", b: "olvas róla", c: "megkér valakit, hogy magyarázza el", d: "kipróbálja, kísérletezik vele" },
        { q: "Jobban emlékszik dolgokra, ha...", a: "képeket vagy ábrákat lát", b: "szöveget olvas vagy jegyzetel", c: "beszél róla vagy hall magyarázatokat", d: "gyakorlatban használja, csinál valamit vele" },
        { q: "Amikor útbaigazítást ad, általában...", a: "térképet rajzol vagy vizuálisan mutatja", b: "leírja az útbaigazítást", c: "szóban elmagyarázza", d: "odakíséri az illetőt" },
        { q: "Amikor tanul, jobban szeret...", a: "látni olyat, hogy valaki csinál valamit", b: "olvasni vagy jegyzetelni", c: "hallani egy magyarázatot", d: "maga csinálni valamit" },
        { q: "Ha új információt kap, akkor legkönnyebben...", a: "képeket vagy diagramokat használva érti meg", b: "szöveges anyagokat olvasva érti meg", c: "beszélgetve vagy hallgatva érti meg", d: "gyakorlati tapasztalattal érti meg" },
        { q: "Amikor tanul, legjobban...", a: "látja, hogyan működik valami", b: "olvas róla részletesen", c: "beszélget róla másokkal", d: "kipróbálja saját maga" },
        { q: "Ha egy új készséget kell megtanulnia, akkor...", a: "nézi, hogyan csinálják mások", b: "olvas róla lépésről lépésre", c: "megkéri, hogy magyarázzák el", d: "gyakorol és kísérletezik" },
        { q: "Ha egy előadáson van, jobban figyel, ha...", a: "lát ábrákat, képeket, videót", b: "kézhez kap jegyzeteket vagy anyagot", c: "hallja a részletes magyarázatot", d: "aktívan részt vesz a gyakorlatokban" },
        { q: "Tanulás közben inkább...", a: "megfigyel másokat, hogyan csinálnak valamit", b: "jegyzetel és olvas", c: "kérdez és beszélget a témáról", d: "gyakorolja az új tudást" },
        { q: "Amikor új információt tanul, azt legjobban...", a: "látva érti meg", b: "olvasva érti meg", c: "hallva érti meg", d: "csinálva érti meg" },
        { q: "Ha egy új anyagot kell elsajátítania, jobban megy, ha...", a: "vizuálisan látja az anyagot", b: "elolvassa a szöveget vagy jegyzetel", c: "valaki elmagyarázza szóban", d: "kipróbálja saját maga" },
        { q: "Amikor egy új témáról tanul, legjobban...", a: "képek, ábrák vagy videók segítik", b: "szöveg vagy leírás segíti", c: "beszélgetések, magyarázatok segítik", d: "a gyakorlati tapasztalat segíti" },
        { q: "Ha meg akarja tanulni, hogyan kell valamit csinálni, akkor...", a: "megnézi, hogyan csinálják mások", b: "elolvassa az útmutatót", c: "megkéri, hogy magyarázzák el", d: "kipróbálja saját maga" },
        { q: "Amikor új fogalmakat tanul, legjobban...", a: "látva érti meg", b: "olvasva érti meg", c: "hallva érti meg", d: "csinálva érti meg" },
        { q: "Tanulás közben legszívesebben...", a: "megnézi, hogyan csinálják", b: "elolvassa a tananyagot", c: "hallgatja, hogy elmagyarázzák", d: "kipróbálja saját maga" }
    ];

    // --- View Management ---

    /**
     * Loads a lesson dynamically using fetch.
     * @param {number} id - The lesson ID to load.
     */
    window.loadLesson = async function (id) {
        if (id !== 1 && id !== 2) {
            alert("Ez a modul még fejlesztés alatt áll.");
            return;
        }

        currentLessonId = id;
        lessonContent.innerHTML = '<div class="loading-spinner">Munkamenet betöltése...</div>';

        dashboardView.classList.add('hidden');
        lessonView.classList.remove('hidden');
        window.scrollTo(0, 0);

        try {
            const response = await fetch(`lessons/lesson${id}.html`);
            if (!response.ok) throw new Error(`Hiba a lecke betöltésekor: ${response.status}`);

            const html = await response.text();

            // Parse and Inject
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const navContent = doc.querySelector('.lesson-nav-content');
            const bodyContent = doc.querySelector('.lesson-body-content');

            if (navContent) lessonNav.innerHTML = navContent.innerHTML;
            if (bodyContent) lessonContent.innerHTML = bodyContent.innerHTML;

            // Re-initialize all dynamic UI elements
            initLessonUI();

        } catch (error) {
            console.error(error);
            lessonContent.innerHTML = `<div class="error-box">Nem sikerült betölteni a tananyagot. Kérjük, próbálja újra később!<br><small>${error.message}</small></div>`;
        }
    };

    window.showDashboard = function () {
        dashboardView.classList.remove('hidden');
        lessonView.classList.add('hidden');
        window.scrollTo(0, 0);
        currentLessonId = null;
    };

    /**
     * Initializes UI elements and event listeners after a lesson is loaded.
     */
    function initLessonUI() {
        // Collect new dynamic elements
        ui = {
            sections: document.querySelectorAll('.scroll-section'),
            navLinks: document.querySelectorAll('.nav-link'),
            motivationSlider: document.getElementById('motivation-scale'),
            rangeValue: document.getElementById('range-value'),
            reflectionInputs: document.querySelectorAll('.reflection-input'),
            varkQuizContainer: document.getElementById('quiz-questions'),
            submitVarkBtn: document.getElementById('submit-vark'),
            varkResults: document.getElementById('vark-results'),
            downloadBtn: document.getElementById('download-summary'),
            debateSelect: document.getElementById('debate-statement')
        };

        // Initialize components
        if (ui.varkQuizContainer) {
            ui.varkQuizContainer.innerHTML = '';
            initQuiz();
        }

        attachLessonEventListeners();
        loadProgress();
    }

    function attachLessonEventListeners() {
        // Navigation: Auto-close sidebar on mobile
        ui.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    mobileMenuToggle.classList.remove('active');
                }
            });
        });

        // Generic Option Selection (Interactive elements)
        document.addEventListener('click', (e) => {
            const option = e.target.closest('.vark-option');
            if (option) {
                // If it's a quiz question (radio-like behavior)
                const container = option.parentElement;
                if (container.id === 'quiz-questions' || container.id === 'feedback-analysis-quiz') {
                    // For VARK, we keep selection. For feedback analysis, let's allow multiple or single?
                    // The doc says "Válassza ki az igaz kijelentéseket" (plural), so multiple.
                    option.classList.toggle('selected');
                } else if (container.classList.contains('vark-options')) {
                    option.classList.toggle('selected');
                }

                // Auto-save quiz state
                const selected = Array.from(container.querySelectorAll('.vark-option.selected')).map(opt => opt.dataset.val);
                saveData(`${currentLessonId}_quiz_${container.id}`, selected.join(','));
            }
        });

        // VARK Submit (Specific for Lesson 1)
        if (ui.submitVarkBtn) {
            ui.submitVarkBtn.addEventListener('click', () => {
                const selected = document.querySelectorAll('#quiz-questions .vark-option.selected');
                if (selected.length < varkQuestions.length) {
                    alert('Kérjük, minden kérdésre válaszoljon!');
                    return;
                }

                let scores = { a: 0, b: 0, c: 0, d: 0 };
                selected.forEach(opt => {
                    scores[opt.dataset.val]++;
                });

                showVarkResults(scores);
            });
        }

        // Multi-Slider Support
        const sliders = document.querySelectorAll('.slider, #motivation-scale');
        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                const valDisplay = slider.nextElementSibling;
                if (valDisplay && valDisplay.tagName === 'SPAN') {
                    valDisplay.textContent = slider.value;
                }
                saveData(slider.id, slider.value);
            });
        });

        ui.reflectionInputs.forEach(input => {
            input.addEventListener('input', () => {
                saveData(input.id, input.value);
                updateSummary();
            });
        });

        if (ui.debateSelect) {
            ui.debateSelect.addEventListener('change', () => {
                saveData(ui.debateSelect.id, ui.debateSelect.value);
            });
        }

        // Download Summary
        if (ui.downloadBtn) {
            ui.downloadBtn.addEventListener('click', () => {
                const text = updateSummary();
                const filename = `pedpilots_l${currentLessonId}_osszegzes.txt`;
                const encodedText = encodeURIComponent(text);
                const dataUri = 'data:text/plain;charset=utf-8,\ufeff' + encodedText;

                const a = document.createElement('a');
                a.setAttribute('href', dataUri);
                a.setAttribute('download', filename);
                a.style.display = 'none';
                document.body.appendChild(a);

                try {
                    a.click();
                } catch (e) {
                    console.error("Download failed", e);
                    alert("A letöltés nem indult el automatikusan. Kérjük, használja a fenti szövegdobozt a másoláshoz!");
                }
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 100);
            });
        }
    }

    // --- Static Event Listeners ---
    window.addEventListener('scroll', () => {
        if (!currentLessonId || lessonView.classList.contains('hidden')) return;

        // Progress bar
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (window.scrollY / scrollTotal) * 100;
        progressBar.style.width = scrollProgress + '%';

        // Scroll spy
        let current = "";
        if (ui.sections) {
            ui.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });
        }

        if (ui.navLinks) {
            ui.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        }
    });

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            sidebar.classList.toggle('open');
        });
    }

    // --- VARK Quiz Logic ---
    function initQuiz() {
        varkQuestions.forEach((item, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'vark-question';
            qDiv.innerHTML = `
                <p><strong>${index + 1}. ${item.q}</strong></p>
                <div class="vark-options">
                    <div class="vark-option" data-val="a" data-q="${index}"><span>A)</span> ${item.a}</div>
                    <div class="vark-option" data-val="b" data-q="${index}"><span>B)</span> ${item.b}</div>
                    <div class="vark-option" data-val="c" data-q="${index}"><span>C)</span> ${item.c}</div>
                    <div class="vark-option" data-val="d" data-q="${index}"><span>D)</span> ${item.d}</div>
                </div>
            `;
            ui.varkQuizContainer.appendChild(qDiv);
        });

        // Option selection
        ui.varkQuizContainer.addEventListener('click', (e) => {
            const option = e.target.closest('.vark-option');
            if (!option) return;

            const siblings = option.parentElement.querySelectorAll('.vark-option');
            siblings.forEach(s => s.classList.remove('selected'));
            option.classList.add('selected');
        });
    }

    function showVarkResults(scores, shouldScroll = true) {
        if (!ui.varkResults) return;
        ui.varkResults.classList.remove('hidden');
        const desc = document.getElementById('vark-description');

        let maxScore = Math.max(scores.a, scores.b, scores.c, scores.d);
        let types = [];
        if (scores.a === maxScore) types.push("Vizuális (V)");
        if (scores.b === maxScore) types.push("Olvasás/Írás (R)");
        if (scores.c === maxScore) types.push("Auditív (A)");
        if (scores.d === maxScore) types.push("Kinetikus (K)");

        desc.innerHTML = `
            <p><strong>Eredmények:</strong></p>
            <ul>
                <li>Vizuális: ${scores.a}</li>
                <li>Olvasás/Írás: ${scores.b}</li>
                <li>Auditív: ${scores.c}</li>
                <li>Kinetikus: ${scores.d}</li>
            </ul>
            <p>Az Ön domináns típusa: <strong>${types.join(", ")}</strong></p>
            <p class="small">Ha több típus is azonos pontszámot kapott, Ön többcsatornás tanuló!</p>
        `;

        if (shouldScroll) {
            ui.varkResults.scrollIntoView({ behavior: 'smooth' });
        }
        saveData('vark-scores', scores);
    }

    // --- Persistence ---
    function saveData(key, value) {
        if (!currentLessonId) return;
        const prefix = `pedpilots_l${currentLessonId}_`;
        localStorage.setItem(prefix + key, JSON.stringify(value));
    }

    function loadProgress() {
        if (!currentLessonId) return;
        const prefix = `pedpilots_l${currentLessonId}_`;

        // Load all reflection inputs
        ui.reflectionInputs.forEach(input => {
            const val = localStorage.getItem(prefix + input.id);
            if (val) {
                try {
                    input.value = JSON.parse(val);
                } catch (e) {
                    input.value = val;
                }
            } else {
                input.value = '';
            }
        });

        // Load all sliders
        const sliders = document.querySelectorAll('.slider, #motivation-scale');
        sliders.forEach(slider => {
            const val = localStorage.getItem(prefix + slider.id);
            if (val) {
                try {
                    slider.value = JSON.parse(val);
                    const valDisplay = slider.nextElementSibling;
                    if (valDisplay && valDisplay.tagName === 'SPAN') {
                        valDisplay.textContent = slider.value;
                    }
                } catch (e) {
                    slider.value = val;
                }
            }
        });

        // Load Quiz States
        const quizContainers = document.querySelectorAll('.vark-options, #quiz-questions, #feedback-analysis-quiz');
        quizContainers.forEach(container => {
            const val = localStorage.getItem(prefix + `${currentLessonId}_quiz_${container.id}`);
            if (val) {
                try {
                    const selectedVals = JSON.parse(val).split(',');
                    selectedVals.forEach(v => {
                        const opt = container.querySelector(`.vark-option[data-val="${v}"]`);
                        if (opt) opt.classList.add('selected');
                    });
                } catch (e) {
                    console.error("Error loading quiz state", e);
                }
            }
        });

        if (ui.debateSelect) {
            const debate = localStorage.getItem(prefix + 'debate-statement');
            if (debate) {
                try {
                    ui.debateSelect.value = JSON.parse(debate);
                } catch (e) {
                    ui.debateSelect.value = debate;
                }
            }
        }

        const varkSaved = localStorage.getItem(prefix + 'vark-scores');
        if (varkSaved && ui.varkResults) {
            try {
                showVarkResults(JSON.parse(varkSaved), false);
            } catch (e) {
                console.error("Error loading VARK results", e);
            }
        } else if (ui.varkResults) {
            ui.varkResults.classList.add('hidden');
        }

        updateSummary();
    }

    // --- Summary & Download ---
    // --- Summary & Download ---
    function updateSummary() {
        const summaryDisplay = document.getElementById('summary-display');
        if (!summaryDisplay) return "";

        const prefix = `pedpilots_l${currentLessonId}_`;
        let summaryText = `PEDPILOTS - ${currentLessonId}. TANULÁSI MODUL ÖSSZEGZÉS\n`;
        summaryText += "=========================================================\n\n";

        // Collect all reflection inputs and sliders from the current page
        const inputs = document.querySelectorAll('.reflection-input, .slider, #motivation-scale');

        inputs.forEach(input => {
            const label = getLabelForId(input.id);
            const value = localStorage.getItem(prefix + input.id);
            if (value) {
                let parsed;
                try {
                    parsed = JSON.parse(value);
                } catch (e) {
                    parsed = value;
                }
                summaryText += `${label}: ${parsed}\n`;
            }
        });

        // Also add quiz results if any (generic)
        const quizContainers = document.querySelectorAll('.vark-options, #quiz-questions, #feedback-analysis-quiz');
        quizContainers.forEach(container => {
            const val = localStorage.getItem(prefix + `${currentLessonId}_quiz_${container.id}`);
            if (val) {
                try {
                    const selected = JSON.parse(val);
                    summaryText += `Interaktív feladat (${container.id}): ${selected}\n`;
                } catch (e) { }
            }
        });

        summaryText += "\n";

        // Legacy Vark Result for L1
        if (currentLessonId === 1) {
            const varkSaved = localStorage.getItem(prefix + 'vark-scores');
            if (varkSaved) {
                const parsed = JSON.parse(varkSaved);
                summaryText += `VARK Eredmény: V:${parsed.a}, R:${parsed.b}, A:${parsed.c}, K:${parsed.d}\n`;
            }
        }

        summaryDisplay.innerHTML = `
            <div class="summary-box">
                <p>Az Ön válaszai rögzítésre kerültek. Ha az automatikus letöltés nem sikerülne, innen is kimásolhatja az adatokat:</p>
                <textarea id="manual-summary-copy" readonly class="reflection-input" style="height: 200px; font-family: monospace; font-size: 0.9rem; background: #fdfdfd; border: 1px solid var(--secondary-color);">${summaryText}</textarea>
            </div>
        `;

        return summaryText;
    }

    function getLabelForId(id) {
        const labels = {
            'reflection-1': 'Három kulcsszó',
            'reflection-1b': 'Választás indoklása',
            'reflection-1c': 'Mit árulnak el?',
            'motivation': 'Motivációs szint (1-10)',
            'reflection-2': 'Támogató tényezők',
            'reflection-3': 'Akadályozó tényezők',
            'debate-statement': 'Vita-állítás',
            'debate-for': 'Támogató érv',
            'debate-against': 'Ellenző érv',
            'mirror-1': 'Sikerélmény leírása',
            'mirror-2': 'Nehézség leírása',
            'vark-scores': 'VARK Teszt Pontszámok',
            'situation-1': 'Helyzet 1 (Matek feladás)',
            'situation-2': 'Helyzet 2 (Kolléga ellenállása)',
            'situation-3': 'Helyzet 3 (Nincs tehetségem)',
            'situation-4': 'Helyzet 4 (Szülői vélemény)',
            'situation-5': 'Helyzet 5 (Félelem a hibától)',
            'action-1': 'Fejlődési cél',
            'action-2': 'Hiba-menedzsment',
            'action-3': 'Mondat a diákoknak',
            'action-4': 'Konkrét változtatás',
            'final-1': 'Záró reflexió a tanulásról',
            'final-2': 'Még nem tudom, de...',
            'affirmation': 'Megerősítő mondat'
        };
        return labels[id] || id;
    }

    window.resetPedPilotsData = function () {
        if (!currentLessonId) return;
        const prefix = `pedpilots_l${currentLessonId}_`;
        if (confirm('Biztosan törölni szeretne minden elmentett választ ebből a modulból? Ez a művelet nem vonható vissza.')) {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            }
            alert('Adatok törölve ebből a modulból.');
            loadProgress();
        }
    };
});
