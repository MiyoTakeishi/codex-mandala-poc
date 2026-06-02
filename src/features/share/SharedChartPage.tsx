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
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { MandalaChartGrid } from "../../components/chart/MandalaChartGrid";
import { useAuth } from "../auth/AuthProvider";
import { useSharedChartDetail } from "./useSharedChartDetail";
import { verifyEditorAccess } from "./verifyEditorAccess";

export function SharedChartPage() {
  const { token } = useParams();
  const {
    authError,
    clearAuthError,
    currentUser,
    isAuthLoading,
    signInWithGoogle,
  } = useAuth();
  const { detail, error, isLoading, setCellBody } = useSharedChartDetail(token);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isVerifyingEditor, setIsVerifyingEditor] = useState(false);
  const [editorAccessError, setEditorAccessError] = useState<string | null>(null);
  const canEdit = isEditorMode && Boolean(currentUser);

  const handleStartEditing = async () => {
    if (!token || !detail) {
      return;
    }

    setIsVerifyingEditor(true);
    setEditorAccessError(null);
    clearAuthError();

    try {
      if (!currentUser) {
        await signInWithGoogle();
      }

      const access = await verifyEditorAccess(token);

      if (access.chartId !== detail.chart.id) {
        throw new Error("招待リンクとチャートの対応が不正です。");
      }

      setIsEditorMode(true);
    } catch (verifyError) {
      setIsEditorMode(false);
      setEditorAccessError(
        verifyError instanceof Error
          ? verifyError.message
          : "編集権限の確認に失敗しました。",
      );
    } finally {
      setIsVerifyingEditor(false);
    }
  };

  const handleSavePermissionDenied = (message: string) => {
    setIsEditorMode(false);
    setEditorAccessError(`${message} ゲスト閲覧に戻りました。`);
  };

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
              招待リンクからの初期アクセスはゲスト閲覧です。編集する場合は権限確認が必要です。
            </AlertDescription>
          </Alert>

          {authError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription flex="1">{authError}</AlertDescription>
              <Button size="sm" variant="ghost" onClick={clearAuthError}>
                閉じる
              </Button>
            </Alert>
          ) : null}

          {editorAccessError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{editorAccessError}</AlertDescription>
            </Alert>
          ) : null}

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
                  <HStack
                    spacing={3}
                    align="center"
                    justify="space-between"
                    flexWrap="wrap"
                  >
                    <HStack spacing={3} align="center">
                      <Heading size="lg">{detail.chart.title}</Heading>
                      <Badge colorScheme={canEdit ? "green" : "gray"}>
                        {canEdit ? "編集中" : "ゲスト閲覧"}
                      </Badge>
                    </HStack>
                    {!canEdit ? (
                      <Button
                        colorScheme="teal"
                        isDisabled={isAuthLoading}
                        isLoading={isVerifyingEditor}
                        loadingText="確認中"
                        onClick={() => void handleStartEditing()}
                      >
                        編集する
                      </Button>
                    ) : null}
                  </HStack>
                  <Text color="gray.500" fontSize="sm" mt={1}>
                    ID: {detail.chart.id}
                  </Text>
                </Box>

                <MandalaChartGrid
                  chartId={detail.chart.id}
                  cells={detail.cells}
                  currentUserUid={currentUser?.uid}
                  isReadOnly={!canEdit}
                  onCellSaved={setCellBody}
                  onSavePermissionDenied={handleSavePermissionDenied}
                />
              </VStack>
            ) : null}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
