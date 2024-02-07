const express = require("express");
const db = require("../../Models/database");

const router = express.Router();

// we will use parametrized queries for security and prevent sql injection .
// also validate user input by checking data types
// list all books
router.get("/", (request, response) => {
  db.query("SELECT * FROM book", (error, res) => {
    console.log(error); 
    if (error)
      return response.status(500).json({ error: "internal server error" });
    return response.status(200).json(res);
  });
});

// Add abook
router.post("/", (request, response) => {
  const { Title, Author, ISBN, QuantityAvailable, ShelfLocation } =
    request.body;
  // console.log(typeof Title , typeof Author , typeof ISBN , typeof QuantityAvailable , typeof ShelfLocation);
  if (
    typeof Title === "string" &&
    typeof Author === "string" &&
    typeof ISBN === "string" &&
    typeof ShelfLocation === "string" &&
    typeof QuantityAvailable === "number"
  ) {
    db.query(
      "INSERT INTO book ( Title,Author,ISBN , QuantityAvailable , ShelfLocation) VALUES (?, ?,?,?,?)",
      [Title, Author, ISBN, QuantityAvailable, ShelfLocation],
      (err, res) => {
        if (err)
          return response.status(500).json({ error: "internal server error" });
        return response
          .status(200)
          .json({ message: "Book added successfully", id: res.insertId });
      }
    );
  } else return response.status(400).json({ message: "Bad Request" });
});

// Update a book by id
router.put("/:id", (request, response) => {
  const { id } = request.params;
  const { Title, Author, ISBN, QuantityAvailable, ShelfLocation } =
    request.body;
  if (
    typeof Title === "string" &&
    typeof Author === "string" &&
    typeof ISBN === "string" &&
    typeof ShelfLocation === "string" &&
    typeof QuantityAvailable === "number"
  ) {
    db.query(
      "UPDATE book SET Title=? , Author=? , ISBN=? , QuantityAvailable=? , ShelfLocation=? WHERE BookID = ?",
      [Title, Author, ISBN, QuantityAvailable, ShelfLocation, id],
      (err, res) => {
        if (err)
          return response.status(500).json({ error: "internal server error" });
        return response
          .status(200)
          .json({ message: "Book updated successfully" });
      }
    );
  } else return response.status(400).json({ message: "Bad Request" });
});

// Delete a book by id
router.delete("/:id", (request, response) => {
  const { id } = request.params;
  db.query("DELETE FROM book WHERE BookID = ?", [id], (err) => {
    if (err)
      return response.status(500).json({ error: "internal server error" });
    return response.status(200).json({ message: "Book deleted successfully" });
  });
});

// Search by title, author, or ISBN.
router.get("/search/", (request, response) => {
  const { search_keyword } = request.query;
  db.query(
    "SELECT * FROM book WHERE Title LIKE ? OR Author LIKE ? OR ISBN LIKE ?",
    [`%${search_keyword}%`, `%${search_keyword}%`, `%${search_keyword}%`],
    (err, res) => {
      if (err)
        return response.status(500).json({ error: "internal server error" });
      return response.status(200).json({ data: res });
    }
  );
});

module.exports = router;
