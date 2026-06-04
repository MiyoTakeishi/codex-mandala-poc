import {
  Avatar,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  type ContainerProps,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../features/auth/AuthProvider";

type AppShellProps = {
  children: ReactNode;
  maxW?: ContainerProps["maxW"];
};

export function AppShell({ children, maxW = "6xl" }: AppShellProps) {
  const { currentUser, isAuthLoading, logout } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50" color="gray.900">
      <Container maxW={maxW} py={{ base: 8, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          <HStack justify="space-between" align="center">
            <Heading as={RouterLink} to="/charts" size="md">
              マンダラチャート
            </Heading>
            {isAuthLoading ? (
              <Spinner color="teal.500" />
            ) : currentUser ? (
              <HStack spacing={3}>
                <Avatar
                  name={currentUser.displayName ?? currentUser.email ?? undefined}
                  src={currentUser.photoURL ?? undefined}
                  size="sm"
                />
                <Box display={{ base: "none", md: "block" }}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {currentUser.displayName ?? "ログイン中"}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {currentUser.email}
                  </Text>
                </Box>
                <Button variant="outline" onClick={() => void logout()}>
                  ログアウト
                </Button>
              </HStack>
            ) : (
              <Button as={RouterLink} to="/login" colorScheme="teal">
                Googleでログイン
              </Button>
            )}
          </HStack>
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
