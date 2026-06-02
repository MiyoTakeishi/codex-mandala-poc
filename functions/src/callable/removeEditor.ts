import * as functions from "firebase-functions";

import { db } from "../lib/admin";
import { FUNCTIONS_REGION } from "../lib/constants";
import { normalizeEmail, requireUid } from "../lib/validation";

type RemoveEditorData = {
  chartId?: unknown;
  email?: unknown;
};

type RemoveEditorResult = {
  editorId: string;
};

function normalizeChartId(data: RemoveEditorData) {
  if (typeof data.chartId !== "string" || data.chartId.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "チャートIDが不正です。",
    );
  }

  return data.chartId.trim();
}

export const removeEditor = functions
  .region(FUNCTIONS_REGION)
  .https.onCall(async (data, context): Promise<RemoveEditorResult> => {
    const uid = requireUid(context);
    const requestData = data ?? {};
    const chartId = normalizeChartId(requestData);
    const allowedEmail = normalizeEmail(requestData.email);
    const chartRef = db.collection("charts").doc(chartId);
    const editorRef = chartRef.collection("editors").doc(allowedEmail);

    return db.runTransaction(async (transaction) => {
      const [chartSnapshot, editorSnapshot] = await Promise.all([
        transaction.get(chartRef),
        transaction.get(editorRef),
      ]);

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
          "編集者を削除する権限がありません。",
        );
      }

      if (chart.isDeleted !== false) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "削除済みのチャートから編集者は削除できません。",
        );
      }

      if (!editorSnapshot.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "編集者が見つかりません。",
        );
      }

      transaction.delete(editorRef);

      return {
        editorId: allowedEmail,
      };
    });
  });
