// --- Global State ---
window.currentLessonId = null;

// --- Global Functions ---

window.downloadPedPilotsSummary = function () {
    if (!window.currentLessonId) {
        alert("Hiba: Nincs aktív tananyag kiválasztva.");
        return;
    }

    try {
        const text = updateSummary();
        const filename = `pedpilots_l${window.currentLessonId}_osszegzes.txt`;
        const encodedText = encodeURIComponent(text);
        const dataUri = 'data:text/plain;charset=utf-8,\ufeff' + encodedText;

        const a = document.createElement('a');
        a.setAttribute('href', dataUri);
        a.setAttribute('download', filename);
        a.style.display = 'none';
        document.body.appendChild(a);

        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    } catch (e) {
        console.error("Download failed", e);
        alert("A letöltés nem indult el automatikusan. Kérjük, használja a fenti szövegdobozt a másoláshoz!");
    }
};

window.resetPedPilotsData = function () {
    if (!window.currentLessonId) {
        console.error("No active lesson ID for reset.");
        return;
    }
    const prefix = `pedpilots_l${window.currentLessonId}_`;
    if (confirm('Biztosan törölni szeretne minden elmentett választ ebből a modulból? Ez a művelet nem vonható vissza.')) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        alert('Adatok törölve ebből a modulból. Az oldal újratöltődik.');
        loadLesson(window.currentLessonId);
    }
};

window.checkSolutions = function () {
    alert('Megoldások:\n1.R - Rögzült\n2.R - Rögzült\n3.F - Fejlődő\n4.F - Fejlődő\n5.R - Rögzült\n6.F - Fejlődő\n7.R - Rögzült\n8.F - Fejlődő\n9.R - Rögzült\n10.F - Fejlődő');
};

// --- Helper Functions used by globals ---
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
        'affirmation': 'Megerősítő mondat',
        // Module 2
        'reflection-l2-q1': 'Mikor tanul a legszívesebben?',
        'reflection-l2-internalization': 'Internalizáció (Amit régen nem kedvelt)',
        'autonomy-high': 'Magas autonómia példa',
        'autonomy-low': 'Alacsony autonómia példa',
        'autonomy-reflection-feelings': 'Autonómia érzések és hatás',
        'feedback-rewrite-full': 'Visszajelzés átírása',
        'flow-zone-selection': 'Flow-zóna ütemezés',
        'volition-plans': 'Akarati tervek (Ha... akkor...)',
        'scale-l2-autonomy': 'Szükséglet: Autonómia (1-5)',
        'scale-l2-competence': 'Szükséglet: Kompetencia (1-5)',
        'scale-l2-relatedness': 'Szükséglet: Kapcsolódás (1-5)',
        'reflection-l2-perseverance': 'Kitartás példa (Volíció)',
        'scaffold-step-1': 'Scaffolding 1. lépés',
        'scaffold-step-2': 'Scaffolding 2. lépés',
        'scaffold-step-3': 'Scaffolding 3. lépés',
        'scaffold-step-4': 'Scaffolding 4. lépés',
        'scaffold-step-5': 'Scaffolding 5. lépés',
        'match-results': 'Párosítás (Ellenőrzés 1)',
        'emotion-1': 'Érzelem (Magas kihívás, alacsony komp.)',
        'emotion-2': 'Érzelem (Alacsony kihívás, magas kép.)',
        'source-1': 'Forrás (Zsolti példája)',
        'source-2': 'Forrás (Múlt heti siker)'
    };
    return labels[id] || id;
}

