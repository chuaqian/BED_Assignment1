const sql = require('mssql');
const express = require('express');
const DBConfig = require("../DBConfig.js")

class User {
    constructor(ID, Username, Score) {
        this.ID = ID;
        this.Username = Username;
        this.Score = Score;
    }

    static async createUserEntry(NewUserEntry) {
        const connection = await sql.connect(DBConfig);

        const sqlQuery = `INSERT INTO Users (Username, Score) VALUES (@Username, @Score); SELECT SCOPE_IDENTITY() AS id;`;

        const request = connection.request();
        request.input("Username", NewUserEntry.Username);
        request.input("Score", NewUserEntry.Score);

        const result = await request.query(sqlQuery);
c
        connection.close();

        return this.GetUserById(result.recordset[0].id);
    }

    static async getUserByHighestScore() {
        const connection = await sql.connect(DBConfig);

        const sqlQuery = `SELECT * FROM Users Where Score = (SELECT MAX(Score) From Users)`
        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();

        return result.recordset[0]
            ? new User(
                result.recordset[0].Id,
                result.recordset[0].Username,
                result.recordset[0].Score
            )
            : null;
    }
}

module.exports = User;