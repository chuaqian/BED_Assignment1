-- Create Users table
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(15) NULL,
    birthday DATE NULL,
     isProfessional BIT NOT NULL DEFAULT 0
);

-- Create Professionals table
CREATE TABLE Professionals (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Birthday DATE NOT NULL,
    Occupation NVARCHAR(100) NOT NULL,
    HighestEducation NVARCHAR(100) NOT NULL,
    Password NVARCHAR(100) NOT NULL,
    isProfessional BIT DEFAULT 1
);

-- Create Moods table
CREATE TABLE Moods (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT,
    date DATE NOT NULL,
    description NVARCHAR(255),
    moodIndex INT CHECK (moodIndex BETWEEN 0 AND 4),
    FOREIGN KEY (userId) REFERENCES Users(id)
);