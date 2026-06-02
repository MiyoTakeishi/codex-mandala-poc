import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { useAuth } from "../features/auth/AuthProvider";
import { createChart } from "../features/charts/createChart";
import { OwnerChartDetail } from "../features/charts/OwnerChartDetail";
import { OwnerChartList } from "../features/charts/OwnerChartList";
import { SharedChartPage } from "../features/share/SharedChartPage";

function OwnerHomePage() {
  const {
    authError,
    clearAuthError,
    currentUser,
    isAuthLoading,
    logout,
    signInWithGoogle,
  } = useAuth();
  const [chartTitle, setChartTitle] = useState("");
  const [isCreatingChart, setIsCreatingChart] = useState(false);
  const [chartCreateError, setChartCreateError] = useState<string | null>(null);
  const [createdChartId, setCreatedChartId] = useState<string | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  const handleCreateChart = async () => {
    setIsCreatingChart(true);
    setChartCreateError(null);
    setCreatedChartId(null);

    try {
      const chartId = await createChart(chartTitle);
      setCreatedChartId(chartId);
      setSelectedChartId(chartId);
      setChartTitle("");
    } catch (error) {
      setChartCreateError(
        error instanceof Error
          ? error.message
          : "チャートの作成に失敗しました。",
      );
    } finally {
      setIsCreatingChart(false);
    }
  };

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
                ログイン後、9x9のマンダラチャートを新規作成できます。
              </Text>
              <FormControl maxW="lg" isDisabled={!currentUser || isCreatingChart}>
                <FormLabel>チャートタイトル</FormLabel>
                <Input
                  value={chartTitle}
                  maxLength={80}
                  placeholder="例: 今年達成したいこと"
                  onChange={(event) => setChartTitle(event.target.value)}
                />
              </FormControl>
              <Button
                colorScheme="teal"
                isDisabled={!currentUser || isAuthLoading}
                isLoading={isCreatingChart}
                loadingText="作成中"
                onClick={handleCreateChart}
              >
                チャートを作成
              </Button>
              {!currentUser && !isAuthLoading ? (
                <Text fontSize="sm" color="gray.600">
                  チャート作成にはGoogleログインが必要です。
                </Text>
              ) : null}
              {createdChartId ? (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    チャートを作成しました。ID: {createdChartId}
                  </AlertDescription>
                </Alert>
              ) : null}
              {chartCreateError ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{chartCreateError}</AlertDescription>
                </Alert>
              ) : null}
            </VStack>
          </Box>
          <OwnerChartList
            ownerUid={currentUser?.uid}
            selectedChartId={selectedChartId}
            onOpenChart={setSelectedChartId}
          />
          <OwnerChartDetail
            chartId={selectedChartId}
            currentUserUid={currentUser?.uid}
            onClose={() => setSelectedChartId(null)}
          />
        </VStack>
      </Container>
    </Box>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<OwnerHomePage />} />
      <Route path="/share/:token" element={<SharedChartPage />} />
    </Routes>
  );
}
