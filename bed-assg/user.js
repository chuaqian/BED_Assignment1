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
            return result.recordset.map(row => new User(row.id, row.name, row.email, row.password, row.phoneNumber, row.birthday, row.isProfessional));
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
                console.log('Fetched user:', result.recordset[0]); // Debugging
                return new User(result.recordset[0].id, result.recordset[0].name, result.recordset[0].email, result.recordset[0].password, result.recordset[0].phoneNumber, result.recordset[0].birthday, result.recordset[0].isProfessional);
            }
            return null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
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
            request.input("isProfessional", sql.Bit, 0); // Default value for new users
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
            // Fetch the current user details
            const currentUserQuery = 'SELECT password, isProfessional FROM Users WHERE id = @id';
            const currentUserRequest = pool.request();
            currentUserRequest.input("id", sql.Int, id);
            const currentUserResult = await currentUserRequest.query(currentUserQuery);

            if (currentUserResult.recordset.length === 0) {
                throw new Error('User not found');
            }

            const { password, isProfessional } = currentUserResult.recordset[0];

            const sqlQuery = `
                UPDATE Users
                SET name = @name, email = @Email, phoneNumber = @PhoneNumber, birthday = @Birthday, 
                    password = @Password, isProfessional = @IsProfessional
                WHERE id = @id
            `;
            const request = pool.request();
            request.input("id", sql.Int, id);
            request.input("name", sql.NVarChar, updatedUser.name);
            request.input("email", sql.NVarChar, updatedUser.email);
            request.input("phoneNumber", sql.NVarChar, updatedUser.phoneNumber);
            request.input("birthday", sql.Date, updatedUser.birthday);
            request.input("password", sql.NVarChar, password); // Keep the existing password
            request.input("isProfessional", sql.Bit, isProfessional); // Keep the existing isProfessional status
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

    static async getUserByEmail(email) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Users WHERE email = @Email';
            const request = pool.request();
            request.input("Email", sql.NVarChar, email);
            const result = await request.query(sqlQuery);
            if (result.recordset[0]) {
                console.log('Fetched user by email:', result.recordset[0]); // Debugging
                return new User(result.recordset[0].id, result.recordset[0].name, result.recordset[0].email, result.recordset[0].password, result.recordset[0].phoneNumber, result.recordset[0].birthday, result.recordset[0].isProfessional);
            }
            return null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    static async updatePasswordByEmail(email, newPassword) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'UPDATE Users SET password = @newPassword WHERE email = @Email';
            const request = pool.request();
            request.input('email', sql.NVarChar, email);
            request.input('newPassword', sql.NVarChar, newPassword);
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    verifyPassword(inputPassword) {
        return this.password === inputPassword;
    }
}

module.exports = User;
