const express = require("express");
const validator = require("validator");
const db = require("../../Models/database");

const router = express.Router();

// we will use parametrized queries for security and prevent sql injection .
// also validate user input by checking data types and some attributes format .

// list all borrowers
router.get("/", (request, response) => {
  db.query("SELECT * FROM borrower", (error, res) => {
    if (error)
      return response.status(500).json({ error: "internal server error" });
    return response.status(200).json(res);
  });
});

// Add a borrower
router.post("/", (request, response) => {
  const { BorrowerName, Email, RegisteredDate } = request.body;
  if (
    typeof BorrowerName === "string" &&
    validator.isEmail(Email) &&
    validator.isISO8601(RegisteredDate)
  ) {
    db.query(
      "INSERT INTO borrower ( BorrowerName ,Email ,RegisteredDate ) VALUES (?,?,?)",
      [BorrowerName, Email, RegisteredDate],
      (err, res) => {
        console.log(err);
        if (err)
          return response.status(500).json({ error: "internal server error" });
        return response
          .status(200)
          .json({ message: "Borrower added successfully", id: res.insertId });
      }
    );
  } else return response.status(400).json({ message: "Bad Request" });
});

// Update a borrower by id
router.put("/:id", (request, response) => {
  const { id } = request.params;
  const { BorrowerName, Email, RegisteredDate } = request.body;
  // by update hagat msh mwgoda fix this
  if (
    typeof BorrowerName === "string" &&
    validator.isEmail(Email) &&
    validator.isISO8601(RegisteredDate)
  ) {
    db.query(
      "UPDATE borrower SET BorrowerName=?, Email=?, RegisteredDate=? WHERE BorrowerID = ? ",
      [BorrowerName, Email, RegisteredDate, id],
      (err) => {
        if (err)
          return response.status(500).json({ error: "internal server error" });
        return response
          .status(200)
          .json({ message: "Borrower updated successfully" });
      }
    );
  } else return response.status(400).json({ message: "Bad Request" });
});

// Delete a borrower by id
router.delete("/:id", (request, response) => {
  const { id } = request.params;
  db.query("DELETE FROM borrower WHERE BorrowerID = ?", [id], (err) => {
    if (err)
      return response.status(500).json({ error: "internal server error" });
    return response.status(200).json({ message: "Borrower deleted successfully" });
  });
});

module.exports = router;
