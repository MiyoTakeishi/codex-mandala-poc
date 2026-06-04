import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";

import { functions } from "../../firebase/functions";

type DeleteChartRequest = {
  chartId: string;
};

type DeleteChartResponse = {
  chartId: string;
};

const deleteChartCallable = httpsCallable<DeleteChartRequest, DeleteChartResponse>(
  functions,
  "deleteChart",
);

export async function deleteChart(chartId: string) {
  try {
    const result = await deleteChartCallable({ chartId });
    return result.data.chartId;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("チャート削除にはログインが必要です。");
      }

      if (error.code === "functions/permission-denied") {
        throw new Error("チャートを削除する権限がありません。");
      }

      if (error.code === "functions/not-found") {
        throw new Error("チャートが見つかりません。");
      }

      if (error.code === "functions/invalid-argument") {
        throw new Error(error.message);
      }
    }

    throw new Error("チャートの削除に失敗しました。時間をおいて再試行してください。");
  }
}
