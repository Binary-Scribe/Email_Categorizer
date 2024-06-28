const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite3 database
const db = new sqlite3.Database('./db/emails.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the emails database.');
        db.run(`CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson TEXT UNIQUE
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS email_lessons (
            email_id INTEGER,
            lesson_id INTEGER,
            FOREIGN KEY(email_id) REFERENCES emails(id),
            FOREIGN KEY(lesson_id) REFERENCES lessons(id),
            PRIMARY KEY (email_id, lesson_id)
        )`);
    }
});

// API endpoints
app.get('/api/emails', (req, res) => {
    db.all('SELECT * FROM emails', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.get('/api/lessons', (req, res) => {
    db.all('SELECT * FROM lessons', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.post('/api/email', (req, res) => {
    const { email } = req.body;
    db.run(`INSERT INTO emails (email) VALUES (?)`, [email], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.post('/api/lesson', (req, res) => {
    const { lesson } = req.body;
    db.run(`INSERT INTO lessons (lesson) VALUES (?)`, [lesson], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.post('/api/email-lesson', (req, res) => {
    const { email, lesson } = req.body;
    db.get(`SELECT id FROM emails WHERE email = ?`, [email], (err, emailRow) => {
        if (err || !emailRow) {
            res.status(400).json({ error: err ? err.message : 'Email not found' });
            return;
        }
        db.get(`SELECT id FROM lessons WHERE lesson = ?`, [lesson], (err, lessonRow) => {
            if (err || !lessonRow) {
                res.status(400).json({ error: err ? err.message : 'Lesson not found' });
                return;
            }
            db.run(`INSERT INTO email_lessons (email_id, lesson_id) VALUES (?, ?)`, [emailRow.id, lessonRow.id], function (err) {
                if (err) {
                    res.status(400).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Email and lesson categorized' });
            });
        });
    });
});

app.get('/api/categorized-emails', (req, res) => {
    db.all(`SELECT emails.email, lessons.lesson FROM email_lessons
            JOIN emails ON email_lessons.email_id = emails.id
            JOIN lessons ON email_lessons.lesson_id = lessons.id`, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Edit email
app.put('/api/email/:id', (req, res) => {
    const { email } = req.body;
    const { id } = req.params;
    db.run(`UPDATE emails SET email = ? WHERE id = ?`, [email, id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ updatedID: id });
    });
});

// Edit lesson
app.put('/api/lesson/:id', (req, res) => {
    const { lesson } = req.body;
    const { id } = req.params;
    db.run(`UPDATE lessons SET lesson = ? WHERE id = ?`, [lesson, id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ updatedID: id });
    });
});

// Delete email
app.delete('/api/email/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM emails WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ deletedID: id });
    });
});

// Delete lesson
app.delete('/api/lesson/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM lessons WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ deletedID: id });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
