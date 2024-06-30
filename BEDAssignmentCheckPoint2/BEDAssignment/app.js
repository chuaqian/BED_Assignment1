const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
const DBConfig = require('./DBConfig.js');
const user = require('./models/user.js');
const UserController = require("./controllers/userController.js");

const app = express();
const port = 3000;

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

mssql.connect(DBConfig, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('Connected to MSSQL database');
});

app.post('/submit-score', async (req, res) => {
    const { Username, Score } = req.body;

    if (!Username || !Score) {
        return res.status(400).json({ error: 'Username and Score are required' });
    }

    const sql = 'INSERT INTO Users (Username, Score) VALUES (@Username, @Score)';

    try {
        const request = new mssql.Request();
        request.input('Username', mssql.NVarChar, Username);
        request.input('Score', mssql.Int, Score);

        await request.query(sql);

        console.log('Score inserted successfully');
        res.json({ message: 'Score submitted successfully' });
    } catch (err) {
        console.error('Error inserting score:', err);
        res.status(500).json({ error: 'Error inserting score' });
    }
});

app.get('/get-highest-score', UserController.getHighestScore);

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
