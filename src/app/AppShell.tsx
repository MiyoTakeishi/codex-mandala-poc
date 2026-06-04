import {
  Avatar,
  Box,
  Button,
  Container,
  HStack,
  Spinner,
  Text,
  VStack,
  type ContainerProps,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { ServiceLogo } from "../components/brand/ServiceLogo";
import { AppIcon } from "../components/ui/AppIcon";
import { useAuth } from "../features/auth/AuthProvider";

type AppShellProps = {
  children: ReactNode;
  maxW?: ContainerProps["maxW"];
};

export function AppShell({ children, maxW = "6xl" }: AppShellProps) {
  const { currentUser, isAuthLoading, logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <Box
      minH="100vh"
      bg="linen.100"
      color="ink.900"
      backgroundImage="linear-gradient(180deg, rgba(255, 255, 252, 0.96) 0%, rgba(247, 247, 244, 0.98) 48%, rgba(241, 241, 236, 1) 100%)"
    >
      <Container maxW={maxW} py={{ base: 8, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          <HStack align="stretch" flexWrap="wrap" spacing={3}>
            <HStack
              as="header"
              flex={{ base: "1 0 100%", lg: "1 1 0" }}
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
              <ServiceLogo />
              <HStack
                spacing={2}
                order={{ base: 3, md: 2 }}
                w={{ base: "100%", md: "auto" }}
              >
                {currentUser ? (
                  <Button
                    as={RouterLink}
                    leftIcon={<AppIcon name="edit" />}
                    size="sm"
                    to="/charts"
                    variant="ghost"
                  >
                    チャート
                  </Button>
                ) : null}
                <Button
                  as={RouterLink}
                  leftIcon={<AppIcon name="bookOpen" />}
                  size="sm"
                  to="/guide"
                  variant="ghost"
                >
                  使い方
                </Button>
              </HStack>
              {isAuthLoading ? (
                <Spinner color="brand.500" />
              ) : currentUser || isLoginPage ? null : (
                <Button as={RouterLink} leftIcon={<AppIcon name="logIn" />} to="/login">
                  Googleでログイン
                </Button>
              )}
            </HStack>

            {currentUser ? (
              <HStack
                align="center"
                bg="rgba(255, 255, 252, 0.72)"
                border="1px solid"
                borderColor="linen.300"
                borderRadius="md"
                justify="space-between"
                px={4}
                py={3}
                spacing={3}
                w={{ base: "100%", lg: "360px" }}
              >
                <HStack minW={0} spacing={3}>
                  <Avatar
                    name={currentUser.displayName ?? currentUser.email ?? undefined}
                    src={currentUser.photoURL ?? undefined}
                    size="sm"
                    border="2px solid"
                    borderColor="linen.50"
                    flexShrink={0}
                  />
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="bold" color="ink.900" noOfLines={1}>
                      {currentUser.displayName ?? "ログイン中"}
                    </Text>
                    <Text color="ink.500" fontSize="xs" noOfLines={1}>
                      {currentUser.email}
                    </Text>
                  </Box>
                </HStack>
                <Button
                  flexShrink={0}
                  leftIcon={<AppIcon name="logOut" />}
                  size="sm"
                  variant="outline"
                  onClick={() => void logout()}
                >
                  ログアウト
                </Button>
              </HStack>
            ) : null}
          </HStack>
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
