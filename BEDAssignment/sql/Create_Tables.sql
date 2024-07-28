CREATE DATABASE BED_Assignment;

CREATE TABLE Users (
  id INT PRIMARY KEY NOT NULL IDENTITY,
  Username VARCHAR(255) NOT NULL UNIQUE,
  Score VARCHAR(255)
);

INSERT INTO Users (Username, Score)
VALUES
  ('IronMan', '15'),
  ('Hulk', '3'),
  ('Dantdm', '13'),
  ('Percy Jackson', '7'),
  ('Thinknoodles', '9'),
  ('Thor', '5');