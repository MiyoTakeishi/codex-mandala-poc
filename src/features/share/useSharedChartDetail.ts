import { useEffect, useState } from "react";
import {
  collection,
  doc,
  FirestoreError,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { firestore } from "../../firebase/firestore";
import type {
  CellDocument,
  ChartDocument,
  InviteLinkDocument,
} from "../../types/firestore";

type SharedChartDetail = {
  chart: ChartDocument;
  cells: CellDocument[];
};

type UseSharedChartDetailResult = {
  detail: SharedChartDetail | null;
  isLoading: boolean;
  error: string | null;
  setCellBody: (cellId: string, body: string) => void;
};

export function useSharedChartDetail(
  token: string | undefined,
): UseSharedChartDetailResult {
  const [detail, setDetail] = useState<SharedChartDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setDetail(null);
      setIsLoading(false);
      setError("招待リンクが不正です。");
      return () => {
        isMounted = false;
      };
    }

    const targetToken = token;

    async function loadSharedChartDetail() {
      setIsLoading(true);
      setError(null);

      try {
        const inviteLinkRef = doc(firestore, "inviteLinks", targetToken);
        const inviteLinkSnapshot = await getDoc(inviteLinkRef);

        if (!inviteLinkSnapshot.exists()) {
          throw new Error("招待リンクが見つかりません。");
        }

        const inviteLink =
          inviteLinkSnapshot.data() as InviteLinkDocument;
        const chartRef = doc(firestore, "charts", inviteLink.chartId);
        const chartSnapshot = await getDoc(chartRef);

        if (!chartSnapshot.exists()) {
          throw new Error("共有チャートが見つかりません。");
        }

        const cellsSnapshot = await getDocs(collection(chartRef, "cells"));

        if (!isMounted) {
          return;
        }

        setDetail({
          chart: chartSnapshot.data({
            serverTimestamps: "estimate",
          }) as ChartDocument,
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

        console.error("Failed to load shared chart detail.", loadError);

        if (loadError instanceof FirestoreError) {
          if (loadError.code === "permission-denied") {
            setError("この招待リンクではチャートを閲覧できません。");
            return;
          }

          if (loadError.code === "failed-precondition") {
            setError("共有チャートの取得に必要なFirestoreインデックスが未作成です。");
            return;
          }
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "共有チャートの取得に失敗しました。",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSharedChartDetail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return {
    detail,
    isLoading,
    error,
    setCellBody: (cellId: string, body: string) => {
      setDetail((currentDetail) => {
        if (!currentDetail) {
          return currentDetail;
        }

        return {
          ...currentDetail,
          cells: currentDetail.cells.map((cell) =>
            cell.id === cellId
              ? {
                  ...cell,
                  body,
                }
              : cell,
          ),
        };
      });
    },
  };
}
