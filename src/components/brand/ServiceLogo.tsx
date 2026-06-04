import { Box, HStack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

type ServiceLogoProps = {
  linked?: boolean;
};

export function ServiceLogo({ linked = true }: ServiceLogoProps) {
  const content = (
    <HStack spacing={3}>
      <Box
        aria-hidden="true"
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap="2px"
        w="32px"
        h="32px"
        border="2px solid"
        borderColor="ink.800"
        p="3px"
      >
        {Array.from({ length: 9 }, (_, index) => (
          <Box
            key={index}
            bg={index === 4 ? "brand.500" : "linen.50"}
            border="1px solid"
            borderColor={index === 4 ? "brand.700" : "linen.400"}
          />
        ))}
      </Box>
      <Box lineHeight="1">
        <Text color="ink.900" fontSize={{ base: "md", md: "lg" }} fontWeight="800">
          Mandala Focus
        </Text>
        <Text color="ink.500" fontSize="10px" fontWeight="bold" letterSpacing="0.08em">
          PLAN YOUR NEXT ACTION
        </Text>
      </Box>
    </HStack>
  );

  if (!linked) {
    return content;
  }

  return (
    <Box as={RouterLink} to="/charts">
      {content}
    </Box>
  );
}
