import {
  Button,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
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

const queryTypes = ["Wildcard", "Title", "Description", "Language", "Country"];

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
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const Home: NextPage = () => {
  const [books, setBooks] = useState<Books>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(queryTypes[0]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const getInitialData = async () => {
      setLoading(true);

      try {
        const response = await axios.get<Books>(`http://localhost:9001/`);

        setBooks(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getInitialData();
  }, []);

  const search = async () => {
    setLoading(true);

    try {
      const response = await axios.get<Books>(
        `http://localhost:9001/?search=${searchValue}&type=${
          queryTypes.indexOf(selectedField) - 1
        }`
      );

      console.log(response.data);

      setBooks(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

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
      <Text>Download data:</Text>
      <a href="/books.csv" download>
        <Button m="2">Download CSV file</Button>
      </a>
      <br />
      <a href="/books.json" download>
        <Button m="2">Download JSON file</Button>
      </a>
    </>
  );
};

export default Home;
