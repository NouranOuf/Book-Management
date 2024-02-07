const express = require("express");
const morgan = require("morgan");
const bookRoutes = require("./api/routers/Book");
const borrowersRoutes = require("./api/routers/Borrower");
const borrowingRoutes = require("./api/routers/Borrow");

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use("/books", bookRoutes);
app.use("/borrowers", borrowersRoutes);
app.use("/borrow", borrowingRoutes);

module.exports = app;
