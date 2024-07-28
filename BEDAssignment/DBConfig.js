module.exports = {
    user: "BED_Assignment",
    password: "PASSWORD",
    server: "ASUSGROUDON//SQLEXPRESS",
    database: "BED_Assignment",
    trustServerCertificate: true,
    options: {
        port: 1433,
        connectionTimeout: 60000,
        requestTimeout: 30000
    },
    pool: {
        max: 9999999,
        min: 0,
        idleTimeoutMillis:30000
    }
};