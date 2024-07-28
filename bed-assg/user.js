const sql = require("mssql");
const dbConfig = require("./dbConfig");

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

class User {
    constructor(id, name, email, password, phoneNumber, birthday, isProfessional = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
        this.isProfessional = isProfessional;
    }

    static async getAllUsers() {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Users';
            const request = pool.request();
            const result = await request.query(sqlQuery);
            return result.recordset.map(row => new User(
                row.id,
                row.name,
                row.email,
                row.password,
                row.phoneNumber,
                row.birthday,
                row.isProfessional
            ));
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    static async getUserById(id) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Users WHERE id = @id';
            const request = pool.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            if (result.recordset[0]) {
                const row = result.recordset[0];
                return new User(
                    row.id,
                    row.name,
                    row.email,
                    row.password,
                    row.phoneNumber,
                    row.birthday,
                    row.isProfessional
                );
            }
            return null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    static async getUserByEmail(email) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Users WHERE email = @Email';
            const request = pool.request();
            request.input("Email", sql.NVarChar, email);
            const result = await request.query(sqlQuery);
            if (result.recordset[0]) {
                const row = result.recordset[0];
                return new User(
                    row.id,
                    row.name,
                    row.email,
                    row.password,
                    row.phoneNumber,
                    row.birthday,
                    row.isProfessional
                );
            }
            return null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    static async createUser(newUser) {
        try {
            const pool = await poolPromise;
            const sqlQuery = `
                INSERT INTO Users (name, email, password, phoneNumber, birthday, isProfessional)
                VALUES (@name, @Email, @Password, @PhoneNumber, @Birthday, @isProfessional);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = pool.request();
            request.input("name", sql.NVarChar, newUser.name);
            request.input("email", sql.NVarChar, newUser.email);
            request.input("password", sql.NVarChar, newUser.password);
            request.input("phoneNumber", sql.NVarChar, newUser.phoneNumber);
            request.input("birthday", sql.Date, newUser.birthday);
            request.input("isProfessional", sql.Bit, newUser.isProfessional);
            const result = await request.query(sqlQuery);
            return this.getUserById(result.recordset[0].id);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async updateUser(id, updatedUser) {
        try {
            const pool = await poolPromise;
            const sqlQuery = `
                UPDATE Users
                SET name = @name, email = @Email, phoneNumber = @PhoneNumber, birthday = @Birthday
                WHERE id = @id
            `;
            const request = pool.request();
            request.input("id", sql.Int, id);
            request.input("name", sql.NVarChar, updatedUser.name);
            request.input("email", sql.NVarChar, updatedUser.email);
            request.input("phoneNumber", sql.NVarChar, updatedUser.phoneNumber);
            request.input("birthday", sql.Date, updatedUser.birthday);
            await request.query(sqlQuery);
            return await this.getUserById(id);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async deleteUser(id) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'DELETE FROM Users WHERE id = @id';
            const request = pool.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    static async updatePasswordById(id, newPassword) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'UPDATE Users SET password = @newPassword WHERE id = @id';
            const request = pool.request();
            request.input('id', sql.Int, id);
            request.input('newPassword', sql.NVarChar, newPassword);
            await request.query(sqlQuery);
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    static async updatePasswordByEmail(email, newPassword) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'UPDATE Users SET Password = @newPassword WHERE Email = @Email';
            const request = pool.request();
            request.input('Email', sql.NVarChar, email);
            request.input('newPassword', sql.NVarChar, newPassword); // Hash the password in a real scenario
            await request.query(sqlQuery);
            return true;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    verifyPassword(inputPassword) {
        return this.password === inputPassword;
    }

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
