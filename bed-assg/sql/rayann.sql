Create Users table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phoneNumber NVARCHAR(50) NULL,
    birthday DATE NULL,
    isProfessional BIT NOT NULL DEFAULT 0
);
 
 
CREATE TABLE Professionals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phoneNumber NVARCHAR(50) NULL,
    birthday DATE NULL,
    occupation NVARCHAR(255) NULL,
    highestEducation NVARCHAR(255) NULL,
    isProfessional BIT DEFAULT 1 
);