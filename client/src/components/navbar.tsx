import { useUser } from "@auth0/nextjs-auth0";
import {
  Button,
  Flex,
  Heading,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { FC } from "react";

export const NavBar: FC = ({ children }) => {
  const { user } = useUser();

  return (
    <Flex
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.600", "white")}
      minH="60px"
      py={{ base: "2" }}
      px={{ base: "4" }}
      borderBottom="1"
      borderStyle={"solid"}
      borderColor={useColorModeValue("gray.200", "gray.900")}
      align="center"
    >
      <Link href="/">
        <Heading>Books</Heading>
      </Link>
      <Link href="/user">
        <Heading as="h4" size="lm" ml={10} isTruncated>
          Profil
        </Heading>
      </Link>

      {user ? (
        <Link href="/api/auth/logout" position="absolute" right="3%">
          <Button as="h4" size="md" ml={10} isTruncated>
            Odjava
          </Button>
        </Link>
      ) : (
        <Link href="/api/auth/login" position="absolute" right="3%">
          <Button as="h4" size="md" ml={10} isTruncated>
            Prijava
          </Button>
        </Link>
      )}
    </Flex>
  );
};
