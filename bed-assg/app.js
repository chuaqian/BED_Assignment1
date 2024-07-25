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
const multer = require("multer");
// multer setup for handling file uploads
const upload = multer({ dest: 'public/uploads/' });
// UNIVERSAL PORT END (DONT CHANGE)

// RAYANN START ---------------------------------------------------------------------------------------------------

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

// Handle POST request to update user profile
app.post('/api/update_user', async (req, res) => {
    try {
        const { id, name, email, phoneNumber, birthday } = req.body;
        const updatedUser = await User.updateUser(id, {
            name,
            email,
            phoneNumber,
            birthday
        });
        res.json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle POST request to update professional profile
app.post('/api/update_professional', async (req, res) => {
    try {
        const { id, name, email, phoneNumber, birthday, occupation, highestEducation } = req.body;
        const updatedProfessional = await Professional.updateProfessional(id, {
            name,
            email,
            phoneNumber,
            birthday,
            occupation,
            highestEducation
        });
        res.json({ professional: updatedProfessional });
    } catch (error) {
        console.error('Error updating professional profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// QI AN START ---------------------------------------------------------------------------------------------------

// COMMUNITY START--------------
// serve the community page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'CommPage.html'));
});

// get comments from the database
app.get('/api/comments', async (req, res) => {
    const section = req.query.section;
    const replyTo = req.query.replyTo;
    const search = req.query.search;
    try {
        let query;
        const request = new sql.Request();
        if (replyTo) {
            query = `SELECT c1.*, c2.username as replyToUsername FROM comments c1 LEFT JOIN comments c2 ON c1.replyTo = c2.id WHERE c1.replyTo = @replyTo`;
            request.input('replyTo', sql.Int, replyTo);
        } else if (search) {
            query = `SELECT * FROM comments WHERE section = @section AND (username LIKE @search OR content LIKE @search) AND replyTo IS NULL`;
            request.input('section', sql.NVarChar, section);
            request.input('search', sql.NVarChar, `%${search}%`);
        } else {
            query = `SELECT * FROM comments WHERE section = @section AND replyTo IS NULL`;
            request.input('section', sql.NVarChar, section);
        }
        const result = await request.query(query);
        res.json({ comments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// add a new comment to the database
app.post('/api/comments', async (req, res) => {
    const { username, content, section, replyTo } = req.body;
    try {
        await sql.query`INSERT INTO comments (username, content, section, replyTo) VALUES (${username}, ${content}, ${section}, ${replyTo})`;
        res.json({ message: "Comment added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// like a comment
app.post('/api/comments/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`UPDATE comments SET likes = likes + 1 WHERE id = ${id}`;
        res.json({ message: "Comment liked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// dislike a comment
app.post('/api/comments/:id/dislike', async (req, res) => {
    const { id } = req.params;
    try {
        await sql.query`UPDATE comments SET dislikes = dislikes + 1 WHERE id = ${id}`;
        res.json({ message: "Comment disliked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update a comment
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

// delete a comment and its replies recursively
app.delete('/api/comments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // function to delete all replies recursively
        async function deleteReplies(commentId) {
            const replies = await sql.query`SELECT id FROM comments WHERE replyTo = ${commentId}`;
            for (const reply of replies.recordset) {
                await deleteReplies(reply.id);
            }
            await sql.query`DELETE FROM comments WHERE id = ${commentId}`;
        }

        // start the deletion process with the main comment
        await deleteReplies(id);

        res.json({ message: "Comment and its replies deleted successfully" });
    } catch (err) {
        console.error("Error deleting comment:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// search comments by username
app.get('/api/comments/search', async (req, res) => {
    const username = req.query.username;
    const section = req.query.section;
    try {
        const result = await sql.query`SELECT * FROM comments WHERE username LIKE ${'%' + username + '%'} AND section = ${section}`;
        res.json({ comments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// COMMUNITY END----------------

// PROFESSIONAL START--------------
// serve the professional section page
app.get('/professionalsection', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ProfessionalSection.html'));
});

// serve the new seminar page
app.get('/newseminar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'NewSeminar.html'));
});

// serve the seminar detail page
app.get('/seminar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SeminarDetail.html'));
});

// get all seminars from the database
app.get('/api/seminars', async (req, res) => {
    const search = req.query.search || '';
    try {
        const result = await sql.query`SELECT * FROM seminars WHERE title LIKE ${'%' + search + '%'} OR description LIKE ${'%' + search + '%'} ORDER BY createdAt DESC`;
        res.json({ seminars: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// get a specific seminar by id
app.get('/api/seminars/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        const result = await request.query('SELECT * FROM seminars WHERE id = @id');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'Seminar not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// add a new seminar to the database
app.post('/api/seminars', upload.single('thumbnail'), async (req, res) => {
    const { username, title, description } = req.body;
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        await sql.query`INSERT INTO seminars (username, title, description, thumbnail) VALUES (${username}, ${title}, ${description}, ${thumbnail})`;
        res.json({ message: "Seminar added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// PROFESSIONAL END----------------

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