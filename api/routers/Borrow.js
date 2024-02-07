const express = require("express");
const rateLimit = require("express-rate-limit");
const db = require("../../Models/database");

const router = express.Router();
 
// apply the rate limiting on the checkout and return operations
const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests 
  error: "too many requests from this IP, please try again later",
});

//A borrower can check out a book
// add a row in the borrowing table and decrement QuantityAvailable in book table
// making this process atomic
router.post("/checkout", Limiter, (request, response) => {
  const { BorrowerID, BookID } = request.body;
  // get the current date for the checkout date
  const currentDate = new Date().toISOString().slice(0, 10);

  // calculate the due date (14 days from the checkout date)
  const due_Date = new Date();
  due_Date.setDate(due_Date.getDate() + 14);
  const dueDate = due_Date.toISOString().slice(0, 10);

  // start transaction
  db.beginTransaction(function (err) {
    if (err) {
      console.error("Error starting transaction:", err);
      return response.status(500).json({ error: "Internal Server Error" }); // Handle transaction start error
    }

    // Insert into borrowing table
    db.query(
      "INSERT INTO borrowing (BorrowerID, BookID, CheckOutDate, DueDate) VALUES (?, ?, ?, ?)",
      [BorrowerID, BookID, currentDate, dueDate],
      function (err, result) {
        if (err) {
          console.error("Error inserting into borrowing table:", err);
          return db.rollback(function () {
            response.status(500).json({ error: "Internal Server Error" }); // Rollback transaction on error
          });
        }

        // decrement QuantityAvailable in book table
        decrementQuantityAvailable(BookID, function (err) {
          if (err) {
            console.error("Error decrementing QuantityAvailable:", err);
            return db.rollback(function () {
              response.status(500).json({ error: "Internal Server Error" }); // Rollback transaction on error
            });
          }

          // commit the transaction if both operations were successful
          db.commit(function (err) {
            if (err) {
              console.error("Error committing transaction:", err);
              return response
                .status(500)
                .json({ error: "Internal Server Error" }); // handle transaction commit error
            }

            response
              .status(200)
              .json({ message: "Successful operation", id: result.insertId }); // send success response
          });
        });
      }
    );
  });
});

function decrementQuantityAvailable(BookID, callback) {
  db.query(
    "UPDATE book SET QuantityAvailable = QuantityAvailable - 1 WHERE BookID = ?",
    [BookID],
    function (err) {
      if (err) {
        console.error("Error updating QuantityAvailable:", err);
        return callback(err); // Pass the error to the callback
      }
      callback(null); // No error, call the callback with null
    }
  );
}

// A borrower can return a book by his borrowingID and send the BookID
// we will update with the borrowingID the returnDate and increase QuantityAvailable in the book table
// also making this process atomic
router.post("/return/:id", Limiter, (request, response) => {
  const { id } = request.params;
  const { BookID } = request.body;

  // get the current date for the return date
  const currentDate = new Date().toISOString().slice(0, 10);

  // start transaction
  db.beginTransaction(function (err) {
    if (err) {
      console.error("Error starting transaction:", err);
      return response.status(500).json({ error: "Internal Server Error" }); // Handle transaction start error
    }

    // update return date in borrowing table
    db.query(
      "UPDATE borrowing SET ReturnDate = ? WHERE BorrowingID = ? && BookID=?",
      [currentDate, id , BookID],
      function (err, res) {
        console.log(res);
        if (err) {
          console.error("Error updating return date:", err);
          return db.rollback(function () {
            response.status(500).json({ error: "internal server error" }); // rollback transaction on error
          });
        }
        if (res.changedRows === 0)
          return response.status(404).json({ error: "Unable to return book, check your book ID or wether you returned it before" });
        // increment QuantityAvailable in book table
        incrementQuantityAvailable(BookID, function (err) {
          if (err) {
            console.error("Error incrementing QuantityAvailable:", err);
            return db.rollback(function () {
              response.status(500).json({ error: "internal server error" });// rollback transaction on error
            });
          }

          // commit the transaction if both operations were successful
          db.commit(function (err) {
            if (err) {
              console.error("Error committing transaction:", err);
              return response
                .status(500)
                .json({ error: "Internal Server Error" }); // handle transaction commit error
            }

            response.status(200).json({message:"book has been returned"}); // send success response
          });
        });
      }
    );
  });
});

function incrementQuantityAvailable(BookID, callback) {
  db.query(
    "UPDATE book SET QuantityAvailable = QuantityAvailable + 1 WHERE BookID = ?",
    [BookID],
    function (err, res) {
      console.log(res);
      if (err) {
        console.error("Error updating QuantityAvailable:", err);
        return callback(err); // pass the error to the callback
      }
      callback(null); // no error, call the callback with null
    }
  );
}

// A borrower can check the books they currently have
// by using the BorrowerID we will count the number of borrowing operations happened and join with book table to get the names of the books by the BookID
router.get("/books", (request, response) => {
  const { BorrowerID } = request.body;
  if (typeof BorrowerID === "number") {
    db.query(
      "SELECT  book.Title FROM borrowing JOIN book ON borrowing.BookID = book.BookID WHERE borrowing.BorrowerID = ? AND borrowing.ReturnDate IS NULL",
      BorrowerID,
      (err, res) => {
        if (err)
          return response.status(500).json({ error: "internal server error" });
        return response.status(200).json({
          message: "checked out books are fetched successfully",
          data: res,
        });
      }
    );
  } else return response.status(400).json({ message: "Bad Request" });
});

// The system should keep track of due dates for the books and list books that are overdue.
// we will fetch the rows with returnDate=NULL or the returnDate-checkoutDate > dueDate
router.get("/overdue", (request, response) => {
  db.query(
    "SELECT book.Title FROM borrowing JOIN book ON borrowing.BookID=book.BookID WHERE ReturnDate IS NULL OR ReturnDate-CheckOutDate > DueDate",
    (err, res) => {
      if (err)
        return response.status(500).json({ error: "internal server error" });
      return response
        .status(200)
        .json({ message: "books fetched successfully", data: res });
    }
  );
});

//Exports all overdue borrows of the last month.
router.get("/overdue/lastmonth", (request, response) => {
  db.query(
    "SELECT * FROM borrowing WHERE (ReturnDate IS NULL OR ReturnDate-CheckOutDate > DueDate)  AND DueDate > DATE_SUB(NOW(), INTERVAL 1 MONTH)",
    (err, res) => {
      if (err)
        return response.status(500).json({ error: "internal server error" });
      return response
        .status(200)
        .json({ message: "books fetched successfully", data: res });
    }
  );
});

//Exports all borrowing of the last month.
router.get("/lastmonth", (request, response) => {
  db.query(
    "SELECT * FROM borrowing WHERE CheckOutDate > DATE_SUB(NOW(), INTERVAL 1 MONTH)",
    (err, res) => {
      if (err)
        return response.status(500).json({ error: "internal server error" });
      return response
        .status(200)
        .json({ message: "books fetched successfully", data: res });
    }
  );
});

module.exports = router;
