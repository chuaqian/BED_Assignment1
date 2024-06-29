const sql = require("mssql");
const dbConfig = require("./dbConfig");

class Professional {
    constructor(id, name, email, password, number, occupation, highestEducation) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.number = number;
        this.occupation = occupation;
        this.highestEducation = highestEducation;
    }

    static async getAllProfessionals() {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Professionals`;
            const request = connection.request();
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset.map(row => new Professional(
                row.id, row.name, row.email, row.password, row.number, row.occupation, row.highestEducation
            ));
        } catch (error) {
            console.error('Error fetching professionals:', error.message);
            throw error;
        }
    }

    static async getProfessionalById(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Professionals WHERE id = @id`;
            const request = connection.request();
            request.input("id", id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0] ? new Professional(
                result.recordset[0].id, result.recordset[0].name, result.recordset[0].email,
                result.recordset[0].password, result.recordset[0].number, result.recordset[0].occupation,
                result.recordset[0].highestEducation
            ) : null;
        } catch (error) {
            console.error(`Error fetching professional with ID ${id}:`, error.message);
            throw error;
        }
    }

    static async createProfessional(newProfessional) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                INSERT INTO Professionals (name, email, password, number, occupation, highestEducation)
                VALUES (@name, @email, @password, @number, @occupation, @highestEducation);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = connection.request();
            request.input("name", newProfessional.name);
            request.input("email", newProfessional.email);
            request.input("password", newProfessional.password);
            request.input("number", newProfessional.number);
            request.input("occupation", newProfessional.occupation);
            request.input("highestEducation", newProfessional.highestEducation);
            const result = await request.query(sqlQuery);
            connection.close();
            return this.getProfessionalById(result.recordset[0].id);
        } catch (error) {
            console.error('Error creating professional:', error.message);
            throw error;
        }
    }

    static async updateProfessional(id, updatedProfessional) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `
                UPDATE Professionals
                SET name = @name, email = @email,
                    password = @password, number = @number,
                    occupation = @occupation, highestEducation = @highestEducation
                WHERE id = @id
            `;
            const request = connection.request();
            request.input("id", id);
            request.input("name", updatedProfessional.name);
            request.input("email", updatedProfessional.email);
            request.input("password", updatedProfessional.password);
            request.input("number", updatedProfessional.number);
            request.input("occupation", updatedProfessional.occupation);
            request.input("highestEducation", updatedProfessional.highestEducation);
            await request.query(sqlQuery);
            connection.close();
            return this.getProfessionalById(id);
        } catch (error) {
            console.error(`Error updating professional with ID ${id}:`, error.message);
            throw error;
        }
    }

    static async deleteProfessional(id) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `DELETE FROM Professionals WHERE id = @id`;
            const request = connection.request();
            request.input("id", id);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.rowsAffected > 0;
        } catch (error) {
            console.error(`Error deleting professional with ID ${id}:`, error.message);
            throw error;
        }
    }

    static async getProfessionalByEmail(email) {
        try {
            const connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Professionals WHERE email = @Email`;
            const request = connection.request();
            request.input("Email", email);
            const result = await request.query(sqlQuery);
            connection.close();
            return result.recordset[0] ? new Professional(
                result.recordset[0].id, result.recordset[0].name, result.recordset[0].email,
                result.recordset[0].password, result.recordset[0].number, result.recordset[0].occupation,
                result.recordset[0].highestEducation
            ) : null;
        } catch (error) {
            console.error(`Error fetching professional with email ${email}:`, error.message);
            throw error;
        }
    }

    verifyPassword(inputPassword) {
        return this.password === inputPassword;
    }
}

module.exports = Professional;
