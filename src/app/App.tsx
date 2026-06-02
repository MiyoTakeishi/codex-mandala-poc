import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useAuth } from "../features/auth/AuthProvider";

export function App() {
  const {
    authError,
    clearAuthError,
    currentUser,
    isAuthLoading,
    logout,
    signInWithGoogle,
  } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50" color="gray.900">
      <Container maxW="6xl" py={{ base: 8, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          <HStack justify="space-between" align="center">
            <Heading size="md">マンダラチャート</Heading>
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
                <Button variant="outline" onClick={logout}>
                  ログアウト
                </Button>
              </HStack>
            ) : (
              <Button colorScheme="teal" onClick={signInWithGoogle}>
                Googleでログイン
              </Button>
            )}
          </HStack>

          {authError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription flex="1">{authError}</AlertDescription>
              <Button size="sm" variant="ghost" onClick={clearAuthError}>
                閉じる
              </Button>
            </Alert>
          ) : null}

          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={{ base: 5, md: 8 }}
          >
            <VStack align="start" spacing={4}>
              <Heading size="lg">共有できる9x9チャートを作成する</Heading>
              <Text color="gray.600">
                Googleログインでアプリに入り、次のフェーズでユーザー情報をFirestoreへ保存します。
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
