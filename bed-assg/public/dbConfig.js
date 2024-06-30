module.exports = {
    user: "bed", // Replace with your SQL Server login username
    password: "bed", // Replace with your SQL Server login password
    server: "localhost",
    database: "bed",
    trustServerCertificate: true,
    options: {
        port: 1433, // Default SQL server port
        connectionTimeout: 60000 // Connection timeout in milliseconds
    }
  };
