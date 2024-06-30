// UNIVERSAL PORT

const app = express();
const port = process.env.PORT || 3000;


// RAYANN START ---------------------------------------------------------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./user'); // Assuming this module handles User operations
const Professional = require('./professional'); // Assuming this module handles Professional operations

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve signup pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup_user.html'));
});

app.get('/signup_professional', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup_professional.html'));
});

// Handle POST request from user signup form
app.post('/api/users', async (req, res) => {
    try {
        const newUser = await User.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Handle POST request from professional signup form
app.post('/signup', async (req, res) => {
    try {
        const newProfessional = await Professional.createProfessional(req.body);
        res.status(201).json(newProfessional);
    } catch (error) {
        console.error('Error creating professional:', error);
        res.status(500).json({ error: 'Error creating professional' });
    }
});

// Handle POST request for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.getUserByEmail(email);
        const professional = await Professional.getProfessionalByEmail(email);

        const isPasswordValid = user?.verifyPassword(password) || professional?.verifyPassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Password is verified, proceed with login
        res.status(200).json({ message: 'Login successful', user: user || professional });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
// RAYANN END ---------------------------------------------------------------------------------------------------

// QI AN START ---------------------------------------------------------------------------------------------------
const express = require("express");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");


app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'CommPage.html'));
});

app.get('/api/comments', async (req, res) => {
    const section = req.query.section;
    try {
        const result = await sql.query`SELECT * FROM comments WHERE section = ${section}`;
        res.json({ comments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/comments', async (req, res) => {
    const { username, content, section } = req.body;
    try {
        await sql.query`INSERT INTO comments (username, content, section) VALUES (${username}, ${content}, ${section})`;
        res.json({ message: "Comment added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/comments/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        await sql.query`UPDATE comments SET content = ${content} WHERE id = ${id}`;
        res.json({ message: "Comment updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/comments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`DELETE FROM comments WHERE id = ${id}`;
        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/comments/search', async (req, res) => {
    const username = req.query.username;
    try {
        const result = await sql.query`SELECT * FROM comments WHERE username = ${username}`;
        res.json({ comments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, async () => {
    try {
        await sql.connect(dbConfig);
        console.log("Database connection established successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }

    console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});

// QI AN END ---------------------------------------------------------------------------------------------------

// DEXTER START ---------------------------------------------------------------------------------------------------
// DEXTER END ---------------------------------------------------------------------------------------------------

// JING YUAN START ---------------------------------------------------------------------------------------------------
// JING YUAN END ---------------------------------------------------------------------------------------------------