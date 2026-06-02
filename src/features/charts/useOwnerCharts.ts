import { useEffect, useState } from "react";
import {
  collection,
  FirestoreError,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { firestore } from "../../firebase/firestore";
import type { ChartDocument } from "../../types/firestore";

type OwnerChart = ChartDocument & {
  id: string;
};

type UseOwnerChartsResult = {
  charts: OwnerChart[];
  isLoading: boolean;
  error: string | null;
};

export function useOwnerCharts(ownerUid: string | undefined): UseOwnerChartsResult {
  const [charts, setCharts] = useState<OwnerChart[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(ownerUid));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerUid) {
      setCharts([]);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    const chartsQuery = query(
      collection(firestore, "charts"),
      where("ownerUid", "==", ownerUid),
      where("isDeleted", "==", false),
      orderBy("updatedAt", "desc"),
    );

    return onSnapshot(
      chartsQuery,
      (snapshot) => {
        setCharts(
          snapshot.docs.map((chartSnapshot) => {
            const data = chartSnapshot.data() as ChartDocument;

            return {
              ...data,
              id: data.id || chartSnapshot.id,
            };
          }),
        );
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to subscribe owner charts.", snapshotError);

        if (snapshotError instanceof FirestoreError) {
          if (snapshotError.code === "permission-denied") {
            setError(
              "チャート一覧を取得する権限がありません。Firestore Rulesの反映状態を確認してください。",
            );
            setIsLoading(false);
            return;
          }

          if (snapshotError.code === "failed-precondition") {
            setError(
              "チャート一覧に必要なFirestoreインデックスが準備中、または未作成です。しばらく待ってから再読み込みしてください。",
            );
            setIsLoading(false);
            return;
          }
        }

        setError("チャート一覧の取得に失敗しました。");
        setIsLoading(false);
      },
    );
  }, [ownerUid]);

  return {
    charts,
    isLoading,
    error,
  };
}
