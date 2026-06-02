import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

import { deleteChart } from "./deleteChart";
import { useOwnerCharts } from "./useOwnerCharts";

type OwnerChartListProps = {
  ownerUid: string | undefined;
  selectedChartId: string | null;
  onOpenChart: (chartId: string) => void;
  onDeletedChart: (chartId: string) => void;
};

function formatUpdatedAt(seconds: number | undefined) {
  if (seconds === undefined) {
    return "更新中";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000));
}

export function OwnerChartList({
  onDeletedChart,
  onOpenChart,
  ownerUid,
  selectedChartId,
}: OwnerChartListProps) {
  const { charts, error, isLoading } = useOwnerCharts(ownerUid);
  const [deletingChartId, setDeletingChartId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleDeleteChart = async (chartId: string, title: string) => {
    const shouldDelete = window.confirm(
      `「${title}」を削除します。削除後は一覧と招待リンクから閲覧できなくなります。よろしいですか？`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingChartId(chartId);
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const deletedChartId = await deleteChart(chartId);
      setDeleteSuccess("チャートを削除しました。");
      onDeletedChart(deletedChartId);
    } catch (deleteChartError) {
      setDeleteError(
        deleteChartError instanceof Error
          ? deleteChartError.message
          : "チャートの削除に失敗しました。",
      );
    } finally {
      setDeletingChartId(null);
    }
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      p={{ base: 5, md: 8 }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <Heading size="md">作成したチャート</Heading>
          <Badge colorScheme="teal">{charts.length}/5</Badge>
        </HStack>

        {deleteSuccess ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{deleteSuccess}</AlertDescription>
          </Alert>
        ) : null}

        {deleteError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        ) : null}

        {!ownerUid ? (
          <Text color="gray.600">ログインすると作成したチャートを確認できます。</Text>
        ) : isLoading ? (
          <HStack color="gray.600">
            <Spinner size="sm" />
            <Text>チャート一覧を読み込んでいます。</Text>
          </HStack>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : charts.length === 0 ? (
          <Text color="gray.600">まだチャートがありません。</Text>
        ) : (
          <VStack align="stretch" spacing={3}>
            {charts.map((chart) => (
              <Box
                key={chart.id}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={4}
              >
                <HStack justify="space-between" align="start" spacing={4}>
                  <Box>
                    <Heading size="sm">{chart.title}</Heading>
                    <Text color="gray.600" fontSize="sm" mt={1}>
                      最終更新: {formatUpdatedAt(chart.updatedAt.seconds)}
                    </Text>
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      ID: {chart.id}
                    </Text>
                  </Box>
                  <HStack flexShrink={0}>
                    <Button
                      size="sm"
                      variant={selectedChartId === chart.id ? "solid" : "outline"}
                      colorScheme={selectedChartId === chart.id ? "teal" : undefined}
                      onClick={() => onOpenChart(chart.id)}
                    >
                      開く
                    </Button>
                    <Button
                      colorScheme="red"
                      isLoading={deletingChartId === chart.id}
                      loadingText="削除中"
                      size="sm"
                      variant="outline"
                      onClick={() => void handleDeleteChart(chart.id, chart.title)}
                    >
                      削除
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
