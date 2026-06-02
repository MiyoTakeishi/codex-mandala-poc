import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";

export function App() {
  return (
    <Box minH="100vh" bg="gray.50" color="gray.900">
      <Container maxW="6xl" py={{ base: 8, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          <HStack justify="space-between" align="center">
            <Heading size="md">マンダラチャート</Heading>
            <Button colorScheme="teal" isDisabled>
              Googleでログイン
            </Button>
          </HStack>

          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={{ base: 5, md: 8 }}
          >
            <VStack align="start" spacing={4}>
              <Heading size="lg">共有できる9x9チャートを作成する</Heading>
              <Text color="gray.600">
                Firebase基盤の初期設定が完了しています。次のフェーズでGoogleログインとユーザー情報の保存を実装します。
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
