import { Box, Text } from "@chakra-ui/react";

import type { CellDocument } from "../../types/firestore";

type MandalaChartGridProps = {
  cells: CellDocument[];
};

function getCellTone(rowIndex: number, colIndex: number) {
  if (rowIndex === 4 && colIndex === 4) {
    return {
      bg: "orange.100",
      borderColor: "orange.500",
      labelColor: "orange.700",
    };
  }

  if (rowIndex % 3 === 1 && colIndex % 3 === 1) {
    return {
      bg: "teal.50",
      borderColor: "teal.400",
      labelColor: "teal.700",
    };
  }

  return {
    bg: "white",
    borderColor: "gray.200",
    labelColor: "gray.500",
  };
}

export function MandalaChartGrid({ cells }: MandalaChartGridProps) {
  const cellsByPosition = new Map(
    cells.map((cell) => [`${cell.rowIndex}:${cell.colIndex}`, cell]),
  );

  return (
    <Box overflowX="auto" pb={2}>
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, minmax(252px, 1fr))"
        gap={3}
        minW="756px"
      >
        {Array.from({ length: 9 }, (_, blockIndex) => {
          const blockRow = Math.floor(blockIndex / 3);
          const blockCol = blockIndex % 3;
          const isCenterBlock = blockRow === 1 && blockCol === 1;

          return (
            <Box
              key={`${blockRow}:${blockCol}`}
              display="grid"
              gridTemplateColumns="repeat(3, minmax(84px, 1fr))"
              gap="1px"
              bg={isCenterBlock ? "orange.300" : "teal.200"}
              border="3px solid"
              borderColor={isCenterBlock ? "orange.400" : "teal.300"}
            >
              {Array.from({ length: 9 }, (_, innerIndex) => {
                const innerRow = Math.floor(innerIndex / 3);
                const innerCol = innerIndex % 3;
                const rowIndex = blockRow * 3 + innerRow;
                const colIndex = blockCol * 3 + innerCol;
                const cell = cellsByPosition.get(`${rowIndex}:${colIndex}`);
                const tone = getCellTone(rowIndex, colIndex);
                const isMainCell = rowIndex === 4 && colIndex === 4;
                const isBlockCenter = innerRow === 1 && innerCol === 1;

                return (
                  <Box
                    key={`${rowIndex}:${colIndex}`}
                    aspectRatio="1"
                    bg={tone.bg}
                    border="2px solid"
                    borderColor={tone.borderColor}
                    p={2}
                    overflow="hidden"
                  >
                    <Text fontSize="10px" color={tone.labelColor} lineHeight="1">
                      r{rowIndex + 1} c{colIndex + 1}
                    </Text>
                    <Text
                      mt={2}
                      fontSize={isMainCell ? "md" : "sm"}
                      fontWeight={isMainCell || isBlockCenter ? "semibold" : "normal"}
                      noOfLines={4}
                      whiteSpace="pre-wrap"
                    >
                      {cell?.body || "未入力"}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
