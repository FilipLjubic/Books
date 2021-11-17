import {
  Button,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Flex,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import axios from "axios";
import { NextPage } from "next";
import React, { FC, useEffect, useState } from "react";
import { Books } from "../types";

const queryTypes = [
  "Wildcard",
  "Title",
  "Author Name",
  "Author Surname",
  "Description",
  "Date Published",
  "ISBN",
  "Genre",
  "Language",
  "Country",
  "Media Type",
];

const BookTable: FC<Books> = ({ books }) => {
  return (
    <Table variant="striped" colorScheme="teal">
      <Thead>
        <Tr>
          <Th>Title</Th>
          <Th>Authors</Th>
          <Th>Desc</Th>
          <Th>Published</Th>
          <Th>ISBN</Th>
          <Th>Genres</Th>
          <Th>Language</Th>
          <Th>Country</Th>
          <Th>Media Type</Th>
        </Tr>
      </Thead>
      <Tbody>
        {books.map((book) => (
          <Tr key={book._id}>
            <Td>{book.title}</Td>
            <Td>
              {book.authors
                .map((author) => `${author.name} ${author.surname}`)
                .join(", ")}
            </Td>
            <Td isTruncated maxW="200px">
              {book.description}
            </Td>
            <Td>{book.published}</Td>
            <Td>{book.isbn}</Td>
            <Td maxW="200px">{book.genres.join(", ")}</Td>
            <Td>{book.originalLanguage}</Td>
            <Td>{book.country}</Td>
            <Td>{book.media_type}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const Home: NextPage = () => {
  const [books, setBooks] = useState<Books>([]);
  const [selectedField, setSelectedField] = useState(queryTypes[0]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const getInitialData = async () => {

      try {
        const response = await axios.get<Books>(`http://localhost:9001/`);

        setBooks(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    getInitialData();
  }, []);

  const search = async () => {

    try {
      const response = await axios.get<Books>(
        `http://localhost:9001/?search=${searchValue}&type=${
          queryTypes.indexOf(selectedField) - 1
        }`
      );

      console.log(response.data);

      setBooks(response.data);
    } catch (error) {
    } 
  };

  const booksToCsv = (books) => {
    console.log(books);
    const csvRows = [];
    for (let book of books){
      for (let author of book['authors']){
        for (let genre of book['genres']){
          let {name, surname} = author
          let csv = [book['_id'], book['title'], book['description'], book['published'],
                 book['isbn'].toString(), book['originalLanguage'], name, surname, genre, book['country'], book['media_type']]
          csvRows.push(csv)
        }
      }
    }
    return csvRows.join("\n").toString()
  }

  return (
    <>
      <head>
        <meta
          name="description"
          content="Open source project with open data about books"
        />
        <meta name="title" content="Books" />

        <meta name="keywords" content="Books, book authors, isbn" />
        <meta name="author" content="Filip Ljubić" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <Text>Download data:</Text>
      <Flex>
        <a href="/books.csv" download>
          <Button m="2">Download CSV file</Button>
        </a>
        <a
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            booksToCsv(books)
          )}`}
          download="books.csv"
        >
          <Button m="2">Download filtered CSV file</Button>
        </a>
      </Flex>
      <br />
      <Flex>
        <a href="/books.json" download>
          <Button m="2">Download JSON file</Button>
        </a>
        <a
          href={`data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(books)
          )}`}
          download="books.json"
        >
          <Button m="2">Download filtered JSON file</Button>
        </a>
      </Flex>

      <HStack spacing="4" p="4">
        <Select
          onChange={(e) => {
            setSelectedField(e.target.value);
          }}
        >
          {queryTypes.map((type) => (
            <option value={type} key={type}>
              {type}
            </option>
          ))}
        </Select>
        <Input
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          value={searchValue}
        />
        <Button onClick={search}>Submit</Button>
      </HStack>
      <BookTable books={books} />
    </>
  );
};

export default Home;
