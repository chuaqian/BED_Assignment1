const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
const DBConfig = require('./DBConfig.js');
const user = require('./models/user.js');
const UserController = require("./controllers/userController.js");

const app = express();
const port = process.env.PORT || 3000;

mssql.on('error', err => {
    console.log('SQL Global Error:', err);
});

(async () => {
    try {
        const pool = await mssql.connect(DBConfig);
        console.log('Connected to MSSQL database');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
})();

app.use(bodyParser.json());
app.use(express.static('html'));

mssql.connect(DBConfig, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('Connected to MSSQL database');
});

app.post('/Submit.html', async (req, res) => {
    const { Username, Score } = req.body;

    console.log('Received:', req.body);

    if (!Username || Score < 0 || Score > 15) {
        console.error('Validation Error: Username and Score are required');
        return res.status(400).json({ error: 'Username and Score are required' });
    }

    const sql = 'INSERT INTO Users (Username, Score) VALUES (@Username, @Score)';

    let connection;
    try {
        connection = await mssql.connect(DBConfig);
        const request = new mssql.Request(connection);
        request.input('Username', mssql.NVarChar, Username);
        request.input('Score', mssql.Int, Score);

        await request.query(sql);

        console.log('Score submitted successfully');
        res.json({ message: 'Score submitted successfully' });
    } catch (err) {
        console.error('Error inserting score:', err);
        res.status(500).json({ error: 'Error inserting score' });
    }
});

app.get('/api/results', UserController.getHighestScore);

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
