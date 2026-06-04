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
    <Box
      minH="100vh"
      bg="linen.100"
      color="ink.900"
      backgroundImage="linear-gradient(180deg, rgba(255, 255, 252, 0.96) 0%, rgba(247, 247, 244, 0.98) 48%, rgba(241, 241, 236, 1) 100%)"
    >
      <Container maxW={maxW} py={{ base: 8, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          <HStack
            as="header"
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
            bg="rgba(255, 255, 252, 0.88)"
            border="1px solid"
            borderColor="linen.300"
            borderRadius="lg"
            boxShadow="card"
            px={{ base: 4, md: 5 }}
            py={3}
          >
            <Heading
              as={RouterLink}
              to="/charts"
              color="ink.900"
              fontSize={{ base: "lg", md: "xl" }}
              letterSpacing="0"
            >
              マンダラチャート
            </Heading>
            <HStack
              spacing={2}
              order={{ base: 3, md: 2 }}
              w={{ base: "100%", md: "auto" }}
            >
              <Button as={RouterLink} to="/charts" size="sm" variant="ghost">
                チャート
              </Button>
              <Button as={RouterLink} to="/guide" size="sm" variant="ghost">
                使い方
              </Button>
            </HStack>
            {isAuthLoading ? (
              <Spinner color="brand.500" />
            ) : currentUser ? (
              <HStack spacing={3}>
                <Avatar
                  name={currentUser.displayName ?? currentUser.email ?? undefined}
                  src={currentUser.photoURL ?? undefined}
                  size="sm"
                  border="2px solid"
                  borderColor="linen.50"
                />
                <Box display={{ base: "none", md: "block" }}>
                  <Text fontSize="sm" fontWeight="bold" color="ink.900">
                    {currentUser.displayName ?? "ログイン中"}
                  </Text>
                  <Text fontSize="xs" color="ink.500">
                    {currentUser.email}
                  </Text>
                </Box>
                <Button variant="outline" onClick={() => void logout()}>
                  ログアウト
                </Button>
              </HStack>
            ) : (
              <Button as={RouterLink} to="/login">
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
