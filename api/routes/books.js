const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const connect = async () => {
  return await mongoose.connect(process.env.MONGODB_URI);
};

const queryTypes = [
  "title",
  "name",
  "surname",
  "description",
  "published",
  "isbn",
  "genre",
  "originalLanguage",
  "country",
  "media_type",
];
const bookSchema = new mongoose.Schema({
  title: String,
  authors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Author",
    },
  ],
  description: String,
  published: Date,
  isbn: String,
  genres: [String],
  originalLanguage: String,
  country: String,
  media_type: String,
});

const Book = mongoose.model("Book", bookSchema);

router.get("/", async (req, res, next) => {
  const search = (req.query?.search ?? "").toLowerCase();

  const queryType = Number(req.query?.type ?? "-1");

  try {
    await connect();

    let filteredBooks = await getFilteredBooks(search, queryType);

    return res.json(filteredBooks);
  } catch (err) {
    err.type = "not-found";
    next();
  }
});

router.get("/:id/", async (req, res, next) => {
  try {
    await connect();

    const books = await Book.findById(req.params.id)
      .populate("authors")
      .select();

    return res.json(books);
  } catch (err) {
    err.type = "not-found";
    next(err);
  }
});

router.get("/:id/authors/", async (req, res, next) => {
  try {
    await connect();

    const authors = (
      await Book.findById(req.params.id).populate("authors").select()
    ).authors;

    return res.json(authors);
  } catch (err) {
    err.type = "not-found";
    next(err);
  }
});

const getFilteredBooks = async (search, queryType) => {
  const isWildcardQuery = queryType < 0;

  const books = await Book.find({}).populate("authors").select();

  let filteredBooks = filterBooks(books, search, isWildcardQuery, queryType);

  return filteredBooks;
};

const filterBooks = (books, search, isWildcardQuery, queryType) => {
  let filteredBooks = [];

  if (search === "") {
    filteredBooks = books;
  } else {
    for (let book of books) {
      let {
        title,
        description,
        published,
        isbn,
        genres,
        originalLanguage,
        authors,
        country,
        media_type,
      } = book;
      if (isWildcardQuery) {
        let pushed = false;

        if (
          title.toLowerCase().indexOf(search) > -1 ||
          description.toLowerCase().indexOf(search) > -1 ||
          published.toString().indexOf(search) > -1 ||
          isbn.toString().indexOf(search) > -1 ||
          originalLanguage.toLowerCase().indexOf(search) > -1 ||
          country.indexOf(search) > -1 ||
          media_type.toLowerCase().indexOf(search) > -1
        ) {
          filteredBooks.push(book);
          continue;
        }

        for (let author of authors) {
          let { name, surname } = author;
          if (
            name.toLowerCase().indexOf(search) > -1 ||
            surname.toLowerCase().indexOf(search) > -1
          ) {
            filteredBooks.push(book);
            pushed = true;
          }
        }
        if (pushed) {
          continue;
        }

        for (let genre of genres) {
          if (genre.toLowerCase().indexOf(search) > -1) {
            filteredBooks.push(book);
          }
        }
      } else {
        const type = queryTypes[queryType];

        if (type === "genre") {
          for (let genre of genres) {
            if (genre.toLowerCase().indexOf(search) > -1) {
              filteredBooks.push(book);
            }
          }
        } else if (type === "name" || type == "surname") {
          for (let author of authors) {
            let { name, surname } = author;
            if (
              name.toLowerCase().indexOf(search) > -1 ||
              surname.toLowerCase().indexOf(search) > -1
            ) {
              filteredBooks.push(book);
            }
          }
        } else {
          if (typeof book[type] === "String") {
            if (book[type].toLowerCase().indexOf(search) > -1) {
              filteredBooks.push(book);
            }
          } else {
            if (book[type].toString().toLowerCase().indexOf(search) > -1) {
              filteredBooks.push(book);
            }
          }
        }
      }
    }
  }
  return filteredBooks;
};

module.exports = router;
