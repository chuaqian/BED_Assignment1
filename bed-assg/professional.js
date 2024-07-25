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
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Professionals';
            const request = pool.request();
            const result = await request.query(sqlQuery);
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
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Professionals WHERE ID = @id';
            const request = pool.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            if (result.recordset[0]) {
                const row = result.recordset[0];
                return new Professional(
                    row.ID,
                    row.Name,
                    row.Email,
                    row.Password,
                    row.PhoneNumber,
                    row.Birthday,
                    row.Occupation,
                    row.HighestEducation
                );
            }
            return null;
        } catch (error) {
            console.error('Error getting professional by ID:', error);
            throw error;
        }
    }

    static async getProfessionalByEmail(email) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'SELECT * FROM Professionals WHERE Email = @Email';
            const request = pool.request();
            request.input("Email", sql.NVarChar, email);
            const result = await request.query(sqlQuery);
            if (result.recordset[0]) {
                const row = result.recordset[0];
                return new Professional(
                    row.ID,
                    row.Name,
                    row.Email,
                    row.Password,
                    row.PhoneNumber,
                    row.Birthday,
                    row.Occupation,
                    row.HighestEducation
                );
            }
            return null;
        } catch (error) {
            console.error('Error getting professional by email:', error);
            throw error;
        }
    }

    static async createProfessional(newProfessional) {
        try {
            const pool = await poolPromise;
            const sqlQuery = `
                INSERT INTO Professionals (Name, Email, Password, PhoneNumber, Birthday, Occupation, HighestEducation, isProfessional)
                VALUES (@name, @Email, @Password, @PhoneNumber, @Birthday, @Occupation, @HighestEducation, @isProfessional);
                SELECT SCOPE_IDENTITY() AS id;
            `;
            const request = pool.request();
            request.input("name", sql.NVarChar, newProfessional.name);
            request.input("email", sql.NVarChar, newProfessional.email);
            request.input("password", sql.NVarChar, newProfessional.password);
            request.input("phoneNumber", sql.NVarChar, newProfessional.phoneNumber);
            request.input("birthday", sql.Date, newProfessional.birthday);
            request.input("occupation", sql.NVarChar, newProfessional.occupation);
            request.input("highestEducation", sql.NVarChar, newProfessional.highestEducation);
            request.input("isProfessional", sql.Bit, true);
            const result = await request.query(sqlQuery);
            return this.getProfessionalById(result.recordset[0].id);
        } catch (error) {
            console.error('Error creating professional:', error);
            throw error;
        }
    }

    static async updateProfessional(id, updatedProfessional) {
        try {
            const pool = await poolPromise;
            // Fetch the current professional details
            const currentProfessionalQuery = 'SELECT password, isProfessional FROM Professionals WHERE id = @id';
            const currentProfessionalRequest = pool.request();
            currentProfessionalRequest.input("id", sql.Int, id);
            const currentProfessionalResult = await currentProfessionalRequest.query(currentProfessionalQuery);
    
            if (currentProfessionalResult.recordset.length === 0) {
                throw new Error('Professional not found');
            }
    
            const { password, isProfessional } = currentProfessionalResult.recordset[0];
    
            const sqlQuery = `
                UPDATE Professionals
                SET Name = @name, Email = @Email, PhoneNumber = @PhoneNumber, Birthday = @Birthday, 
                    Password = @Password, Occupation = @Occupation, HighestEducation = @HighestEducation, isProfessional = @IsProfessional
                WHERE id = @id
            `;
            const request = pool.request();
            request.input("id", sql.Int, id);
            request.input("name", sql.NVarChar, updatedProfessional.name);
            request.input("email", sql.NVarChar, updatedProfessional.email);
            request.input("phoneNumber", sql.NVarChar, updatedProfessional.phoneNumber);
            request.input("birthday", sql.Date, updatedProfessional.birthday);
            request.input("password", sql.NVarChar, password); // Keep the existing password
            request.input("occupation", sql.NVarChar, updatedProfessional.occupation);
            request.input("highestEducation", sql.NVarChar, updatedProfessional.highestEducation);
            request.input("isProfessional", sql.Bit, isProfessional); // Keep the existing isProfessional status
            await request.query(sqlQuery);
            return await this.getProfessionalById(id);
        } catch (error) {
            console.error('Error updating professional:', error);
            throw error;
        }
    }    

    static async deleteProfessional(id) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'DELETE FROM Professionals WHERE id = @id';
            const request = pool.request();
            request.input("id", sql.Int, id);
            const result = await request.query(sqlQuery);
            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting professional:', error);
            throw error;
        }
    }

    static async updatePasswordById(id, newPassword) {
        try {
            const pool = await poolPromise;
            const sqlQuery = 'UPDATE Professionals SET Password = @newPassword WHERE ID = @id';
            const request = pool.request();
            request.input('id', sql.Int, id);
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
}

module.exports = Professional;
