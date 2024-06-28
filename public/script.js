document.addEventListener('DOMContentLoaded', () => {
    const emailSelect = document.getElementById('email-select');
    const lessonSelect = document.getElementById('lesson-select');
    const categorizedEmailsContainer = document.getElementById('categorized-emails');
    const newEmailInput = document.getElementById('new-email');
    const newLessonInput = document.getElementById('new-lesson');
    const catSectionEmail = document.getElementById('cat-section-email');
    const catSectionLesson = document.getElementById('cat-section-lesson');
    const addSection = document.getElementById('add-section');
    const showSectionTitle = document.getElementById('show-section-title');
    const addEmailLessonButton = document.getElementById('add-email-lesson');
    const editSection = document.getElementById('edit-section');

    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const closeModal = document.getElementsByClassName('close')[0];
    const saveEditButton = document.getElementById('save-edit');

    let emailOptions = JSON.parse(localStorage.getItem('emailOptions')) || [];
    let lessonOptions = JSON.parse(localStorage.getItem('lessonOptions')) || [];
    let emailLessons = JSON.parse(localStorage.getItem('emailLessons')) || [];

    let currentEditType = '';
    let currentEditValue = '';

    const saveData = () => {
        localStorage.setItem('emailOptions', JSON.stringify(emailOptions));
        localStorage.setItem('lessonOptions', JSON.stringify(lessonOptions));
        localStorage.setItem('emailLessons', JSON.stringify(emailLessons));
    };

    const populateSelectOptions = (selectElement, options) => {
        selectElement.innerHTML = '<option value="" disabled selected>Select an option</option>';
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            selectElement.appendChild(opt);
        });
    };

    const displayCategorizedEmails = () => {
        categorizedEmailsContainer.innerHTML = '';

        const categorized = {};

        emailLessons.forEach(([email, lesson]) => {
            if (!categorized[lesson]) {
                categorized[lesson] = [];
            }
            categorized[lesson].push(email);
        });

        for (const [lesson, emails] of Object.entries(categorized)) {
            const div = document.createElement('div');
            div.classList.add('categorized-item');
            div.innerHTML = `
                <h3>${lesson}</h3>
                <p>${emails.join(', ')}</p>
                <div>
                    <button class="done-btn" data-lesson="${lesson}">Done</button>
                    <i class="fas fa-copy copy-icon" data-emails="${emails.join(', ')}" title="Copy emails"></i>
                </div>
            `;
            categorizedEmailsContainer.appendChild(div);
        }

        const doneButtons = document.querySelectorAll('.done-btn');
        doneButtons.forEach(button => {
            button.addEventListener('click', () => {
                const lessonToRemove = button.dataset.lesson;
                emailLessons = emailLessons.filter(([email, lesson]) => lesson !== lessonToRemove);
                displayCategorizedEmails();
                saveData();
            });
        });

        const copyIcons = document.querySelectorAll('.copy-icon');
        copyIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                const emailsToCopy = icon.getAttribute('data-emails');
                const tempInput = document.createElement('textarea');
                tempInput.value = emailsToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                alert('Emails copied to clipboard');
            });
        });
    };

    const displayEditSection = () => {
        editSection.innerHTML = '';

        // Display Email Options
        const emailList = document.createElement('div');
        emailList.innerHTML = '<h2>Edit Emails</h2>';
        emailOptions.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.classList.add('edit-item');
            emailItem.innerHTML = `
                <span>${email}</span>
                <button class="edit-email-btn" data-email="${email}">Edit</button>
                <button class="delete-email-btn" data-email="${email}">Delete</button>
            `;
            emailList.appendChild(emailItem);
        });
        editSection.appendChild(emailList);

        // Display Lesson Options
        const lessonList = document.createElement('div');
        lessonList.innerHTML = '<h2>Edit Lessons</h2>';
        lessonOptions.forEach(lesson => {
            const lessonItem = document.createElement('div');
            lessonItem.classList.add('edit-item');
            lessonItem.innerHTML = `
                <span>${lesson}</span>
                <button class="edit-lesson-btn" data-lesson="${lesson}">Edit</button>
                <button class="delete-lesson-btn" data-lesson="${lesson}">Delete</button>
            `;
            lessonList.appendChild(lessonItem);
        });
        editSection.appendChild(lessonList);

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-email-btn').forEach(button => {
            button.addEventListener('click', () => {
                currentEditType = 'email';
                currentEditValue = button.dataset.email;
                editInput.value = currentEditValue;
                editModal.style.display = 'block';
            });
        });

        document.querySelectorAll('.delete-email-btn').forEach(button => {
            button.addEventListener('click', () => {
                const emailToDelete = button.dataset.email;
                if (confirm(`Are you sure you want to delete ${emailToDelete}?`)) {
                    emailOptions = emailOptions.filter(email => email !== emailToDelete);
                    emailLessons = emailLessons.filter(([email, lesson]) => email !== emailToDelete);
                    saveData();
                    displayEditSection();
                }
            });
        });

        document.querySelectorAll('.edit-lesson-btn').forEach(button => {
            button.addEventListener('click', () => {
                currentEditType = 'lesson';
                currentEditValue = button.dataset.lesson;
                editInput.value = currentEditValue;
                editModal.style.display = 'block';
            });
        });

        document.querySelectorAll('.delete-lesson-btn').forEach(button => {
            button.addEventListener('click', () => {
                const lessonToDelete = button.dataset.lesson;
                if (confirm(`Are you sure you want to delete ${lessonToDelete}?`)) {
                    lessonOptions = lessonOptions.filter(lesson => lesson !== lessonToDelete);
                    emailLessons = emailLessons.filter(([email, lesson]) => lesson !== lessonToDelete);
                    saveData();
                    displayEditSection();
                }
            });
        });
    };

    saveEditButton.addEventListener('click', () => {
        const newValue = editInput.value.trim();
        if (newValue) {
            if (currentEditType === 'email') {
                const index = emailOptions.indexOf(currentEditValue);
                if (index !== -1) {
                    emailOptions[index] = newValue;
                    emailLessons.forEach(pair => {
                        if (pair[0] === currentEditValue) {
                            pair[0] = newValue;
                        }
                    });
                }
            } else if (currentEditType === 'lesson') {
                const index = lessonOptions.indexOf(currentEditValue);
                if (index !== -1) {
                    lessonOptions[index] = newValue;
                    emailLessons.forEach(pair => {
                        if (pair[1] === currentEditValue) {
                            pair[1] = newValue;
                        }
                    });
                }
            }
            saveData();
            editModal.style.display = 'none';
            displayEditSection();
            populateSelectOptions(emailSelect, emailOptions);
            populateSelectOptions(lessonSelect, lessonOptions);
        } else {
            alert('Please enter a valid value');
        }
    });

    closeModal.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    window.addEventListener('click', event => {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    });

    document.getElementById('add-email-lesson').addEventListener('click', () => {
        const email = emailSelect.value;
        const lesson = lessonSelect.value;

        if (email && lesson) {
            emailLessons.push([email, lesson]);
            displayCategorizedEmails();
            saveData();
            emailSelect.value = '';
            lessonSelect.value = '';
        } else {
            alert('Please select both email and lesson');
        }
    });

    document.getElementById('add-new-email').addEventListener('click', () => {
        const newEmail = newEmailInput.value.trim();
        if (newEmail && !emailOptions.includes(newEmail)) {
            emailOptions.push(newEmail);
            populateSelectOptions(emailSelect, emailOptions);
            newEmailInput.value = '';
            saveData();
        } else {
            alert('Please enter a valid email that is not already in the list');
        }
    });

    document.getElementById('add-new-lesson').addEventListener('click', () => {
        const newLesson = newLessonInput.value.trim();
        if (newLesson && !lessonOptions.includes(newLesson)) {
            lessonOptions.push(newLesson);
            populateSelectOptions(lessonSelect, lessonOptions);
            newLessonInput.value = '';
            saveData();
        } else {
            alert('Please enter a valid lesson that is not already in the list');
        }
    });

    document.getElementById('cat-btn').addEventListener('click', () => {
        catSectionEmail.style.display = 'block';
        catSectionLesson.style.display = 'block';
        addSection.style.display = 'none';
        showSectionTitle.style.display = 'none';
        categorizedEmailsContainer.style.display = 'none';
        addEmailLessonButton.style.display = 'block';
        editSection.style.display = 'none';
    });

    document.getElementById('add-btn').addEventListener('click', () => {
        catSectionEmail.style.display = 'none';
        catSectionLesson.style.display = 'none';
        addSection.style.display = 'block';
        showSectionTitle.style.display = 'none';
        categorizedEmailsContainer.style.display = 'none';
        addEmailLessonButton.style.display = 'none';
        editSection.style.display = 'none';
    });

    document.getElementById('show-btn').addEventListener('click', () => {
        catSectionEmail.style.display = 'none';
        catSectionLesson.style.display = 'none';
        addSection.style.display = 'none';
        showSectionTitle.style.display = 'block';
        categorizedEmailsContainer.style.display = 'block';
        addEmailLessonButton.style.display = 'none';
        editSection.style.display = 'none';
        displayCategorizedEmails();
    });

    document.getElementById('edit-btn').addEventListener('click', () => {
        catSectionEmail.style.display = 'none';
        catSectionLesson.style.display = 'none';
        addSection.style.display = 'none';
        showSectionTitle.style.display = 'none';
        categorizedEmailsContainer.style.display = 'none';
        addEmailLessonButton.style.display = 'none';
        editSection.style.display = 'block';
        displayEditSection();
    });

    populateSelectOptions(emailSelect, emailOptions);
    populateSelectOptions(lessonSelect, lessonOptions);
    displayCategorizedEmails();
});