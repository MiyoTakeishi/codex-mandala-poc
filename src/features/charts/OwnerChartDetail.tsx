import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

import { useOwnerChartDetail } from "./useOwnerChartDetail";

type OwnerChartDetailProps = {
  chartId: string | null;
  onClose: () => void;
};

export function OwnerChartDetail({ chartId, onClose }: OwnerChartDetailProps) {
  const { detail, error, isLoading } = useOwnerChartDetail(chartId);

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

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
              {detail.cells.slice(0, 9).map((cell) => (
                <Box
                  key={cell.id}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  minH="72px"
                  p={3}
                >
                  <Text fontSize="xs" color="gray.500">
                    {cell.id} / row {cell.rowIndex + 1}, col {cell.colIndex + 1}
                  </Text>
                  <Text mt={2}>{cell.body || "未入力"}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}
