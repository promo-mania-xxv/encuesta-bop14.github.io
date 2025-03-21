document.addEventListener('DOMContentLoaded', function() {
    const totalSections = 7;
    let currentSection = 1;

    // Inicializar la encuesta
    initSurvey();

    function initSurvey() {
        showSection(1);
        updateProgressBar();

        // Eventos para botones de siguiente y anterior
        document.querySelectorAll('.next-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = parseInt(this.getAttribute('data-section'));
                if (validateSection(section)) {
                    showSection(section + 1);
                }
            });
        });

        document.querySelectorAll('.prev-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = parseInt(this.getAttribute('data-section'));
                showSection(section - 1);
            });
        });

        // Evento para enviar el formulario
        document.getElementById('surveyForm').addEventListener('submit', function(event) {
            event.preventDefault();
            if (validateSection(currentSection)) {
                submitForm();
            }
        });

        // Evento para reiniciar la encuesta
        document.getElementById('restart-btn').addEventListener('click', resetSurvey);

        // Mostrar/ocultar campos "Otros"
        document.querySelectorAll('input[type="radio"], input[type="checkbox"], select').forEach(input => {
            input.addEventListener('change', function() {
                if (this.value === "otros") {
                    const otrosInput = document.getElementById(`otros-${this.name}`);
                    if (otrosInput) otrosInput.style.display = 'block';
                } else {
                    const otrosInput = document.getElementById(`otros-${this.name}`);
                    if (otrosInput) otrosInput.style.display = 'none';
                }
            });
        });
    }

    // Función para enviar el formulario
    function submitForm() {
        const formData = getFormData();

        // Enviar datos con EmailJS
        emailjs.send('service_469h3bi', 'Aahz--aNr8yIuRDxkR_Db', formData) // Reemplaza con tus IDs
            .then(function(response) {
                console.log('Correo enviado con éxito:', response);
                document.getElementById('surveyForm').style.display = 'none';
                document.getElementById('result').style.display = 'block';
            }, function(error) {
                console.error('Error al enviar el correo:', error);
                alert('Hubo un error al enviar la encuesta. Por favor, inténtalo de nuevo.');
            });
    }

    // Función para obtener los datos del formulario
    function getFormData() {
        const form = document.getElementById('surveyForm');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                const baseKey = key.slice(0, -2);
                if (!data[baseKey]) {
                    data[baseKey] = [];
                }
                data[baseKey].push(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    // Función para mostrar una sección específica
    function showSection(sectionNumber) {
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        const sectionToShow = document.getElementById(`section-${sectionNumber}`);
        sectionToShow.style.display = 'block';

        setTimeout(() => {
            sectionToShow.classList.add('active');
        }, 10);

        currentSection = sectionNumber;
        updateProgressBar();
    }

    // Función para validar una sección
    function validateSection(section) {
        const sectionElement = document.getElementById(`section-${section}`);

        // Validar campos required
        const requiredFields = sectionElement.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                alert('Por favor, completa todos los campos requeridos.');
                field.focus();
                return false;
            }
        }

        // Validar radio buttons
        const radioGroups = getUniqueRadioGroups(sectionElement);
        for (let groupName of radioGroups) {
            const checked = sectionElement.querySelector(`input[name="${groupName}"]:checked`);
            if (!checked) {
                alert('Por favor, selecciona una opción.');
                return false;
            }
        }

        // Validar checkboxes en la sección 3
        if (section === 3) {
            const checkboxes = sectionElement.querySelectorAll('input[type="checkbox"]:checked');
            if (checkboxes.length === 0) {
                alert('Por favor, selecciona al menos una preocupación.');
                return false;
            }
        }

        return true;
    }

    // Obtener grupos únicos de radio buttons
    function getUniqueRadioGroups(container) {
        const radioButtons = container.querySelectorAll('input[type="radio"]');
        const groups = new Set();

        radioButtons.forEach(radio => {
            if (radio.name) {
                groups.add(radio.name);
            }
        });

        return groups;
    }

    // Función para actualizar la barra de progreso
    function updateProgressBar() {
        const progressPercent = ((currentSection - 1) / totalSections) * 100;
        document.getElementById('progress-indicator').style.width = `${progressPercent}%`;
    }

    // Función para reiniciar la encuesta
    function resetSurvey() {
        document.getElementById('surveyForm').reset();
        document.getElementById('surveyForm').style.display = 'block';
        document.getElementById('result').style.display = 'none';
        showSection(1);
    }
});