function updateSummary() {
    const summaryDisplay = document.getElementById('summary-display');
    if (!summaryDisplay) return "";

    const prefix = `pedpilots_l${window.currentLessonId}_`;
    let summaryText = `PEDPILOTS - ${window.currentLessonId}. TANULÁSI MODUL ÖSSZEGZÉS\n`;
    summaryText += "=========================================================\n\n";

    const inputs = document.querySelectorAll('.reflection-input, .slider, #motivation-scale');

    inputs.forEach(input => {
        const label = getLabelForId(input.id);
        const value = localStorage.getItem(prefix + input.id);
        if (value && value !== '""') {
            let parsed;
            try {
                parsed = JSON.parse(value);
            } catch (e) {
                parsed = value;
            }
            if (parsed !== "" && parsed !== null) {
                summaryText += `${label}: ${parsed}\n\n`;
            }
        }
    });

    const quizContainers = document.querySelectorAll('.vark-options, #quiz-questions, #feedback-analysis-quiz, #l2-feedback-quiz');
    quizContainers.forEach(container => {
        const val = localStorage.getItem(prefix + `${window.currentLessonId}_quiz_${container.id}`);
        if (val) {
            try {
                const selected = JSON.parse(val);
                if (selected && selected.length > 0) {
                    summaryText += `Interaktív feladat (${container.id}): ${selected}\n\n`;
                }
            } catch (e) { }
        }
    });

    const tables = document.querySelectorAll('.interactive-table tbody');
    tables.forEach(tbody => {
        const val = localStorage.getItem(prefix + `${window.currentLessonId}_table_${tbody.id}`);
        if (val) {
            summaryText += `Táblázat választás (${tbody.id}): Kijelölt sorok indexei: ${val}\n\n`;
        }
    });

    const valRadios = localStorage.getItem(prefix + `${window.currentLessonId}_radios_behavior`);
    if (valRadios) {
        summaryText += `Viselkedés értékelés: ${valRadios}\n\n`;
    }

    summaryText += "\n";

    if (window.currentLessonId === 1) {
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

document.addEventListener('DOMContentLoaded', () => {
    const dashboardView = document.getElementById('dashboard-view');
    const lessonView = document.getElementById('lesson-view');
    const lessonContent = document.getElementById('lesson-content');
    const lessonNav = document.getElementById('lesson-nav');
    const progressBar = document.getElementById('progress-bar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');

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

    window.loadLesson = async function (id) {
        if (id !== 1 && id !== 2) {
            alert("Ez a modul még fejlesztés alatt áll.");
            return;
        }

        window.currentLessonId = id;

        lessonContent.innerHTML = '<div class="loading-spinner">Munkamenet betöltése...</div>';

        // Reset progress bar
        if (progressBar) progressBar.style.width = '0%';

        dashboardView.classList.add('hidden');
        lessonView.classList.remove('hidden');
        window.scrollTo(0, 0);

        try {
            const response = await fetch(`lessons/lesson${id}.html`);
            if (!response.ok) throw new Error(`Hiba a lecke betöltésekor: ${response.status}`);

            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const navContent = doc.querySelector('.lesson-nav-content');
            const bodyContent = doc.querySelector('.lesson-body-content');

            if (navContent) lessonNav.innerHTML = navContent.innerHTML;
            if (bodyContent) lessonContent.innerHTML = bodyContent.innerHTML;

            initLessonUI();

        } catch (error) {
            console.error(error);
            lessonContent.innerHTML = `<div class="error-box">Nem sikerült betölteni a tananyagot. Kérjük, próbálja újra később!<br><small>${error.message}</small></div>`;
        }
    };

    window.showDashboard = function () {
        dashboardView.classList.remove('hidden');
        lessonView.classList.add('hidden');

        // Reset mobile menu state
        if (sidebar) sidebar.classList.remove('open');
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');

        window.scrollTo(0, 0);
        window.currentLessonId = null;

        // Reset progress bar
        if (progressBar) progressBar.style.width = '0%';
    };

    function initLessonUI() {
        ui = {
            navLinks: document.querySelectorAll('.nav-link'),
            sections: [], // Will be populated below
            motivationSlider: document.getElementById('motivation-scale'),
            rangeValue: document.getElementById('range-value'),
            reflectionInputs: document.querySelectorAll('.reflection-input'),
            varkQuizContainer: document.getElementById('quiz-questions'),
            submitVarkBtn: document.getElementById('submit-vark'),
            varkResults: document.getElementById('vark-results'),
            downloadBtn: document.getElementById('download-summary'),
            debateSelect: document.getElementById('debate-statement')
        };

        // Populate sections based on current navigation links to ensure accurate scroll-spy
        const navIds = Array.from(ui.navLinks).map(link => {
            const href = link.getAttribute('href');
            return href && href.startsWith('#') ? href.substring(1) : null;
        }).filter(Boolean);
        ui.sections = Array.from(document.querySelectorAll('[id]')).filter(el => navIds.includes(el.id));


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

        // Behavior Table Radio Buttons (Relatedness)
        const radioInputs = document.querySelectorAll('.behavior-table input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.addEventListener('change', () => {
                // Save all radio states for this table
                const table = radio.closest('table');
                if (table) {
                    const radios = table.querySelectorAll('input[type="radio"]:checked');
                    const radioState = {};
                    radios.forEach(r => {
                        radioState[r.name] = r.value;
                    });
                    saveData(`${window.currentLessonId}_radios_behavior`, radioState);
                }
            });
        });

        // Select inputs (Final Quiz)
        const selects = document.querySelectorAll('select.reflection-input');
        selects.forEach(select => {
            select.addEventListener('change', () => {
                saveData(select.id, select.value);
                updateSummary();
            });
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
    }

    // --- Global Click Delegeted Listeners ---
    document.addEventListener('click', (e) => {
        // 1. Generic Option Selection (Interactive elements)
        const option = e.target.closest('.vark-option');
        if (option) {
            const container = option.parentElement;

            // Radio-like behavior for VARK questions
            if (container.id === 'quiz-questions' || container.id === 'vark-quiz-container' || container.classList.contains('vark-options') && container.closest('.vark-question')) {
                const siblings = container.querySelectorAll('.vark-option');
                siblings.forEach(s => s.classList.remove('selected'));
                option.classList.add('selected');
            } else {
                // Toggle behavior for other quizzes (e.g. feedback analysis)
                option.classList.toggle('selected');
            }

            // Auto-save quiz state
            const selected = Array.from(container.querySelectorAll('.vark-option.selected')).map(opt => opt.dataset.val);
            saveData(`${window.currentLessonId}_quiz_${container.id || 'vark'}`, selected.join(','));
        }

        // 2. Interactive Table Cell Selection (Autonomy)
        const tableCell = e.target.closest('.selectable-cell');
        if (tableCell) {
            const isAlreadySelected = tableCell.classList.contains('selected-cell');
            const row = tableCell.closest('tr');
            // Deselect other cells in the same row
            row.querySelectorAll('.selectable-cell').forEach(c => c.classList.remove('selected-cell'));

            // Toggle if it wasn't already selected
            if (!isAlreadySelected) {
                tableCell.classList.add('selected-cell');
            }

            const tbody = tableCell.closest('tbody');
            // Save state
            const selectedCells = [];
            const rows = Array.from(tbody.children);
            rows.forEach((row, rIndex) => {
                Array.from(row.children).forEach((cell, cIndex) => {
                    if (cell.classList.contains('selected-cell')) {
                        selectedCells.push(`${rIndex}_${cIndex}`);
                    }
                });
            });
            saveData(`${window.currentLessonId}_table_cells_${tbody.id}`, selectedCells.join(','));
        }

        // 3. Accordion Logic
        const header = e.target.closest('.accordion-header');
        if (header) {
            const item = header.parentElement;
            const allItems = item.parentElement.querySelectorAll('.accordion-item');

            // Optional: Close other items
            allItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove('active');
                    const c = i.querySelector('.accordion-content');
                    if (c) c.style.maxHeight = null;
                }
            });

            item.classList.toggle('active');
            const content = item.querySelector('.accordion-content');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        }
    });


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
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                if (window.scrollY >= (sectionTop - 160)) {
                    const id = section.getAttribute('id');
                    if (id) current = id;
                }
            });
        }

        // Force last section if at bottom
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
            if (ui.sections && ui.sections.length > 0) {
                current = ui.sections[ui.sections.length - 1].id;
            }
        }

        if (ui.navLinks && current) {
            ui.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                    // Auto-scroll sidebar to keep active link in view
                    if (window.innerWidth > 768) { // Only on desktop
                        link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
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
        if (!window.currentLessonId) return;
        const prefix = `pedpilots_l${window.currentLessonId}_`;
        localStorage.setItem(prefix + key, JSON.stringify(value));
    }

    function loadProgress() {
        if (!window.currentLessonId) return;
        const prefix = `pedpilots_l${window.currentLessonId}_`;

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

        const quizContainers = document.querySelectorAll('.vark-options, #quiz-questions, #feedback-analysis-quiz, #l2-feedback-quiz');
        quizContainers.forEach(container => {
            const val = localStorage.getItem(prefix + `${window.currentLessonId}_quiz_${container.id}`);
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

        // Load Interactive Tables (Autonomy - Cells)
        const tables = document.querySelectorAll('.interactive-table tbody');
        tables.forEach(tbody => {
            const key = `${window.currentLessonId}_table_cells_${tbody.id}`;
            const val = localStorage.getItem(prefix + key);
            if (val) {
                try {
                    const indices = val.split(',');
                    indices.forEach(idx => {
                        const [r, c] = idx.split('_').map(Number);
                        if (tbody.children[r] && tbody.children[r].children[c]) {
                            tbody.children[r].children[c].classList.add('selected-cell');
                        }
                    });
                } catch (e) {
                    console.error("Error loading table cell state", e);
                }
            }
        });

        // Load Radio Tables (Relatedness)
        const valRadios = localStorage.getItem(prefix + `${window.currentLessonId}_radios_behavior`);
        if (valRadios) {
            try {
                const radioState = JSON.parse(valRadios);
                for (const [name, value] of Object.entries(radioState)) {
                    const radio = document.querySelector(`.behavior-table input[name="${name}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                }
            } catch (e) {
                console.error("Error loading radio state", e);
            }
        }

        // Load Selects
        const selects = document.querySelectorAll('select.reflection-input');
        selects.forEach(select => {
            const val = localStorage.getItem(prefix + select.id);
            if (val) {
                try {
                    select.value = JSON.parse(val);
                } catch (e) {
                    select.value = val;
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




    // Module 2 Hint Logic - Generic function for toggling hints and adjusting accordion height
    window.showHint = function (hintId) {
        const hint = document.getElementById(hintId);
        if (hint) {
            hint.classList.toggle('show');

            // Recalculate accordion height if hint is inside one
            const accordionContent = hint.closest('.accordion-content');
            if (accordionContent && accordionContent.style.maxHeight) {
                // Using a small timeout to ensure the 'show' class transition/display is accounted for
                setTimeout(() => {
                    accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                }, 50);
            }
        }
    };

    // Legacy support for older calls (if any)
    window.showFeedbackHint = function () {
        showHint('feedback-hint');
    };

    // Global Reset Function
    // Global Download Function



});
