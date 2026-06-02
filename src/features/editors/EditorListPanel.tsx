import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

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
  const { editors, error, isLoading } = useChartEditors(chartId);

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="center">
          <Text fontWeight="semibold">編集者</Text>
          <Badge colorScheme="teal">{editors.length}/10</Badge>
        </HStack>

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
