// UNIVERSAL PORT


const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const path = require('path');
const mssql = require('mssql');
const nodemailer = require('nodemailer');
const cors = require('cors');
const config = require('./dbConfig');
// RAYANN START ---------------------------------------------------------------------------------------------------

const User = require('./user'); // Assuming this module handles User operations
const Professional = require('./professional'); // Assuming this module handles Professional operations


// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to handle CORS
app.use(cors());

// Serve static files from the 'public' directory
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
app.post('/api/professionals', async (req, res) => {
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

        let loggedInUser;
        let userType;

        if (user && user.verifyPassword(password)) {
            loggedInUser = user;
            userType = 'user';
        } else if (professional && professional.verifyPassword(password)) {
            loggedInUser = professional;
            userType = 'professional';
        }

        if (!loggedInUser) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ 
            message: 'Login successful', 
            user: { ...loggedInUser, type: userType } 
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Handle POST request for forgot password
app.post('/api/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.getUserByEmail(email);
        const professional = await Professional.getProfessionalByEmail(email);

        if (!user && !professional) {
            return res.status(404).json({ message: 'Email not registered' });
        }

        const temporaryPassword = Math.floor(100000 + Math.random() * 900000).toString();

        const passwordUpdated = await User.updatePasswordByEmail(email, temporaryPassword);

        if (!passwordUpdated) {
            return res.status(500).json({ error: 'Failed to update password' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'awarmrefuge@gmail.com',
                pass: 'kvic dpoj qtnq epkd',
            }
        });

        const mailOptions = {
            from: 'awarmrefuge@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please use this temporary password ${temporaryPassword} to login and reset your password at the profile.`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log('Error:', error);
                res.status(500).json({ error: 'Error sending email' });
            } else {
                console.log('Email sent:', info.response);
                res.status(200).json({ message: 'Password reset email sent' });
            }
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Error verifying email' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// QI AN END ---------------------------------------------------------------------------------------------------

// DEXTER START ---------------------------------------------------------------------------------------------------
// DEXTER END ---------------------------------------------------------------------------------------------------

// JING YUAN START ---------------------------------------------------------------------------------------------------
// JING YUAN END ---------------------------------------------------------------------------------------------------