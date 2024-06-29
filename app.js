const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./user'); // Assuming this module handles User operations
const Professional = require('./professional'); // Assuming this module handles Professional operations

const app = express();
const port = process.env.PORT || 3000;

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
