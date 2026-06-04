import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { AppShell } from "../AppShell";

export function ErrorPage() {
  return (
    <AppShell maxW="lg">
      <Box bg="white" border="1px solid" borderColor="gray.200" p={8}>
        <VStack align="stretch" spacing={4}>
          <Heading size="lg">ページを表示できません</Heading>
          <Text color="gray.600">
            権限がない、削除済み、または存在しないページの可能性があります。
          </Text>
          <Button as={RouterLink} to="/charts" colorScheme="teal">
            チャート一覧へ
          </Button>
        </VStack>
      </Box>
    </AppShell>
  );
}
