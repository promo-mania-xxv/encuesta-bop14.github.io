document.addEventListener('DOMContentLoaded', function() {
    // ========== DOM ELEMENTS ========== //
    const introContainer = document.querySelector('.intro-container');
    const startBtn = document.querySelector('.start-btn');
    const surveyContainer = document.querySelector('.survey-container');
    const form = document.getElementById('youthSurvey');
    const sections = document.querySelectorAll('.survey-section');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const progressSteps = document.querySelectorAll('.step');
    const progressFill = document.querySelector('.progress-fill');
    const completionMessage = document.querySelector('.completion-message');
    const restartBtn = document.querySelector('.restart-btn');
    const statusMessage = document.createElement('div');
    statusMessage.className = 'status-message';
    document.body.appendChild(statusMessage);

    // ========== EMAILJS CONFIG (REPLACE WITH YOUR DATA) ========== //
    emailjs.init('MkMlbMhjFSatawf2i'); // Ej: 'user_123abc456def'
    const SERVICE_ID = 'service_469h3bi';     // Ej: 'service_xyz789'
    const TEMPLATE_ID = 'template_k8pql7p';   // Ej: 'template_abc123'

    // ========== GLOBAL VARIABLES ========== //
    let currentSection = 0;
    const totalSections = sections.length;

    // ========== FUNCTIONS ========== //

    // Show status messages (success/error)
    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.background = isError ? '#ff6b6b' : '#4cc9f0';
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.opacity = '0';
            setTimeout(() => {
                statusMessage.style.display = 'none';
                statusMessage.style.opacity = '1';
            }, 300);
        }, 4000);
    }

    // Show current section
    function showSection(index) {
        sections.forEach((section, i) => {
            section.classList.toggle('active', i === index);
        });
        
        prevBtn.disabled = index === 0;
        nextBtn.style.display = index === totalSections - 1 ? 'none' : 'block';
        submitBtn.style.display = index === totalSections - 1 ? 'block' : 'none';
    }

    // Update progress bar and steps
    function updateProgress() {
        const progressPercent = (currentSection / (totalSections - 1)) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        progressSteps.forEach((step, i) => {
            step.classList.toggle('active', i <= currentSection);
        });
    }

    // Validate current section fields
    function validateSection() {
        const currentSectionEl = sections[currentSection];
        const requiredInputs = currentSectionEl.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const groupName = input.name;
                if (!currentSectionEl.querySelector(`[name="${groupName}"]:checked`)) {
                    isValid = false;
                }
            } else if (!input.value.trim()) {
                input.focus();
                isValid = false;
            }
        });

        // Validate "other" fields if radio is selected
        const otherRadios = currentSectionEl.querySelectorAll('[value="otros"]:checked');
        otherRadios.forEach(radio => {
            const otherInput = radio.closest('label').querySelector('.other-input');
            if (otherInput && !otherInput.value.trim()) {
                otherInput.focus();
                isValid = false;
            }
        });

        if (!isValid) {
            showStatus('⚠️ Completa todos los campos requeridos', true);
        }
        return isValid;
    }

    // Setup dynamic "other" fields
    function setupOtherFields() {
        document.querySelectorAll('[value="otros"]').forEach(radio => {
            const otherInput = radio.closest('label').querySelector('.other-input');
            
            if (otherInput) { // Verifica que otherInput exista
                radio.addEventListener('change', () => {
                    otherInput.style.display = radio.checked ? 'block' : 'none';
                    if (radio.checked) otherInput.focus();
                });

                // Hide if another radio in group is selected
                document.querySelectorAll(`[name="${radio.name}"]:not([value="otros"])`).forEach(otherRadio => {
                    otherRadio.addEventListener('change', () => {
                        otherInput.style.display = 'none';
                    });
                });
            }
        });
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateSection()) return;

        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Corregido para usar las constantes definidas en lugar de string literals
            await emailjs.send(SERVICE_ID, TEMPLATE_ID, data);
            
            form.style.display = 'none';
            completionMessage.style.display = 'block';
            showStatus('✅ Encuesta enviada correctamente');
        } catch (error) {
            console.error('Error al enviar:', error);
            showStatus('❌ Error al enviar. Intenta nuevamente.', true);
        } finally {
            submitBtn.textContent = "Enviar";
            submitBtn.disabled = false;
        }
    }

    // ========== EVENT LISTENERS ========== //
    if (startBtn) { // Verifica que existan los elementos antes de agregar listeners
        startBtn.addEventListener('click', () => {
            introContainer.style.display = 'none';
            surveyContainer.style.display = 'block';
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateSection()) {
                currentSection = Math.min(currentSection + 1, totalSections - 1);
                showSection(currentSection);
                updateProgress();
                window.scrollTo(0, 0);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSection = Math.max(currentSection - 1, 0);
            showSection(currentSection);
            updateProgress();
            window.scrollTo(0, 0);
        });
    }

    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            form.reset();
            form.style.display = 'block';
            completionMessage.style.display = 'none';
            currentSection = 0;
            showSection(currentSection);
            updateProgress();
            document.querySelectorAll('.other-input').forEach(input => {
                input.style.display = 'none';
            });
            window.scrollTo(0, 0);
        });
    }

    // ========== INITIAL SETUP ========== //
    // Solo ejecutar estas funciones si existen los elementos necesarios
    if (sections.length > 0) {
        showSection(currentSection);
        updateProgress();
        setupOtherFields();
    }

    // Add CSS for status message (dynamic)
    const statusStyle = document.createElement('style');
    statusStyle.textContent = `
        .status-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: none;
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(statusStyle);
});