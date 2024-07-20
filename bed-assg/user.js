const sql = require("mssql");
const dbConfig = require("./dbConfig");

class User {
    constructor(id, name, email, password, phoneNumber, birthday) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
    }

    static async getAllUsers() {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Users';
            const request = connection.request();
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset.map(row => new User(row.id, row.name, row.email, row.password, row.PhoneNumber, row.birthday));
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    static async getUserById(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Users WHERE id = @id';
            const request = connection.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0] ? new User(result.recordset[0].id, result.recordset[0].name, result.recordset[0].email, result.recordset[0].password, result.recordset[0].PhoneNumber, result.recordset[0].birthday) : null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    static async createUser(newUser) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Users (name, email, password, PhoneNumber, birthday)
                VALUES (@name, @Email, @Password, @PhoneNumber, @Birthday);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = connection.request();
            request.input("name", sql.NVarChar, newUser.name);
            request.input("email", sql.NVarChar, newUser.email);
            request.input("password", sql.NVarChar, newUser.password);
            request.input("PhoneNumber", sql.NVarChar, newUser.phoneNumber);
            request.input("birthday", sql.Date, newUser.birthday);
            const result = await request.query(sqlQuery);
            connection.close();
            return this.getUserById(result.recordset[0].id);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async updateUser(id, updatedUser) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE Users
                SET name = @name, email = @Email, password = @Password, 
                    PhoneNumber = @PhoneNumber, birthday = @Birthday
                WHERE id = @id
            `;
            const request = connection.request();
            request.input("id", sql.Int, id);
            request.input("name", sql.NVarChar, updatedUser.name);
            request.input("email", sql.NVarChar, updatedUser.email);
            request.input("password", sql.NVarChar, updatedUser.password);
            request.input("PhoneNumber", sql.NVarChar, updatedUser.phoneNumber);
            request.input("birthday", sql.Date, updatedUser.birthday);
            await request.query(sqlQuery);
            connection.close();
            return this.getUserById(id);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async deleteUser(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'DELETE FROM Users WHERE id = @id';
            const request = connection.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    static async getUserByEmail(email) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Users WHERE email = @Email';
            const request = connection.request();
            request.input("Email", sql.NVarChar, email);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0] ? new User(result.recordset[0].id, result.recordset[0].name, result.recordset[0].email, result.recordset[0].password, result.recordset[0].PhoneNumber, result.recordset[0].birthday) : null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    static async updatePasswordByEmail(email, newPassword) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'UPDATE Users SET password = @newPassword WHERE email = @Email';
            const request = connection.request();
            request.input('email', sql.NVarChar, email);
            request.input('newPassword', sql.NVarChar, newPassword);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    verifyPassword(inputPassword) {
        // You should use bcrypt or another hashing algorithm to verify passwords
        return this.password === inputPassword;
    }
}

module.exports = User;
