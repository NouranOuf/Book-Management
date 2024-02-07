CREATE TABLE Book (
    BookID INT PRIMARY KEY auto_increment,
    Title VARCHAR(255) unique not null,
    Author VARCHAR(255),
    ISBN VARCHAR(13) unique not null,
    QuantityAvailable INT not null,
    ShelfLocation VARCHAR(50) unique not null
);

CREATE TABLE Borrower (
    BorrowerID INT PRIMARY KEY auto_increment,
    BorrowerName VARCHAR(100) not null,
    Email VARCHAR(255) unique not null,
    RegisteredDate DATE 
);

CREATE TABLE Borrowing (
    BorrowingID INT PRIMARY KEY auto_increment,
    BookID INT,
    BorrowerID INT,
    CheckOutDate DATE not null ,
    DueDate DATE not null ,
    ReturnDate DATE,
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (BorrowerID) REFERENCES Borrowers(BorrowerID)
);
