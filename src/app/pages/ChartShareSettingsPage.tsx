import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Link as RouterLink,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { AppShell } from "../AppShell";
import { useAuth } from "../../features/auth/AuthProvider";
import { useOwnerChartDetail } from "../../features/charts/useOwnerChartDetail";
import { ShareLinkPanel } from "../../features/share/ShareLinkPanel";

export function ChartShareSettingsPage() {
  const { chartId } = useParams();
  const { currentUser, isAuthLoading } = useAuth();
  const location = useLocation();
  const { detail, error, isLoading, setInviteToken } = useOwnerChartDetail(
    chartId ?? null,
  );

  if (isAuthLoading) {
    return (
      <AppShell>
        <Spinner color="teal.500" />
      </AppShell>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppShell>
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={{ base: 5, md: 8 }}
      >
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="center">
            <Heading size="md">共有設定</Heading>
            <Button as={RouterLink} to={`/charts/${chartId}`} size="sm" variant="outline">
              チャートへ戻る
            </Button>
          </HStack>

          {isLoading ? (
            <HStack color="gray.600">
              <Spinner size="sm" />
              <Text>共有設定を読み込んでいます。</Text>
            </HStack>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : detail ? (
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="lg">{detail.chart.title}</Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  ID: {detail.chart.id}
                </Text>
              </Box>
              <ShareLinkPanel
                chartId={detail.chart.id}
                inviteToken={detail.chart.inviteToken}
                onInviteTokenIssued={setInviteToken}
              />
            </VStack>
          ) : null}
        </VStack>
      </Box>
    </AppShell>
  );
}
