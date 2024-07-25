// UNIVERSAL PORT START (DONT CHANGE)

const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3000;

// UNIVERSAL PORT END (DONT CHANGE)

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

//update profile
app.post('/api/update_profile', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debugging: Log the request body
        const { id, name, email, phoneNumber, birthday, occupation, highestEducation } = req.body;

        const updatedUser = {
            name,
            email,
            phoneNumber,
            birthday,
            occupation,
            highestEducation,
            isProfessional: 0 // Ensure isProfessional is always 0
        };

        const user = await User.updateUser(id, updatedUser);
        res.json({ user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle POST request to update user profile
app.post('/api/update_profile', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debugging: Log the request body
        const { id, name, email, phoneNumber, birthday, occupation, highestEducation } = req.body;

        const updatedUser = {
            name,
            email,
            phoneNumber,
            birthday,
            occupation,
            highestEducation,
            isProfessional: 0 // Ensure isProfessional is always 0
        };

        const user = await User.updateUser(id, updatedUser);
        res.json({ user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle POST request to update professional profile
app.post('/api/update_profile', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debugging
        const { id, name, email, phoneNumber, birthday, occupation, highestEducation, isProfessional } = req.body;

        const updatedUser = {
            name,
            email,
            phoneNumber,
            birthday,
            occupation,
            highestEducation,
            isProfessional
        };

        if (isProfessional) {
            const professional = await Professional.updateProfessional(id, updatedUser);
            res.json({ professional });
        } else {
            const user = await User.updateUser(id, updatedUser);
            res.json({ user });
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/update_professional', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { id, name, email, phoneNumber, birthday, occupation, highestEducation } = req.body;

        const updatedProfessional = {
            name,
            email,
            phoneNumber,
            birthday,
            occupation,
            highestEducation,
            isProfessional: 1 // Ensure isProfessional is always 1
        };

        const professional = await Professional.updateProfessional(id, updatedProfessional);
        res.json({ professional });
    } catch (error) {
        console.error('Error updating professional:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// QI AN START ---------------------------------------------------------------------------------------------------

app.get('/api/comments', async (req, res) => {
    const section = req.query.section;
    const replyTo = req.query.replyTo;
    try {
        const query = replyTo ?
            `SELECT * FROM comments WHERE replyTo = @replyTo` :
            `SELECT * FROM comments WHERE section = @section AND replyTo IS NULL`;
        const request = new sql.Request();
        if (replyTo) {
            request.input('replyTo', sql.Int, replyTo);
        } else {
            request.input('section', sql.NVarChar, section);
        }
        const result = await request.query(query);
        res.json({ comments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/comments', async (req, res) => {
    const { username, content, section, replyTo } = req.body;
    try {
        await sql.query`INSERT INTO comments (username, content, section, replyTo) VALUES (${username}, ${content}, ${section}, ${replyTo})`;
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
        const result = await sql.query`SELECT * FROM comments WHERE username LIKE ${'%' + username + '%'}`;
        res.json({ comments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// QI AN END ---------------------------------------------------------------------------------------------------

// DEXTER START ---------------------------------------------------------------------------------------------------


const Mood = require("./mood");

// Endpoint to get all moods
app.get('/api/moods', async (req, res) => {
    try {
        const moods = await Mood.getAllMoods();
        res.json(moods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to get moods by user ID
app.get('/api/users/:userId/moods', async (req, res) => {
    try {
        const moods = await Mood.getMoodsByUserId(req.params.userId);
        res.json(moods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to get a single mood by id
app.get('/api/moods/:id', async (req, res) => {
    try {
        const mood = await Mood.getMoodById(req.params.id);
        if (mood) {
            res.json(mood);
        } else {
            res.status(404).json({ message: "Mood not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to create a new mood
app.post('/api/moods', async (req, res) => {
    try {
        const { userId, date, description, moodIndex } = req.body; // Include userId
        const newMood = { userId, date, description, moodIndex };
        const newMoodId = await Mood.createMood(newMood);
        res.status(201).json({ id: newMoodId, userId, date, description, moodIndex });
    } catch (error) {
        console.error('Error creating new mood:', error);
        res.status(500).json({ message: 'Failed to create new mood' });
    }
});

// Endpoint to update an existing mood
app.put('/api/moods/:id', async (req, res) => {
    const { userId, date, description, moodIndex } = req.body; // Include userId
    const id = req.params.id;
    try {
        const updatedMood = await Mood.updateMood(id, { userId, date, description, moodIndex });
        if (!updatedMood) {
            return res.status(404).send({ message: 'Mood not found' });
        }
        return res.status(200).json(updatedMood);
    } catch (error) {
        console.error('Failed to update mood:', error);
        res.status(500).send({ message: 'Failed to update mood' });
    }
});



// Endpoint to delete a mood
app.delete('/api/moods/:id', async (req, res) => {
    try {
        const success = await Mood.deleteMood(req.params.id);
        if (success) {
            res.json({ message: "Mood deleted successfully" });
        } else {
            res.status(404).json({ message: "Mood not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DEXTER END ---------------------------------------------------------------------------------------------------

// JING YUAN START ---------------------------------------------------------------------------------------------------
// JING YUAN END ---------------------------------------------------------------------------------------------------


// Start the server - DONT CHANGE PLS 
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