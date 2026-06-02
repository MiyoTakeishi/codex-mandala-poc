import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";

import { functions } from "../../firebase/functions";

type CreateChartRequest = {
  title?: string;
};

type CreateChartResponse = {
  chartId: string;
};

const createChartCallable = httpsCallable<
  CreateChartRequest,
  CreateChartResponse
>(functions, "createChart");

export async function createChart(title: string) {
  try {
    const result = await createChartCallable({ title });
    return result.data.chartId;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "functions/resource-exhausted") {
        throw new Error("作成できるチャートは最大5件です。");
      }

      if (error.code === "functions/unauthenticated") {
        throw new Error("チャート作成にはログインが必要です。");
      }

      if (error.code === "functions/invalid-argument") {
        throw new Error(error.message);
      }
    }

    throw new Error("チャートの作成に失敗しました。時間をおいて再試行してください。");
  }
}
