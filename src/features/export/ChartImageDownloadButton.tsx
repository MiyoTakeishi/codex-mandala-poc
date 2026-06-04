import { Button } from "@chakra-ui/react";
import { useState } from "react";

import { AppIcon } from "../../components/ui/AppIcon";
import type {
  CellDocument,
  ChartDocument,
  EditorDocument,
} from "../../types/firestore";
import { downloadChartImage } from "./downloadChartImage";

type ChartImageDownloadButtonProps = {
  cells: CellDocument[];
  chart: ChartDocument;
  editors: EditorDocument[];
  isDisabled?: boolean;
};

export function ChartImageDownloadButton({
  cells,
  chart,
  editors,
  isDisabled = false,
}: ChartImageDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);

    try {
      downloadChartImage({ cells, chart, editors });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      isDisabled={isDisabled}
      isLoading={isGenerating}
      leftIcon={<AppIcon name="download" />}
      loadingText="生成中"
      size="sm"
      variant="outline"
      onClick={handleDownload}
    >
      画像ダウンロード
    </Button>
  );
}
