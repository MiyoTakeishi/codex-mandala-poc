import type {
  CellDocument,
  ChartDocument,
  EditorDocument,
} from "../../types/firestore";

type DownloadChartImageOptions = {
  chart: ChartDocument;
  cells: CellDocument[];
  editors: EditorDocument[];
};

const exportThemes = [
  { bg: "#FEF2F2", border: "#F87171", center: "#EF4444", cellBorder: "#FECACA" },
  { bg: "#FDF2F8", border: "#F472B6", center: "#DB2777", cellBorder: "#FBCFE8" },
  { bg: "#FAF5FF", border: "#C084FC", center: "#9333EA", cellBorder: "#E9D5FF" },
  { bg: "#EFF6FF", border: "#60A5FA", center: "#2563EB", cellBorder: "#BFDBFE" },
  { bg: "#FFFFFC", border: "#777F74", center: "#B8873D" },
  { bg: "#ECFEFF", border: "#22D3EE", center: "#0891B2", cellBorder: "#A5F3FC" },
  { bg: "#F0FDF4", border: "#4ADE80", center: "#16A34A", cellBorder: "#BBF7D0" },
  { bg: "#FEFCE8", border: "#EAB308", center: "#A16207", cellBorder: "#FEF08A" },
  { bg: "#FFF7ED", border: "#FB923C", center: "#EA580C", cellBorder: "#FED7AA" },
];

const centerArrowRotations = [
  -135,
  -90,
  -45,
  180,
  null,
  0,
  135,
  90,
  45,
];

function formatDate(seconds: number | undefined) {
  if (seconds === undefined) {
    return "作成日不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
  }).format(new Date(seconds * 1000));
}

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
}

function formatFileTimestamp(date = new Date()) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join("");
}

function drawTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const characters = [...text];
  const lines: string[] = [];
  let line = "";

  characters.forEach((character) => {
    const nextLine = `${line}${character}`;
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = character;
      return;
    }

    line = nextLine;
  });

  if (line) {
    lines.push(line);
  }

  lines.slice(0, maxLines).forEach((lineText, index) => {
    context.fillText(lineText, x, y + index * lineHeight);
  });
}

function drawCenteredTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const characters = [...text];
  const lines: string[] = [];
  let line = "";

  characters.forEach((character) => {
    const nextLine = `${line}${character}`;
    if (context.measureText(nextLine).width > maxWidth && line) {
      lines.push(line);
      line = character;
      return;
    }

    line = nextLine;
  });

  if (line) {
    lines.push(line);
  }

  const visibleLines = lines.slice(0, maxLines);
  const totalHeight = (visibleLines.length - 1) * lineHeight;
  const startY = centerY - totalHeight / 2;

  visibleLines.forEach((lineText, index) => {
    context.fillText(lineText, centerX, startY + index * lineHeight);
  });
}

function drawCenterArrow(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  color: string,
  rotation: number | null,
) {
  if (rotation === null) {
    return;
  }

  context.save();
  context.translate(centerX, centerY);
  context.rotate((rotation * Math.PI) / 180);
  context.globalAlpha = 0.18;
  context.fillStyle = color;

  const shaftW = width * 0.38;
  const shaftH = width * 0.16;
  const headW = width * 0.2;
  const headH = width * 0.28;

  context.beginPath();
  context.rect(-shaftW / 2, -shaftH / 2, shaftW, shaftH);
  context.moveTo(shaftW / 2, -headH / 2);
  context.lineTo(shaftW / 2 + headW, 0);
  context.lineTo(shaftW / 2, headH / 2);
  context.closePath();
  context.fill();
  context.restore();
}

function drawLogo(context: CanvasRenderingContext2D, x: number, y: number) {
  context.save();
  context.strokeStyle = "#18211F";
  context.lineWidth = 4;
  context.strokeRect(x, y, 54, 54);

  const cellSize = 14;
  Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    context.fillStyle = index === 4 ? "#1F5F58" : "#FFFFFC";
    context.strokeStyle = index === 4 ? "#173F3B" : "#D8DAD2";
    context.lineWidth = 2;
    context.fillRect(x + 7 + col * cellSize, y + 7 + row * cellSize, cellSize, cellSize);
    context.strokeRect(x + 7 + col * cellSize, y + 7 + row * cellSize, cellSize, cellSize);
  });

  context.fillStyle = "#18211F";
  context.font = "800 34px sans-serif";
  context.fillText("Mandala Focus", x + 76, y + 28);
  context.fillStyle = "#66736D";
  context.font = "700 13px sans-serif";
  context.fillText("PLAN YOUR NEXT ACTION", x + 78, y + 50);
  context.restore();
}

