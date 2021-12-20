require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const booksRouter = require("./routes/books");
const authorsRouter = require("./routes/authors");

app.use(cors());

app.use("/books", booksRouter);
app.use("/authors", authorsRouter);

const PORT = process.env.PORT || 9001;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));

// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  if (err.type === "not-found") {
    res.status(404).send(err);
  } else if (err.type === "bad-request") {
    res.status(400).send(err);
  } else if (err.type === "precondition-required") {
    res.status(428).send(err);
  } else {
    res.sendStatus(500);
  }
});

module.exports = app;
