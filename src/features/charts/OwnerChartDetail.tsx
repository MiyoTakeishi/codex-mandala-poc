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

import { MandalaChartGrid } from "../../components/chart/MandalaChartGrid";
import { ChartTitleEditor } from "./ChartTitleEditor";
import { useOwnerChartDetail } from "./useOwnerChartDetail";

type OwnerChartDetailProps = {
  chartId: string | null;
  onClose: () => void;
};

export function OwnerChartDetail({ chartId, onClose }: OwnerChartDetailProps) {
  const { detail, error, isLoading, setChartTitle } = useOwnerChartDetail(chartId);

  if (!chartId) {
    return null;
  }

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
          <Heading size="md">チャート詳細</Heading>
          <Button size="sm" variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </HStack>

        {isLoading ? (
          <HStack color="gray.600">
            <Spinner size="sm" />
            <Text>チャート詳細を読み込んでいます。</Text>
          </HStack>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : detail ? (
          <VStack align="stretch" spacing={4}>
            <Box>
              <HStack spacing={3} align="center">
                <Heading size="lg">{detail.chart.title}</Heading>
                <Badge colorScheme="teal">{detail.cells.length}セル</Badge>
              </HStack>
              <Text color="gray.500" fontSize="sm" mt={1}>
                ID: {detail.chart.id}
              </Text>
            </Box>
            <ChartTitleEditor
              chartId={detail.chart.id}
              title={detail.chart.title}
              onSaved={setChartTitle}
            />

            <MandalaChartGrid cells={detail.cells} />
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}
