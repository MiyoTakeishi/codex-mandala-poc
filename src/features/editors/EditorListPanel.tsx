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

  const handleAddEditor = async () => {
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);

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

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="center">
          <Text fontWeight="semibold">編集者</Text>
          <Badge colorScheme="teal">{editors.length}/10</Badge>
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
              colorScheme="teal"
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

        {isLoading ? (
          <HStack color="gray.600">
            <Spinner size="sm" />
            <Text fontSize="sm">編集者一覧を読み込んでいます。</Text>
          </HStack>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : editors.length === 0 ? (
          <Text color="gray.600" fontSize="sm">
            まだ編集者は追加されていません。
          </Text>
        ) : (
          <VStack align="stretch" spacing={2}>
            {editors.map((editor) => (
              <Box
                key={editor.id}
                border="1px solid"
                borderColor="gray.100"
                borderRadius="md"
                p={3}
              >
                <Text fontSize="sm" fontWeight="semibold">
                  {editor.allowedEmail}
                </Text>
                <Text color="gray.500" fontSize="xs" mt={1}>
                  追加日時: {formatCreatedAt(editor.createdAt?.seconds)}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
