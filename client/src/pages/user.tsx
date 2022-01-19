import { useUser } from "@auth0/nextjs-auth0";
import { Avatar, Flex, Text, VStack } from "@chakra-ui/react";
import React, { FC } from "react";
import { NavBar } from "../components/navbar";

interface Usr {
  email_verified: boolean;
  name: string;
  nickname: string;
  email: string;
  picture: string;
  updated_at: string;
}

export const ProfileBody: FC = () => {
  const { user } = useUser();

  return (
    <Flex direction="column">
      <NavBar></NavBar>
      <Flex bg="white" align="center" p="3" mb="3">
        {user ? (
          <>
            <Avatar boxSize="16" src={user.picture} />
            <VStack align="start" ml="3" spacing="0">
              <Text fontSize="xl" fontWeight="bold">
                Name: {user.name}
              </Text>
              <Text fontSize="xl">Nickname: {user.nickname}</Text>
              <Text fontSize="md" color="gray.400">
                Email: {user.email} (Verified: {user.email_verified.toString()})
              </Text>
              <Text fontSize="sm" color="gray.300">
                Updated at: {user.updated_at}
              </Text>
            </VStack>
          </>
        ) : (
          <Text>error: not logged in</Text>
        )}
      </Flex>
    </Flex>
  );
};

export default ProfileBody;
