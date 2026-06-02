import { Box, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import {
  CellUpdatePermissionError,
  updateCellBody,
} from "../../features/charts/updateCellBody";
import type { CellDocument } from "../../types/firestore";

type MandalaChartGridProps = {
  chartId: string;
  cells: CellDocument[];
  currentUserUid?: string;
  isReadOnly?: boolean;
  onCellSaved?: (cellId: string, body: string) => void;
  onSavePermissionDenied?: (message: string) => void;
};

type CellSaveStatus = "idle" | "saving" | "saved" | "error";

const LINKED_CELL_PAIRS = [
  ["r3c3", "r1c1"],
  ["r3c4", "r1c4"],
  ["r3c5", "r1c7"],
  ["r4c3", "r4c1"],
  ["r4c5", "r4c7"],
  ["r5c3", "r7c1"],
  ["r5c4", "r7c4"],
  ["r5c5", "r7c7"],
];

const themeColors = [
  {
    blockBg: "red.50",
    blockBorder: "red.300",
    centerBg: "red.50",
    centerBorder: "red.400",
  },
  {
    blockBg: "pink.50",
    blockBorder: "pink.300",
    centerBg: "pink.50",
    centerBorder: "pink.400",
  },
  {
    blockBg: "purple.50",
    blockBorder: "purple.300",
    centerBg: "purple.50",
    centerBorder: "purple.400",
  },
  {
    blockBg: "blue.50",
    blockBorder: "blue.300",
    centerBg: "blue.50",
    centerBorder: "blue.400",
  },
  {
    blockBg: "orange.50",
    blockBorder: "orange.300",
    centerBg: "white",
    centerBorder: "orange.400",
  },
  {
    blockBg: "cyan.50",
    blockBorder: "cyan.300",
    centerBg: "cyan.50",
    centerBorder: "cyan.400",
  },
  {
    blockBg: "green.50",
    blockBorder: "green.300",
    centerBg: "green.50",
    centerBorder: "green.400",
  },
  {
    blockBg: "yellow.50",
    blockBorder: "yellow.300",
    centerBg: "yellow.50",
    centerBorder: "yellow.400",
  },
  {
    blockBg: "orange.100",
    blockBorder: "orange.400",
    centerBg: "orange.50",
    centerBorder: "orange.500",
  },
];

const linkedCellMap = new Map<string, string>(
  LINKED_CELL_PAIRS.flatMap(([a, b]) => [
    [a, b],
    [b, a],
  ]),
);

function getBlockTheme(blockRow: number, blockCol: number) {
  return themeColors[blockRow * 3 + blockCol];
}

function getCenterArrowRotation(innerRow: number, innerCol: number) {
  if (innerRow === 1 && innerCol === 1) {
    return null;
  }

  const rotations = [
    ["-135deg", "-90deg", "-45deg"],
    ["180deg", null, "0deg"],
    ["135deg", "90deg", "45deg"],
  ];

  return rotations[innerRow][innerCol];
}

export function MandalaChartGrid({
  cells,
  chartId,
  currentUserUid,
  isReadOnly = false,
  onCellSaved,
  onSavePermissionDenied,
}: MandalaChartGridProps) {
  const [draftBodies, setDraftBodies] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<CellSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [focusedCellId, setFocusedCellId] = useState<string | null>(null);
  const cellsById = new Map(cells.map((cell) => [cell.id, cell]));
  const cellsByPosition = new Map(
    cells.map((cell) => [`${cell.rowIndex}:${cell.colIndex}`, cell]),
  );

  useEffect(() => {
    setDraftBodies(
      Object.fromEntries(cells.map((cell) => [cell.id, cell.body])),
    );
  }, [cells]);

  useEffect(() => {
    setSaveStatus("idle");
    setSaveError(null);
    setFocusedCellId(null);
  }, [chartId]);

  function getLinkedCellIds(cellId: string) {
    const linkedCellId = linkedCellMap.get(cellId);

    return linkedCellId ? [cellId, linkedCellId] : [cellId];
  }

  function handleDraftChange(cellId: string, body: string) {
    if (isReadOnly) {
      return;
    }

    const linkedCellIds = getLinkedCellIds(cellId);

    setDraftBodies((current) => ({
      ...current,
      ...Object.fromEntries(linkedCellIds.map((linkedCellId) => [linkedCellId, body])),
    }));
    setSaveStatus("idle");
    setSaveError(null);
  }

  async function handleBlur(cell: CellDocument | undefined, fallbackCellId: string) {
    setFocusedCellId(null);

    if (isReadOnly || !cell || !currentUserUid || !onCellSaved) {
      return;
    }

    const targetCellIds = getLinkedCellIds(cell.id).filter((cellId) => {
      const targetCell = cellsById.get(cellId);
      const draftBody = draftBodies[cellId] ?? "";

      return targetCell && draftBody !== targetCell.body;
    });

    if (targetCellIds.length === 0) {
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);

    try {
      const savedEntries = await Promise.all(
        targetCellIds.map(async (cellId) => {
          const savedBody = await updateCellBody({
            chartId,
            cellId: cellId || fallbackCellId,
            body: draftBodies[cellId] ?? "",
            updatedByUid: currentUserUid,
          });

          return [cellId, savedBody] as const;
        }),
      );

      setDraftBodies((current) => ({
        ...current,
        ...Object.fromEntries(savedEntries),
      }));
      savedEntries.forEach(([cellId, savedBody]) => onCellSaved(cellId, savedBody));
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("error");
      setSaveError(error instanceof Error ? error.message : "セルの保存に失敗しました。");

      if (error instanceof CellUpdatePermissionError) {
        onSavePermissionDenied?.(error.message);
      }
    }
  }

  return (
    <Box>
      <Box minH="24px" mb={2}>
        {!isReadOnly && saveStatus !== "idle" ? (
          <Text
            fontSize="sm"
            color={saveStatus === "error" ? "red.600" : "gray.600"}
            fontWeight="semibold"
          >
            {saveStatus === "saving"
              ? "保存中"
              : saveStatus === "saved"
                ? "保存済み"
                : saveError}
          </Text>
        ) : null}
      </Box>
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
          const blockTheme = getBlockTheme(blockRow, blockCol);

          return (
            <Box
              key={`${blockRow}:${blockCol}`}
              display="grid"
              gridTemplateColumns="repeat(3, minmax(84px, 1fr))"
              gap="1px"
              bg={isCenterBlock ? "gray.500" : blockTheme.blockBorder}
              border="3px solid"
              borderColor={isCenterBlock ? "gray.700" : blockTheme.blockBorder}
              position="relative"
            >
              {Array.from({ length: 9 }, (_, innerIndex) => {
                const innerRow = Math.floor(innerIndex / 3);
                const innerCol = innerIndex % 3;
                const rowIndex = blockRow * 3 + innerRow;
                const colIndex = blockCol * 3 + innerCol;
                const cell = cellsByPosition.get(`${rowIndex}:${colIndex}`);
                const isMainCell = rowIndex === 4 && colIndex === 4;
                const isBlockCenter = innerRow === 1 && innerCol === 1;
                const fallbackCellId = `r${rowIndex}c${colIndex}`;
                const cellId = cell?.id ?? fallbackCellId;
                const isFocused = focusedCellId === cellId;
                const centerCellTheme = isCenterBlock
                  ? themeColors[innerRow * 3 + innerCol]
                  : blockTheme;
                const centerArrowRotation = isCenterBlock
                  ? getCenterArrowRotation(innerRow, innerCol)
                  : null;
                const cellBg = isCenterBlock
                  ? isMainCell
                    ? "white"
                    : "gray.50"
                  : isBlockCenter
                    ? blockTheme.centerBg
                    : blockTheme.blockBg;
                const cellBorderColor = isCenterBlock || isBlockCenter
                  ? isCenterBlock
                    ? isMainCell
                      ? "gray.700"
                      : "gray.300"
                    : centerCellTheme.centerBorder
                  : "gray.100";

                return (
                  <Box
                    key={`${rowIndex}:${colIndex}`}
                    aspectRatio="1"
                    bg={cellBg}
                    border="3px solid"
                    borderColor={isFocused ? "blue.500" : cellBorderColor}
                    boxShadow={isFocused ? "0 0 0 3px var(--chakra-colors-blue-100)" : "none"}
                    p={2}
                    overflow="hidden"
                    position="relative"
                  >
                    {centerArrowRotation ? (
                      <Box
                        position="absolute"
                        zIndex={0}
                        left="50%"
                        top="50%"
                        w="34px"
                        h="18px"
                        bg={centerCellTheme.centerBorder}
                        opacity={0.2}
                        pointerEvents="none"
                        transform={`translate(-50%, -50%) rotate(${centerArrowRotation})`}
                        _after={{
                          content: '""',
                          position: "absolute",
                          top: "50%",
                          right: "-17px",
                          transform: "translateY(-50%)",
                          borderTop: "18px solid transparent",
                          borderBottom: "18px solid transparent",
                          borderLeft: "20px solid currentColor",
                          color: centerCellTheme.centerBorder,
                        }}
                      />
                    ) : null}
                    {isReadOnly ? (
                      <Text
                        position="relative"
                        zIndex={1}
                        h="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize={isMainCell ? "md" : "sm"}
                        fontWeight={isMainCell || isBlockCenter ? "semibold" : "normal"}
                        textAlign="center"
                        whiteSpace="pre-wrap"
                      >
                        {draftBodies[cellId] || "未入力"}
                      </Text>
                    ) : (
                      <Textarea
                        position="relative"
                        zIndex={1}
                        fontSize={isMainCell ? "md" : "sm"}
                        fontWeight={isMainCell || isBlockCenter ? "semibold" : "normal"}
                        textAlign="center"
                        value={draftBodies[cellId] ?? ""}
                        minH="56px"
                        h="100%"
                        p={0}
                        border="0"
                        bg="transparent"
                        cursor="text"
                        resize="none"
                        placeholder="未入力"
                        _focus={{ boxShadow: "none" }}
                        sx={{
                          alignContent: "center",
                        }}
                        onFocus={() => setFocusedCellId(cellId)}
                        onBlur={() => void handleBlur(cell, fallbackCellId)}
                        onChange={(event) => handleDraftChange(cellId, event.target.value)}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
      </Box>
    </Box>
  );
}
