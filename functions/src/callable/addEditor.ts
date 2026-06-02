import * as functions from "firebase-functions";

import { db, FieldValue } from "../lib/admin";
import { FUNCTIONS_REGION, MAX_EDITORS_PER_CHART } from "../lib/constants";
import { normalizeEmail, requireUid } from "../lib/validation";

type AddEditorData = {
  chartId?: unknown;
  email?: unknown;
};

type AddEditorResult = {
  editorId: string;
};

function normalizeChartId(data: AddEditorData) {
  if (typeof data.chartId !== "string" || data.chartId.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "チャートIDが不正です。",
    );
  }

  return data.chartId.trim();
}

export const addEditor = functions
  .region(FUNCTIONS_REGION)
  .https.onCall(async (data, context): Promise<AddEditorResult> => {
    const uid = requireUid(context);
    const requestData = data ?? {};
    const chartId = normalizeChartId(requestData);
    const allowedEmail = normalizeEmail(requestData.email);
    const chartRef = db.collection("charts").doc(chartId);
    const editorRef = chartRef.collection("editors").doc(allowedEmail);

    return db.runTransaction(async (transaction) => {
      const [chartSnapshot, editorSnapshot, editorsSnapshot] = await Promise.all([
        transaction.get(chartRef),
        transaction.get(editorRef),
        transaction.get(chartRef.collection("editors").limit(MAX_EDITORS_PER_CHART)),
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
          "編集者を追加する権限がありません。",
        );
      }

      if (chart.isDeleted !== false) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "削除済みのチャートには編集者を追加できません。",
        );
      }

      if (editorSnapshot.exists) {
        throw new functions.https.HttpsError(
          "already-exists",
          "このメールアドレスは既に編集者として追加されています。",
        );
      }

      if (editorsSnapshot.size >= MAX_EDITORS_PER_CHART) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `編集者は最大${MAX_EDITORS_PER_CHART}名まで追加できます。`,
        );
      }

      const now = FieldValue.serverTimestamp();

      transaction.set(editorRef, {
        id: allowedEmail,
        allowedEmail,
        addedByUid: uid,
        createdAt: now,
        updatedAt: now,
      });

      return {
        editorId: allowedEmail,
      };
    });
  });