function drawChart(
  context: CanvasRenderingContext2D,
  cells: CellDocument[],
  x: number,
  y: number,
  size: number,
) {
  const cellsByPosition = new Map(
    cells.map((cell) => [`${cell.rowIndex}:${cell.colIndex}`, cell]),
  );
  const blockGap = 8;
  const blockSize = (size - blockGap * 2) / 3;
  const cellGap = 2;
  const cellSize = (blockSize - cellGap * 2) / 3;

  context.textAlign = "center";
  context.textBaseline = "middle";

  Array.from({ length: 9 }, (_, blockIndex) => {
    const blockRow = Math.floor(blockIndex / 3);
    const blockCol = blockIndex % 3;
    const theme = exportThemes[blockIndex];
    const blockX = x + blockCol * (blockSize + blockGap);
    const blockY = y + blockRow * (blockSize + blockGap);
    const isCenterBlock = blockIndex === 4;

    context.fillStyle = isCenterBlock ? "#D8DAD2" : theme.border;
    context.fillRect(blockX, blockY, blockSize, blockSize);

    Array.from({ length: 9 }, (_, innerIndex) => {
      const innerRow = Math.floor(innerIndex / 3);
      const innerCol = innerIndex % 3;
      const rowIndex = blockRow * 3 + innerRow;
      const colIndex = blockCol * 3 + innerCol;
      const cell = cellsByPosition.get(`${rowIndex}:${colIndex}`);
      const cellX = blockX + innerCol * (cellSize + cellGap);
      const cellY = blockY + innerRow * (cellSize + cellGap);
      const isBlockCenter = innerIndex === 4;
      const isMainCenter = rowIndex === 4 && colIndex === 4;

      context.fillStyle = isCenterBlock
        ? isMainCenter
          ? "#FFFFFC"
          : "#F7F7F4"
        : isBlockCenter
          ? theme.bg
          : theme.bg;
      context.fillRect(cellX, cellY, cellSize, cellSize);

      context.strokeStyle = isCenterBlock
        ? isMainCenter
          ? "#18211F"
          : exportThemes[innerIndex].border
        : isBlockCenter
          ? theme.center
          : theme.cellBorder ?? "#D8DAD2";
      context.lineWidth = isBlockCenter || isCenterBlock ? 3 : 1.5;
      context.strokeRect(cellX, cellY, cellSize, cellSize);

      if (isCenterBlock && !isMainCenter) {
        drawCenterArrow(
          context,
          cellX + cellSize / 2,
          cellY + cellSize / 2,
          cellSize * 0.55,
          exportThemes[innerIndex].center,
          centerArrowRotations[innerIndex],
        );
      }

      const body = cell?.body.trim() || "未入力";
      context.fillStyle = "#18211F";
      context.font = `${isBlockCenter || isMainCenter ? "700" : "500"} 18px sans-serif`;
      drawCenteredTextLines(
        context,
        body,
        cellX + cellSize / 2,
        cellY + cellSize / 2,
        cellSize - 18,
        24,
        3,
      );
    });
  });
}

export function downloadChartImage({
  cells,
  chart,
  editors,
}: DownloadChartImageOptions) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 2050;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("画像生成に失敗しました。");
  }

  context.fillStyle = "#F7F7F4";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#FFFFFC";
  context.fillRect(70, 70, 1460, 1910);
  context.strokeStyle = "#D8DAD2";
  context.lineWidth = 2;
  context.strokeRect(70, 70, 1460, 1910);

  drawLogo(context, 120, 120);

  context.fillStyle = "#18211F";
  context.font = "800 54px sans-serif";
  drawTextLines(context, chart.title, 120, 270, 1320, 64, 2);

  context.fillStyle = "#66736D";
  context.font = "600 24px sans-serif";
  context.fillText(`作成日: ${formatDate(chart.createdAt?.seconds)}`, 120, 405);

  drawChart(context, cells, 200, 475, 1200);

  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#18211F";
  context.font = "800 30px sans-serif";
  context.fillText("編集者一覧", 120, 1780);

  context.fillStyle = "#66736D";
  context.font = "500 22px sans-serif";
  const editorText =
    editors.length > 0
      ? editors.map((editor) => editor.allowedEmail).join(" / ")
      : "編集者なし";
  drawTextLines(context, editorText, 120, 1825, 1360, 34, 3);

  context.fillStyle = "#9CA297";
  context.font = "600 18px sans-serif";
  context.fillText(`Chart ID: ${chart.id}`, 120, 1940);

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = [
    "Mandala-Focus",
    formatFileTimestamp(),
    sanitizeFileName(chart.title) || "mandala-chart",
  ].join("_") + ".png";
  link.click();
}
