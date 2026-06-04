import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Navigate, useLocation } from "react-router-dom";

import { AppShell } from "../AppShell";
import { useAuth } from "../../features/auth/AuthProvider";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const {
    authError,
    clearAuthError,
    currentUser,
    isAuthLoading,
    signInWithGoogle,
  } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? "/charts";

  if (isAuthLoading) {
    return (
      <AppShell maxW="lg">
        <Box bg="linen.50" border="1px solid" borderColor="linen.300" p={8}>
          <Spinner color="brand.500" />
        </Box>
      </AppShell>
    );
  }

  if (currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AppShell maxW="lg">
      <Box
        bg="linen.50"
        border="1px solid"
        borderColor="linen.300"
        borderRadius="lg"
        boxShadow="card"
        p={8}
      >
        <VStack align="stretch" spacing={5}>
          <Box>
            <Text color="amber.500" fontSize="sm" fontWeight="bold">
              SIGN IN
            </Text>
            <Heading size="lg" color="ink.900" mt={1}>
              ログイン
            </Heading>
            <Text color="ink.500" mt={2}>
              Googleアカウントでログインしてください。
            </Text>
          </Box>

          {authError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription flex="1">{authError}</AlertDescription>
              <Button size="sm" variant="ghost" onClick={clearAuthError}>
                閉じる
              </Button>
            </Alert>
          ) : null}

          <Button onClick={() => void signInWithGoogle()}>
            Googleでログイン
          </Button>
        </VStack>
      </Box>
    </AppShell>
  );
}
