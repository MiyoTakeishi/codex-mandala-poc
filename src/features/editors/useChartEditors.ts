import { useEffect, useState } from "react";
import {
  collection,
  FirestoreError,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { firestore } from "../../firebase/firestore";
import type { EditorDocument } from "../../types/firestore";

type UseChartEditorsResult = {
  editors: EditorDocument[];
  isLoading: boolean;
  error: string | null;
};

export function useChartEditors(chartId: string | null): UseChartEditorsResult {
  const [editors, setEditors] = useState<EditorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(chartId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!chartId) {
      setEditors([]);
      setIsLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    const targetChartId = chartId;

    async function loadEditors() {
      setIsLoading(true);
      setError(null);

      try {
        const editorsQuery = query(
          collection(firestore, "charts", targetChartId, "editors"),
          orderBy("createdAt", "asc"),
        );
        const editorsSnapshot = await getDocs(editorsQuery);

        if (!isMounted) {
          return;
        }

        setEditors(
          editorsSnapshot.docs.map(
            (editorSnapshot) => editorSnapshot.data() as EditorDocument,
          ),
        );
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load chart editors.", loadError);

        if (loadError instanceof FirestoreError) {
          if (loadError.code === "permission-denied") {
            setError("編集者一覧を取得する権限がありません。");
            return;
          }

          if (loadError.code === "failed-precondition") {
            setError("編集者一覧の取得に必要なFirestoreインデックスが未作成です。");
            return;
          }
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "編集者一覧の取得に失敗しました。",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEditors();

    return () => {
      isMounted = false;
    };
  }, [chartId]);

  return {
    editors,
    isLoading,
    error,
  };
}
