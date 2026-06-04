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
  currentUserUid: string | undefined;
  onClose: () => void;
  onOpenShare: () => void;
};

export function OwnerChartDetail({
  chartId,
  currentUserUid,
  onClose,
  onOpenShare,
}: OwnerChartDetailProps) {
  const { detail, error, isLoading, setCellBody, setChartTitle } =
    useOwnerChartDetail(chartId);

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
          <HStack>
            <Button size="sm" colorScheme="teal" onClick={onOpenShare}>
              共有設定
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              一覧へ戻る
            </Button>
          </HStack>
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

            {currentUserUid ? (
              <MandalaChartGrid
                chartId={detail.chart.id}
                cells={detail.cells}
                currentUserUid={currentUserUid}
                onCellSaved={setCellBody}
              />
            ) : null}
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}
