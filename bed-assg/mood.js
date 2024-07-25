const sql = require("mssql");
const dbConfig = require("./dbConfig");

class Mood {
    constructor(id, userId, date, description, moodIndex) {
        this.id = id;
        this.userId = userId;
        this.date = date;
        this.description = description;
        this.moodIndex = moodIndex;
    }

    static async getAllMoods() {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Moods';
            const request = connection.request();
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset.map(row => new Mood(row.id, row.userId, row.date, row.description, row.moodIndex));
        } catch (error) {
            throw new Error(`Error fetching all moods: ${error.message}`);
        }
    }

    static async getMoodsByUserId(userId) {
        try {
            const connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('userId', sql.Int, userId)
                .query('SELECT * FROM Moods WHERE userId = @userId');
            connection.close();
            return result.recordset.map(row => new Mood(row.id, row.userId, row.date, row.description, row.moodIndex));
        } catch (error) {
            throw new Error(`Error fetching moods for user ${userId}: ${error.message}`);
        }
    }

    static async getMoodById(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const result = await connection.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM Moods WHERE Id = @id');
            connection.close();
            return result.recordset.length > 0 ? new Mood(result.recordset[0].id, result.recordset[0].userId, result.recordset[0].date, result.recordset[0].description, result.recordset[0].moodIndex) : null;
        } catch (error) {
            throw new Error(`Error fetching mood by id: ${error.message}`);
        }
    }

    static async createMood(newMood) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Moods (userId, date, description, moodIndex)
                VALUES (@userId, @date, @description, @moodIndex);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = connection.request();
            request.input("userId", sql.Int, newMood.userId);
            request.input("date", sql.Date, newMood.date);
            request.input("description", sql.NVarChar, newMood.description);
            request.input("moodIndex", sql.Int, newMood.moodIndex);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0].id;
        } catch (error) {
            throw new Error(`Error creating mood: ${error.message}`);
        }
    }

    static async updateMood(id, mood) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE Moods
                SET userId = @userId, date = @date, description = @description, moodIndex = @moodIndex
                WHERE id = @id;
            `;
            const request = connection.request();
            request.input("id", sql.Int, id);
            request.input("userId", sql.Int, mood.userId);
            request.input("date", sql.Date, mood.date);
            request.input("description", sql.NVarChar, mood.description);
            request.input("moodIndex", sql.Int, mood.moodIndex);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw new Error(`Error updating mood: ${error.message}`);
        }
    }

    static async deleteMood(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'DELETE FROM Moods WHERE id = @id';
            const request = connection.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw new Error(`Error deleting mood: ${error.message}`);
        }
    }
}

module.exports = Mood;
