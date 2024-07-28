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

-- Create Comments table
CREATE TABLE comments (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(100) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    section NVARCHAR(50) NOT NULL,
    replyTo INT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    CONSTRAINT FK_Comments_ReplyTo FOREIGN KEY (replyTo) REFERENCES comments(id)
);

-- Add userId column to Comments table and create foreign key constraint
ALTER TABLE comments ADD userId INT;
ALTER TABLE comments ADD CONSTRAINT FK_Comments_UserId FOREIGN KEY (userId) REFERENCES Users(id);

-- Create Seminars table
CREATE TABLE seminars (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    thumbnail NVARCHAR(255) NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    participantCount INT DEFAULT 0
);

ALTER TABLE seminars ADD userId INT;
ALTER TABLE seminars ADD CONSTRAINT FK_Seminars_UserId FOREIGN KEY (userId) REFERENCES Users(id);

-- Create Seminar Participants table
CREATE TABLE seminar_participants (
    id INT PRIMARY KEY IDENTITY(1,1),
    seminarId INT,
    userId INT,
    CONSTRAINT FK_SeminarParticipants_Seminar FOREIGN KEY (seminarId) REFERENCES seminars(id),
    CONSTRAINT FK_SeminarParticipants_User FOREIGN KEY (userId) REFERENCES Users(id)
);