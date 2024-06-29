const sql = require("mssql");
const dbConfig = require("./dbConfig");

class User {
    constructor(id, name, email, password, number, birthday) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.number = number;
        this.birthday = birthday;
    }

    static async getAllUsers() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users`;
        const request = connection.request();
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset.map(row => new User(row.id, row.name, row.email, row.password, row.number, row.birthday));
    }

    static async getUserById(id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE id = @id`;
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset[0] ? new User(result.recordset[0].id, result.recordset[0].name, result.recordset[0].email, result.recordset[0].password, result.recordset[0].number, result.recordset[0].birthday) : null;
    }

    static async createUser(newUser) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `INSERT INTO Users (name, email, password, number, birthday) VALUES (@name, @email, @password, @number, @birthday); SELECT SCOPE_IDENTITY() AS id;`;
        const request = connection.request();
        request.input("name", newUser.name);
        request.input("email", newUser.email);
        request.input("password", newUser.password);
        request.input("number", newUser.number);
        request.input("birthday", newUser.birthday);
        const result = await request.query(sqlQuery);
        connection.close();
        return this.getUserById(result.recordset[0].id);
    }

    static async updateUser(id, updatedUser) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `UPDATE Users SET name = @name, email = @email, password = @password, number = @number, birthday = @birthday WHERE id = @id`;
        const request = connection.request();
        request.input("id", id);
        request.input("name", updatedUser.name);
        request.input("email", updatedUser.email);
        request.input("password", updatedUser.password);
        request.input("number", updatedUser.number);
        request.input("birthday", updatedUser.birthday);
        await request.query(sqlQuery);
        connection.close();
        return this.getUserById(id);
    }

    static async deleteUser(id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM Users WHERE id = @id`;
        const request = connection.request();
        request.input("id", id);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.rowsAffected > 0;
    }

    static async getUserByEmail(email) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Users WHERE email = @Email`;
        const request = connection.request();
        request.input("Email", email);
        const result = await request.query(sqlQuery);
        connection.close();
        return result.recordset[0] ? new User(result.recordset[0].id, result.recordset[0].name, result.recordset[0].email, result.recordset[0].password, result.recordset[0].number, result.recordset[0].birthday) : null;
    }

    verifyPassword(inputPassword) {
        return this.password === inputPassword;
    }
}

module.exports = User;
