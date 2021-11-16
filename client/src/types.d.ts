import { ObjectId } from "mongoose";

export interface Book {
  _id: ObjectId;
  title: string;
  authors: Author[];
  description: string;
  published: Date;
  isbn: string;
  genres: string[];
  originalLanguage: string;
  country: string;
}

export interface Author {
  _id: ObjectId;
  name: string;
  surname: string;
}

export type Books = Book[];
