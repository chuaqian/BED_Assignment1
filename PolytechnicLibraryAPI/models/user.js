const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("../dbConfig");
const bcryptjs = require("bcryptjs");

class User{
    constructor(user_id, username, passwordHash, role) {
        this.user_id = user_id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    static async createUser(newUserData) {
        const connection = await sql.connect(dbConfig);
        // console.log(newUserData)
        const sqlQuery = `INSERT INTO Users (username, passwordHash, role) VALUES (@username, @passwordHash, @role); SELECT SCOPE_IDENTITY() AS user_id;`; // Retrieve ID of inserted record
    
        const request = connection.request();
        request.input("username", newUserData.username);
        request.input("passwordHash", newUserData.passwordHash);
        request.input("role", newUserData.role);
    
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        // Retrieve the newly created user using its ID
        console.log(result.recordset[0].user_id)
        return this.getUserByUserID(result.recordset[0].user_id);
        // return true;
    }

    static async getUserByUsername(username) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM Users WHERE username = @username`; // Parameterized query
    
        const request = connection.request();
        request.input("username", username);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
          ? new User(
              result.recordset[0].user_id,
              result.recordset[0].username,
              result.recordset[0].passwordHash,
              result.recordset[0].role
            )
          : null; // Handle user not found
    }
    
    static async getUserByUserID(user_id) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `SELECT * FROM Users WHERE user_id = @user_id`; // Parameterized query
    
        const request = connection.request();
        request.input("user_id", user_id);
        const result = await request.query(sqlQuery);
    
        connection.close();
    
        return result.recordset[0]
          ? new User(
              result.recordset[0].user_id,
              result.recordset[0].username,
              result.recordset[0].passwordHash,
              result.recordset[0].role
            )
          : null; // Handle user not found
    }
}

module.exports = User;
