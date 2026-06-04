import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { AppShell } from "../AppShell";
import { AppIcon } from "../../components/ui/AppIcon";
import { useAuth } from "../../features/auth/AuthProvider";
import { createChart } from "../../features/charts/createChart";
import { OwnerChartList } from "../../features/charts/OwnerChartList";

export function ChartListPage() {
  const { currentUser, isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [chartTitle, setChartTitle] = useState("");
  const [isCreatingChart, setIsCreatingChart] = useState(false);
  const [chartCreateError, setChartCreateError] = useState<string | null>(null);
  const [createdChartId, setCreatedChartId] = useState<string | null>(null);

  if (isAuthLoading) {
    return (
      <AppShell>
        <Spinner color="brand.500" />
      </AppShell>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const handleCreateChart = async () => {
    setIsCreatingChart(true);
    setChartCreateError(null);
    setCreatedChartId(null);

    try {
      const chartId = await createChart(chartTitle);
      setCreatedChartId(chartId);
      setChartTitle("");
      navigate(`/charts/${chartId}`);
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
    <AppShell>
      <Box
        bg="linen.50"
        border="1px solid"
        borderColor="linen.300"
        borderRadius="lg"
        boxShadow="card"
        p={{ base: 5, md: 8 }}
      >
        <VStack align="start" spacing={4}>
          <Box>
            <Text color="amber.500" fontSize="sm" fontWeight="bold">
              FOCUS PLANNING
            </Text>
            <Heading size="lg" color="ink.900" mt={1}>
              共有できる9x9チャートを作成する
            </Heading>
          </Box>
          <Text color="ink.500">
            9x9のマンダラチャートを新規作成できます。
          </Text>
          <FormControl maxW="lg" isDisabled={isCreatingChart}>
            <FormLabel>チャートタイトル</FormLabel>
            <Input
              value={chartTitle}
              maxLength={80}
              placeholder="例: 今年達成したいこと"
              onChange={(event) => setChartTitle(event.target.value)}
            />
          </FormControl>
          <Button
            leftIcon={<AppIcon name="plus" />}
            isLoading={isCreatingChart}
            loadingText="作成中"
            onClick={() => void handleCreateChart()}
          >
            チャートを作成
          </Button>
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
        ownerUid={currentUser.uid}
        onDeletedChart={() => undefined}
        onOpenChart={(chartId) => navigate(`/charts/${chartId}`)}
      />
    </AppShell>
  );
}
