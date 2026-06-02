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

import { useOwnerCharts } from "./useOwnerCharts";

type OwnerChartListProps = {
  ownerUid: string | undefined;
  selectedChartId: string | null;
  onOpenChart: (chartId: string) => void;
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
  onOpenChart,
  ownerUid,
  selectedChartId,
}: OwnerChartListProps) {
  const { charts, error, isLoading } = useOwnerCharts(ownerUid);

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
                  <Button
                    size="sm"
                    variant={selectedChartId === chart.id ? "solid" : "outline"}
                    colorScheme={selectedChartId === chart.id ? "teal" : undefined}
                    onClick={() => onOpenChart(chart.id)}
                  >
                    開く
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
