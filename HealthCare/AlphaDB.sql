CREATE DATABASE hospitaldb;
USE hospitaldb;

-- CREATE TABLE Outpatient (
--     outpatient_id INT PRIMARY KEY AUTO_INCREMENT,
--     FirstName VARCHAR(50) NOT NULL,
--     LastName VARCHAR(50) NOT NULL,
--     DateOfBirth DATE NOT NULL,
--     PhoneNumber VARCHAR(15),
--     Email VARCHAR(100) NOT NULL UNIQUE
-- );

CREATE TABLE Inpatient (
    Inpatient_id INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    PhoneNumber VARCHAR(15),
    AdmissionDate DATETIME NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PassKey VARCHAR(255) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Diagnosis VARCHAR(255),
    Treatment VARCHAR(255),
); 

CREATE TABLE Doctor (
    Doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15),
    Username VARCHAR(50) NOT NULL UNIQUE,
    PassKey VARCHAR(255) NOT NULL
);

CREATE TABLE Nurse (
    Nurse_id INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15),
    Username VARCHAR(50) NOT NULL UNIQUE,
    PassKey VARCHAR(255) NOT NULL
);

CREATE TABLE Admin (
    Admin_id INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15),
    Username VARCHAR(50) NOT NULL UNIQUE,
    PassKey VARCHAR(255) NOT NULL
);

CREATE TABLE Receptionist (
    receptionist_id INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(15),
    Username VARCHAR(50) NOT NULL UNIQUE,
    PassKey VARCHAR(255) NOT NULL
);

drop database hospitaldb;