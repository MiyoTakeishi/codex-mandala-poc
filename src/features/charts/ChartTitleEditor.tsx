import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { updateChartTitle } from "./updateChartTitle";

type ChartTitleEditorProps = {
  chartId: string;
  title: string;
  onSaved: (title: string) => void;
};

export function ChartTitleEditor({
  chartId,
  onSaved,
  title,
}: ChartTitleEditorProps) {
  const [draftTitle, setDraftTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftTitle(title);
    setError(null);
    setSavedMessage(null);
  }, [chartId, title]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const savedTitle = await updateChartTitle(chartId, draftTitle);
      setDraftTitle(savedTitle);
      onSaved(savedTitle);
      setSavedMessage("保存済み");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "チャートタイトルの保存に失敗しました。",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack align="stretch" spacing={2}>
      <FormControl isInvalid={Boolean(error)}>
        <FormLabel>チャートタイトル</FormLabel>
        <HStack align="start">
          <Input
            value={draftTitle}
            maxLength={80}
            onChange={(event) => {
              setDraftTitle(event.target.value);
              setSavedMessage(null);
              setError(null);
            }}
          />
          <Button
            colorScheme="teal"
            isLoading={isSaving}
            loadingText="保存中"
            onClick={handleSave}
          >
            保存
          </Button>
        </HStack>
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
      {savedMessage ? (
        <Text color="teal.700" fontSize="sm">
          {savedMessage}
        </Text>
      ) : null}
      {error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </VStack>
  );
}
