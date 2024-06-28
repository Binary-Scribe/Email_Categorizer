document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('addEmailForm');
    const lessonForm = document.getElementById('addLessonForm');
    const emailInput = document.getElementById('email');
    const lessonInput = document.getElementById('lesson');
    const emailsList = document.getElementById('emailsList');
    const lessonsList = document.getElementById('lessonsList');
    const categorizedList = document.getElementById('categorizedList');

    function fetchEmails() {
        fetch('/api/emails')
            .then(response => response.json())
            .then(data => {
                emailsList.innerHTML = '';
                data.data.forEach(email => {
                    const li = document.createElement('li');
                    li.innerHTML = `${email.email}
                        <button onclick="editEmail(${email.id}, '${email.email}')">Edit</button>
                        <button onclick="deleteEmail(${email.id})">Delete</button>`;
                    emailsList.appendChild(li);
                });
            });
    }

    function fetchLessons() {
        fetch('/api/lessons')
            .then(response => response.json())
            .then(data => {
                lessonsList.innerHTML = '';
                data.data.forEach(lesson => {
                    const li = document.createElement('li');
                    li.innerHTML = `${lesson.lesson}
                        <button onclick="editLesson(${lesson.id}, '${lesson.lesson}')">Edit</button>
                        <button onclick="deleteLesson(${lesson.id})">Delete</button>`;
                    lessonsList.appendChild(li);
                });
            });
    }

    function fetchCategorizedEmails() {
        fetch('/api/categorized-emails')
            .then(response => response.json())
            .then(data => {
                categorizedList.innerHTML = '';
                data.data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `Email: ${item.email}, Lesson: ${item.lesson}`;
                    categorizedList.appendChild(li);
                });
            });
    }

    emailForm.addEventListener('submit', event => {
        event.preventDefault();
        fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput.value })
        })
        .then(response => response.json())
        .then(() => {
            fetchEmails();
            emailInput.value = '';
        });
    });

    lessonForm.addEventListener('submit', event => {
        event.preventDefault();
        fetch('/api/lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lesson: lessonInput.value })
        })
        .then(response => response.json())
        .then(() => {
            fetchLessons();
            lessonInput.value = '';
        });
    });

    window.editEmail = (id, oldEmail) => {
        const newEmail = prompt('Enter new email:', oldEmail);
        if (newEmail) {
            fetch(`/api/email/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            })
            .then(response => response.json())
            .then(() => fetchEmails());
        }
    };

    window.editLesson = (id, oldLesson) => {
        const newLesson = prompt('Enter new lesson:', oldLesson);
        if (newLesson) {
            fetch(`/api/lesson/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lesson: newLesson })
            })
            .then(response => response.json())
            .then(() => fetchLessons());
        }
    };

    window.deleteEmail = (id) => {
        if (confirm('Are you sure you want to delete this email?')) {
            fetch(`/api/email/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(() => fetchEmails());
        }
    };

    window.deleteLesson = (id) => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            fetch(`/api/lesson/${id}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(() => fetchLessons());
        }
    };

    fetchEmails();
    fetchLessons();
    fetchCategorizedEmails();
});
