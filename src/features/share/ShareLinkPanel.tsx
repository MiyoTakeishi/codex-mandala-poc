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
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { EditorListPanel } from "../editors/EditorListPanel";
import { createInviteLink } from "./createInviteLink";

type ShareLinkPanelProps = {
  chartId: string;
  inviteToken: string | undefined;
  onInviteTokenIssued: (token: string) => void;
};

type CopyStatus = "idle" | "success" | "error";

function buildShareUrl(token: string | undefined) {
  if (!token) {
    return "";
  }

  return `${window.location.origin}/share/${token}`;
}

export function ShareLinkPanel({
  chartId,
  inviteToken,
  onInviteTokenIssued,
}: ShareLinkPanelProps) {
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const shareUrl = useMemo(() => buildShareUrl(inviteToken), [inviteToken]);

  const handleIssueInviteLink = async () => {
    setIsIssuing(true);
    setIssueError(null);
    setCopyStatus("idle");

    try {
      const token = await createInviteLink(chartId);
      onInviteTokenIssued(token);
    } catch (error) {
      setIssueError(
        error instanceof Error
          ? error.message
          : "招待リンクの発行に失敗しました。",
      );
    } finally {
      setIsIssuing(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="center">
          <Text fontWeight="semibold">招待リンク</Text>
          <Badge colorScheme={inviteToken ? "green" : "gray"}>
            {inviteToken ? "発行済み" : "未発行"}
          </Badge>
        </HStack>

        {inviteToken ? (
          <FormControl>
            <FormLabel fontSize="sm">共有URL</FormLabel>
            <HStack align="start">
              <Input value={shareUrl} isReadOnly fontSize="sm" />
              <Button
                colorScheme="teal"
                flexShrink={0}
                onClick={() => void handleCopyShareUrl()}
              >
                コピー
              </Button>
            </HStack>
          </FormControl>
        ) : (
          <Text color="gray.600" fontSize="sm">
            招待リンクを発行すると、リンクを知っているユーザーがゲストとして閲覧できます。
          </Text>
        )}

        {!inviteToken ? (
          <Button
            alignSelf="start"
            colorScheme="teal"
            isLoading={isIssuing}
            loadingText="発行中"
            onClick={handleIssueInviteLink}
          >
            招待リンクを発行
          </Button>
        ) : null}

        {copyStatus === "success" ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertDescription>招待リンクをコピーしました。</AlertDescription>
          </Alert>
        ) : null}

        {copyStatus === "error" ? (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              コピーに失敗しました。共有URLを選択して手動でコピーしてください。
            </AlertDescription>
          </Alert>
        ) : null}

        {issueError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>{issueError}</AlertDescription>
          </Alert>
        ) : null}

        <EditorListPanel chartId={chartId} />
      </VStack>
    </Box>
  );
}
