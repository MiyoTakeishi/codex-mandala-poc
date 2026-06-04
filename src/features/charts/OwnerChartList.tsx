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

import { AppIcon } from "../../components/ui/AppIcon";
import { deleteChart } from "./deleteChart";
import { useOwnerCharts } from "./useOwnerCharts";

type OwnerChartListProps = {
  ownerUid: string | undefined;
  selectedChartId?: string | null;
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
      bg="linen.50"
      border="1px solid"
      borderColor="linen.300"
      borderRadius="lg"
      boxShadow="card"
      p={{ base: 5, md: 8 }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <Heading size="md" color="ink.900">
            作成したチャート
          </Heading>
          <Badge colorScheme="brand">{charts.length}/5</Badge>
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
          <Text color="ink.500">ログインすると作成したチャートを確認できます。</Text>
        ) : isLoading ? (
          <HStack color="ink.500">
            <Spinner size="sm" color="brand.500" />
            <Text>チャート一覧を読み込んでいます。</Text>
          </HStack>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : charts.length === 0 ? (
          <Text color="ink.500">まだチャートがありません。</Text>
        ) : (
          <VStack align="stretch" spacing={3}>
            {charts.map((chart) => (
              <Box
                key={chart.id}
                border="1px solid"
                borderColor="linen.300"
                borderRadius="lg"
                bg="white"
                p={4}
                transition="border-color 0.15s ease, box-shadow 0.15s ease"
                _hover={{
                  borderColor: "brand.200",
                  boxShadow: "0 8px 22px rgba(24, 33, 31, 0.06)",
                }}
              >
                <HStack justify="space-between" align="start" spacing={4}>
                  <Box>
                    <Heading size="sm" color="ink.900">
                      {chart.title}
                    </Heading>
                    <Text color="ink.500" fontSize="sm" mt={1}>
                      最終更新: {formatUpdatedAt(chart.updatedAt.seconds)}
                    </Text>
                    <Text color="ink.400" fontSize="xs" mt={1}>
                      ID: {chart.id}
                    </Text>
                  </Box>
                  <HStack flexShrink={0}>
                    <Button
                      leftIcon={<AppIcon name="externalLink" />}
                      size="sm"
                      variant={selectedChartId === chart.id ? "solid" : "outline"}
                      onClick={() => onOpenChart(chart.id)}
                    >
                      開く
                    </Button>
                    <Button
                      colorScheme="red"
                      isLoading={deletingChartId === chart.id}
                      leftIcon={<AppIcon name="trash" />}
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
