import { useEffect, useState } from "react";
import {
  collection,
  doc,
  FirestoreError,
  getDocs,
  getDoc,
} from "firebase/firestore";

import { firestore } from "../../firebase/firestore";
import type { CellDocument, ChartDocument } from "../../types/firestore";

type OwnerChartDetail = {
  chart: ChartDocument;
  cells: CellDocument[];
};

type UseOwnerChartDetailResult = {
  detail: OwnerChartDetail | null;
  isLoading: boolean;
  error: string | null;
};

export function useOwnerChartDetail(
  chartId: string | null,
): UseOwnerChartDetailResult {
  const [detail, setDetail] = useState<OwnerChartDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(chartId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!chartId) {
      setDetail(null);
      setIsLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    const targetChartId = chartId;

    async function loadChartDetail() {
      setIsLoading(true);
      setError(null);

      try {
        const chartRef = doc(firestore, "charts", targetChartId);
        const chartSnapshot = await getDoc(chartRef);

        if (!chartSnapshot.exists()) {
          throw new Error("チャートが見つかりません。");
        }

        const cellsSnapshot = await getDocs(collection(chartRef, "cells"));

        if (!isMounted) {
          return;
        }

        setDetail({
          chart: chartSnapshot.data() as ChartDocument,
          cells: cellsSnapshot.docs
            .map((cellSnapshot) => cellSnapshot.data() as CellDocument)
            .sort(
              (a, b) =>
                a.rowIndex - b.rowIndex || a.colIndex - b.colIndex,
            ),
        });
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load owner chart detail.", loadError);

        if (loadError instanceof FirestoreError) {
          if (loadError.code === "permission-denied") {
            setError("チャート詳細を取得する権限がありません。");
            return;
          }

          if (loadError.code === "failed-precondition") {
            setError("チャート詳細の取得に必要なFirestoreインデックスが未作成です。");
            return;
          }
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "チャート詳細の取得に失敗しました。",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadChartDetail();

    return () => {
      isMounted = false;
    };
  }, [chartId]);

  return {
    detail,
    isLoading,
    error,
  };
}
