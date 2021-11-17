require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CsvParser = require("json2csv").Parser;

const app = express();

app.use(cors());

const queryTypes = ['title', 'name', 'surname', 'description','published','isbn','genre', 'originalLanguage', 'country', 'media_type']

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
    country: String,
    media_type: String,
})

const Book = mongoose.model('Book', bookSchema);

const authorSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: String,
    surname: String
})

const Author = mongoose.model('Author', authorSchema)

app.get('/', async (req, res) => {
    const search = (req.query?.search ?? '').toLowerCase();

    const queryType = Number(req.query?.type ?? '-1');

    await connect();

    const isWildcardQuery = queryType < 0;


    // const query = isWildcardQuery ? queryTypes.map(queryType => ({
    //     [queryType]: {
    //         $regex: '^' + search,
    //         $options: 'i'
    //     }
    // })) : [{
    //     [queryTypes[queryType]]: {
    //         $regex: '^' + search,
    //         $options: 'i'
    //     }
    // }];


    const books = await Book.find({
        // $or: query
    }).populate('authors').select();

    let filteredBooks = [];
    if(search === ''){
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
                media_type
            } = book;
                if(isWildcardQuery){
    
                let pushed = false;
        
                if (title.toLowerCase().indexOf(search) > -1 || description.toLowerCase().indexOf(search) > -1 ||
                    published.toString().indexOf(search) > -1 || isbn.toString().indexOf(search) > -1 ||
                    originalLanguage.toLowerCase().indexOf(search) > -1 || country.indexOf(search) > -1 || media_type.toLowerCase().indexOf(search) > -1
                ) {
                    filteredBooks.push(book);
                   continue;
                }
    
                for(let author of authors){
                    let {name, surname} = author;
                    if(name.toLowerCase().indexOf(search) > -1 || surname.toLowerCase().indexOf(search) > -1){
                        filteredBooks.push(book);                    
                    pushed = true;
    
                    }
                }
                if(pushed){
                    continue;
                }
    
                for(let genre of genres){
                    if(genre.toLowerCase().indexOf(search) > -1 ){
                        filteredBooks.push(book);
                    }
                }
            } else {
                const type = queryTypes[queryType];
                
                if(type === 'genre'){
                    for(let genre of genres){
                        if(genre.toLowerCase().indexOf(search) > -1 ){
                            filteredBooks.push(book);
                        }
                    }   
                } else if (type === 'name' || type == 'surname'){
                    for(let author of authors){
                        let {name, surname} = author;
                        if(name.toLowerCase().indexOf(search) > -1 || surname.toLowerCase().indexOf(search) > -1){
                            filteredBooks.push(book);                    
        
                        }
                    }
                } else {
                    if(typeof book[type] === 'String'){

                        if(book[type].toLowerCase().indexOf(search) > -1){
                            filteredBooks.push(book);
                        }
                    } else {
                        if(book[type].toString().toLowerCase().indexOf(search) > -1){
                            filteredBooks.push(book);
                        }
                    }
                }
            }
            }
    }

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
    return res.json(filteredBooks);
})

app.listen(PORT, () => console.log(`server running on port ${PORT}`));