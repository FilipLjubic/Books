import {
  Button,
  Flex,
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
import React, { FC, useEffect, useState } from "react";
import { NavBar } from "../components/navbar";
import { Books } from "../types";
import { Helmet } from "react-helmet";

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

const Home: FC = () => {
  const [books, setBooks] = useState<Books>([]);
  const [selectedField, setSelectedField] = useState(queryTypes[0]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const response = await axios.get<Books>(`http://localhost:9001/books/`);

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
        `http://localhost:9001/books/?search=${searchValue}&type=${
          queryTypes.indexOf(selectedField) - 1
        }`
      );

      console.log(response.data);

      setBooks(response.data);
    } catch (error) {}
  };

  const booksToCsv = (books) => {
    console.log(books);
    const csvRows = [];
    for (let book of books) {
      for (let author of book["authors"]) {
        for (let genre of book["genres"]) {
          let { name, surname } = author;
          let csv = [
            book["_id"],
            book["title"],
            book["description"],
            book["published"],
            book["isbn"].toString(),
            book["originalLanguage"],
            name,
            surname,
            genre,
            book["country"],
            book["media_type"],
          ];
          csvRows.push(csv);
        }
      }
    }
    return csvRows.join("\n").toString();
  };

  let schema = JSON.stringify({
    "@context": {
      "@vocab": "http://schema.org",
      media_type: "encodingFormat",
      originalLanguage: "inLanguage",
      country: "countryOfOrigin",
      name: "givenName",
      surname: "familyName",
    },
    "@type": "Book",
    title: "Pride and Prejudice",
    description:
      "When Elizabeth Bennet first meets eligible bachelor Fitzwilliam Darcy, she thinks him arrogant and conceited; he is indifferent to her good looks and lively mind. When she later discovers that Darcy has involved himself in the troubled relationship between his friend Bingley and her beloved sister Jane, she is determined to dislike him more than ever. In the sparkling comedy of manners that follows, Jane Austen shows the folly of judging by first impressions and superbly evokes the friendships, gossip and snobberies of provincial middle-class life.",
    published: "1960-11-06T23:00:00.000+00:00",
    isbn: 9781784752637,
    genres: [
      "Novel",
      "Bildungsroman",
      "Southern Gothic",
      "Thriller",
      "Domestic Fiction",
      "Legal Story",
    ],
    originalLanguage: "English",
    authors: [{ "@type": "Person", name: "Jane", surname: "Austen" }],
    country: "United Kingdom",
    media_type: "Print",
  });

  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="Open source project with open data about books"
        />
        <meta name="title" content="Books" />
        <meta name="keywords" content="Books, book authors, isbn" />
        <meta name="author" content="Filip Ljubić" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      </Helmet>
      <NavBar />
      <Button onClick={() => {}} as="h4" size="md" ml={10} isTruncated>
        Osvježi preslike
      </Button>
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
