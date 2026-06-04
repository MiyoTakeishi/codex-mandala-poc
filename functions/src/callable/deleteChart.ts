import * as functions from "firebase-functions";

import { db, FieldValue } from "../lib/admin";
import { FUNCTIONS_REGION } from "../lib/constants";
import { requireUid } from "../lib/validation";

type DeleteChartData = {
  chartId?: unknown;
};

type DeleteChartResult = {
  chartId: string;
};

function normalizeChartId(data: DeleteChartData) {
  if (typeof data.chartId !== "string" || data.chartId.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "チャートIDが不正です。",
    );
  }

  return data.chartId.trim();
}

export const deleteChart = functions
  .region(FUNCTIONS_REGION)
  .https.onCall(async (data, context): Promise<DeleteChartResult> => {
    const uid = requireUid(context);
    const chartId = normalizeChartId(data ?? {});
    const chartRef = db.collection("charts").doc(chartId);

    return db.runTransaction(async (transaction) => {
      const chartSnapshot = await transaction.get(chartRef);

      if (!chartSnapshot.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "チャートが見つかりません。",
        );
      }

      const chart = chartSnapshot.data();

      if (chart?.ownerUid !== uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "チャートを削除する権限がありません。",
        );
      }

      if (chart.isDeleted !== true) {
        const now = FieldValue.serverTimestamp();

        transaction.update(chartRef, {
          isDeleted: true,
          deletedAt: now,
          updatedAt: now,
        });
      }

      return {
        chartId,
      };
    });
  });
