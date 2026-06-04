import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

import { addEditor } from "./addEditor";
import { removeEditor } from "./removeEditor";
import { useChartEditors } from "./useChartEditors";

type EditorListPanelProps = {
  chartId: string;
};

function formatCreatedAt(seconds: number | undefined) {
  if (seconds === undefined) {
    return "追加中";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000));
}

export function EditorListPanel({ chartId }: EditorListPanelProps) {
  const { editors, error, isLoading, reload } = useChartEditors(chartId);
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [removingEditorId, setRemovingEditorId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removeSuccess, setRemoveSuccess] = useState<string | null>(null);

  const handleAddEditor = async () => {
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);
    setRemoveError(null);
    setRemoveSuccess(null);

    try {
      const editorId = await addEditor(chartId, email);
      setEmail("");
      setAddSuccess(`${editorId} を編集者に追加しました。`);
      await reload();
    } catch (error) {
      setAddError(
        error instanceof Error
          ? error.message
          : "編集者の追加に失敗しました。",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveEditor = async (targetEmail: string) => {
    setRemovingEditorId(targetEmail);
    setAddError(null);
    setAddSuccess(null);
    setRemoveError(null);
    setRemoveSuccess(null);

    try {
      const editorId = await removeEditor(chartId, targetEmail);
      setRemoveSuccess(`${editorId} を編集者から削除しました。`);
      await reload();
    } catch (error) {
      setRemoveError(
        error instanceof Error
          ? error.message
          : "編集者の削除に失敗しました。",
      );
    } finally {
      setRemovingEditorId(null);
    }
  };

  return (
    <Box border="1px solid" borderColor="linen.300" borderRadius="lg" bg="linen.50" p={4}>
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="center">
          <Text fontWeight="bold" color="ink.900">
            編集者
          </Text>
          <Badge colorScheme="brand">{editors.length}/10</Badge>
        </HStack>

        <FormControl isDisabled={isAdding || editors.length >= 10}>
          <FormLabel fontSize="sm">編集者メールアドレス</FormLabel>
          <HStack align="start">
            <Input
              type="email"
              value={email}
              placeholder="editor@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              flexShrink={0}
              isDisabled={email.trim().length === 0}
              isLoading={isAdding}
              loadingText="追加中"
              onClick={() => void handleAddEditor()}
            >
              追加
            </Button>
          </HStack>
        </FormControl>

        {addSuccess ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{addSuccess}</AlertDescription>
          </Alert>
        ) : null}

        {addError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{addError}</AlertDescription>
          </Alert>
        ) : null}

        {removeSuccess ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{removeSuccess}</AlertDescription>
          </Alert>
        ) : null}

        {removeError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{removeError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading ? (
          <HStack color="ink.500">
            <Spinner size="sm" color="brand.500" />
            <Text fontSize="sm">編集者一覧を読み込んでいます。</Text>
          </HStack>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : editors.length === 0 ? (
          <Text color="ink.500" fontSize="sm">
            まだ編集者は追加されていません。
          </Text>
        ) : (
          <VStack align="stretch" spacing={2}>
            {editors.map((editor) => (
              <Box
                key={editor.id}
                border="1px solid"
                borderColor="linen.300"
                borderRadius="lg"
                bg="white"
                p={3}
              >
                <HStack justify="space-between" align="start" spacing={3}>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="semibold" wordBreak="break-all">
                      {editor.allowedEmail}
                    </Text>
                    <Text color="ink.500" fontSize="xs" mt={1}>
                      追加日時: {formatCreatedAt(editor.createdAt?.seconds)}
                    </Text>
                  </Box>
                  <Button
                    colorScheme="red"
                    flexShrink={0}
                    isLoading={removingEditorId === editor.id}
                    loadingText="削除中"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleRemoveEditor(editor.allowedEmail)}
                  >
                    削除
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
