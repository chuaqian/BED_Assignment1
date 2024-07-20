const sql = require("mssql");
const dbConfig = require("./dbConfig");

class Professional {
    constructor(id, name, email, password, phoneNumber, birthday, occupation, highestEducation) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
        this.occupation = occupation;
        this.highestEducation = highestEducation;
    }

    static async getAllProfessionals() {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Professionals';
            const request = connection.request();
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset.map(row => new Professional(
                row.ID,
                row.Name,
                row.Email,
                row.Password,
                row.PhoneNumber,
                row.Birthday,
                row.Occupation,
                row.HighestEducation
            ));
        } catch (error) {
            console.error('Error getting all professionals:', error);
            throw error;
        }
    }

    static async getProfessionalById(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Professionals WHERE ID = @id';
            const request = connection.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0] ? new Professional(
                result.recordset[0].ID,
                result.recordset[0].Name,
                result.recordset[0].Email,
                result.recordset[0].Password,
                result.recordset[0].PhoneNumber,
                result.recordset[0].Birthday,
                result.recordset[0].Occupation,
                result.recordset[0].HighestEducation
            ) : null;
        } catch (error) {
            console.error('Error getting professional by ID:', error);
            throw error;
        }
    }

    static async createProfessional(newProfessional) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Professionals (Name, Email, Password, PhoneNumber, Birthday, Occupation, HighestEducation)
                VALUES (@name, @Email, @Password, @PhoneNumber, @Birthday, @Occupation, @HighestEducation);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = connection.request();
            request.input("name", sql.NVarChar, newProfessional.name);
            request.input("email", sql.NVarChar, newProfessional.email);
            request.input("password", sql.NVarChar, newProfessional.password); // Store hashed password
            request.input("phoneNumber", sql.NVarChar, newProfessional.phoneNumber);
            request.input("birthday", sql.Date, newProfessional.birthday);
            request.input("occupation", sql.NVarChar, newProfessional.occupation);
            request.input("highestEducation", sql.NVarChar, newProfessional.highestEducation);
            const result = await request.query(sqlQuery);
            connection.close();
            return this.getProfessionalById(result.recordset[0].id);
        } catch (error) {
            console.error('Error creating professional:', error);
            throw error;
        }
    }

    static async updateProfessional(id, updatedProfessional) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE Professionals
                SET Name = @name, Email = @Email, Password = @Password, 
                    PhoneNumber = @PhoneNumber, Birthday = @Birthday, 
                    Occupation = @Occupation, HighestEducation = @HighestEducation
                WHERE ID = @id
            `;
            const request = connection.request();
            request.input("id", sql.Int, id);
            request.input("name", sql.NVarChar, updatedProfessional.name);
            request.input("email", sql.NVarChar, updatedProfessional.email);
            request.input("password", sql.NVarChar, updatedProfessional.password); // Store hashed password
            request.input("phoneNumber", sql.NVarChar, updatedProfessional.phoneNumber);
            request.input("birthday", sql.Date, updatedProfessional.birthday);
            request.input("occupation", sql.NVarChar, updatedProfessional.occupation);
            request.input("highestEducation", sql.NVarChar, updatedProfessional.highestEducation);
            await request.query(sqlQuery);
            connection.close();
            return this.getProfessionalById(id);
        } catch (error) {
            console.error('Error updating professional:', error);
            throw error;
        }
    }

    static async deleteProfessional(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'DELETE FROM Professionals WHERE ID = @id';
            const request = connection.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting professional:', error);
            throw error;
        }
    }

    static async getProfessionalByEmail(email) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = 'SELECT * FROM Professionals WHERE Email = @Email';
            const request = connection.request();
            request.input("Email", sql.NVarChar, email);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0] ? new Professional(
                result.recordset[0].ID,
                result.recordset[0].Name,
                result.recordset[0].Email,
                result.recordset[0].Password,
                result.recordset[0].PhoneNumber,
                result.recordset[0].Birthday,
                result.recordset[0].Occupation,
                result.recordset[0].HighestEducation
            ) : null;
        } catch (error) {
            console.error('Error getting professional by email:', error);
            throw error;
        }
    }

    verifyPassword(inputPassword) {
        // You should use bcrypt or another hashing algorithm to verify passwords
        return this.password === inputPassword;
    }
}

module.exports = Professional;
