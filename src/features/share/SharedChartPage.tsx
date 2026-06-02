import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { MandalaChartGrid } from "../../components/chart/MandalaChartGrid";
import { useSharedChartDetail } from "./useSharedChartDetail";

export function SharedChartPage() {
  const { token } = useParams();
  const { detail, error, isLoading } = useSharedChartDetail(token);

  return (
    <Box minH="100vh" bg="gray.50" color="gray.900">
      <Container maxW="6xl" py={{ base: 8, md: 12 }}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" align="center">
            <Heading size="md">共有マンダラチャート</Heading>
            <Button as={RouterLink} to="/" variant="outline">
              ホームへ
            </Button>
          </HStack>

          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              招待リンクからの初期アクセスはゲスト閲覧です。編集操作はできません。
            </AlertDescription>
          </Alert>

          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={{ base: 5, md: 8 }}
          >
            {isLoading ? (
              <HStack color="gray.600">
                <Spinner size="sm" />
                <Text>共有チャートを読み込んでいます。</Text>
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
                    <Badge colorScheme="gray">ゲスト閲覧</Badge>
                  </HStack>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    ID: {detail.chart.id}
                  </Text>
                </Box>

                <MandalaChartGrid
                  chartId={detail.chart.id}
                  cells={detail.cells}
                  isReadOnly
                />
              </VStack>
            ) : null}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
