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
import { ChartImageDownloadButton } from "../export/ChartImageDownloadButton";
import { useChartEditors } from "../editors/useChartEditors";
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
  const {
    editors,
    error: editorsError,
    isLoading: isLoadingEditors,
  } = useChartEditors(chartId);

  if (!chartId) {
    return null;
  }

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
            チャート詳細
          </Heading>
          <HStack>
            <Button size="sm" onClick={onOpenShare}>
              共有設定
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              一覧へ戻る
            </Button>
          </HStack>
        </HStack>

        {isLoading ? (
          <HStack color="ink.500">
            <Spinner size="sm" color="brand.500" />
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
                <Heading size="lg" color="ink.900">
                  {detail.chart.title}
                </Heading>
                <Badge colorScheme="brand">{detail.cells.length}セル</Badge>
              </HStack>
              <Text color="ink.500" fontSize="sm" mt={1}>
                ID: {detail.chart.id}
              </Text>
              {editorsError ? (
                <Text color="red.600" fontSize="sm" mt={2}>
                  画像に含める編集者一覧を取得できませんでした。
                </Text>
              ) : null}
            </Box>
            <HStack>
              <ChartImageDownloadButton
                cells={detail.cells}
                chart={detail.chart}
                editors={editors}
                isDisabled={isLoadingEditors || Boolean(editorsError)}
              />
            </HStack>
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
