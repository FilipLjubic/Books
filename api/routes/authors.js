const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const connect = async () => {
  return await mongoose.connect(process.env.MONGODB_URI);
};

const authorSchema = new mongoose.Schema(
  {
    name: String,
    surname: String,
  },
  {
    versionKey: false,
  }
);

const Author = mongoose.model("Author", authorSchema);

router.get("/", async (req, res) => {
  try {
    await connect();

    const authors = await Author.find().select();

    return res.json(authors);
  } catch (err) {
    err.type = "not-found";

    next(err);
  }
});

router.get("/:id/", async (req, res, next) => {
  try {
    await connect();

    const authors = await Author.findById(req.params.id).select();

    return res.json(authors);
  } catch (err) {
    err.type = "not-found";
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await connect();

    const author = new Author(req.body);

    await author.save();

    return res.json(author);
  } catch (err) {
    err.type = "bad-request";

    next(err);
  }
});

router.put("/:id/", async (req, res, next) => {
  try {
    await connect();

    Author.findByIdAndUpdate(req.params.id, req.body, (err, updatedAuthor) => {
      if (err) {
        err.type = "not-found";
        next(err);
      } else {
        res.json(updatedAuthor);
      }
    });
  } catch (err) {
    err.type = "bad-request";

    next(err);
  }
});

router.delete("/:id/", async (req, res, next) => {
  try {
    await connect();

    Author.findByIdAndRemove(req.params.id, (err, deletedAuthor) => {
      if (err) {
        err.type = "not-found";

        next(err);
      } else {
        res.json({ message: "success" });
      }
    });
  } catch (err) {
    err.type = "bad-request";

    next(err);
  }
});

module.exports = router;
