import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { AppShell } from "../AppShell";

export function ErrorPage() {
  return (
    <AppShell maxW="lg">
      <Box
        bg="linen.50"
        border="1px solid"
        borderColor="linen.300"
        borderRadius="lg"
        boxShadow="card"
        p={8}
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="lg" color="ink.900">
            ページを表示できません
          </Heading>
          <Text color="ink.500">
            権限がない、削除済み、または存在しないページの可能性があります。
          </Text>
          <Button as={RouterLink} to="/charts">
            チャート一覧へ
          </Button>
        </VStack>
      </Box>
    </AppShell>
  );
}
