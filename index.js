require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CsvParser = require("json2csv").Parser;

const app = express();

app.use(cors());

const queryTypes = ['title', 'description',  'originalLanguage', 'country']

const PORT = process.env.PORT || 9001;

const connect = async () => {
    return await mongoose.connect(process.env.MONGODB_URI);
}

const bookSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: String,
    authors: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Author'
    }],
    description: String,
    published: Date,
    isbn: String,
    genres: [String],
    originalLanguage: String,
    country: String
})

const Book = mongoose.model('Book', bookSchema);

const authorSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: String,
    surname: String
})

const Author = mongoose.model('Author', authorSchema)

app.get('/', async (req, res) => {
    const search = req.query?.search ?? '';

    const queryType = Number(req.query?.type ?? '-1');

    await connect();

    const isWildcardQuery = queryType < 0;
  

    const query = isWildcardQuery ? queryTypes.map(queryType => ({
        [queryType]: {
            $regex: '^' + search,
            $options: 'i'
        }
    })) : [{
        [queryTypes[queryType]]: {
            $regex: '^' + search,
            $options: 'i'
        }
    }];


    const books = await Book.find({
        $or: query
    }).populate('authors').select();

    // idk lol, mozda umjesto ovaj $or samo ic po svim responseovima i filtrirati slicno kao u ovom forEachu
    // 
    // let tutorials = [];
    
    // books.forEach((book) => {
    //   const { _id, title, description, originalLanguage, country } = book;
    //   tutorials.push({ id, title, description, originalLanguage, country });
    // });
    // res.setHeader("Content-Type", "text/csv");
    // res.setHeader("Content-Disposition", "attachment; filename=tutorials.csv");

    // res.status(200).end(csvData);
    return res.json(books);
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`));