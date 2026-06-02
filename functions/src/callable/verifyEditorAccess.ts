import * as functions from "firebase-functions";

import { db } from "../lib/admin";
import { FUNCTIONS_REGION } from "../lib/constants";
import { normalizeEmail, requireUid } from "../lib/validation";

type VerifyEditorAccessData = {
  token?: unknown;
};

type VerifyEditorAccessResult = {
  chartId: string;
  editorId: string;
};

function normalizeToken(data: VerifyEditorAccessData) {
  if (typeof data.token !== "string" || data.token.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "招待リンクトークンが不正です。",
    );
  }

  return data.token.trim();
}

export const verifyEditorAccess = functions
  .region(FUNCTIONS_REGION)
  .https.onCall(async (data, context): Promise<VerifyEditorAccessResult> => {
    const requestData = data ?? {};
    requireUid(context);
    const authEmail = normalizeEmail(context.auth?.token.email);
    const token = normalizeToken(requestData);
    const inviteLinkRef = db.collection("inviteLinks").doc(token);

    return db.runTransaction(async (transaction) => {
      const inviteLinkSnapshot = await transaction.get(inviteLinkRef);

      if (!inviteLinkSnapshot.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "招待リンクが見つかりません。",
        );
      }

      const inviteLink = inviteLinkSnapshot.data();
      const chartId = inviteLink?.chartId;

      if (typeof chartId !== "string" || chartId.length === 0) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "招待リンクの状態が不正です。",
        );
      }

      const chartRef = db.collection("charts").doc(chartId);
      const editorRef = chartRef.collection("editors").doc(authEmail);
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

      if (chart?.isDeleted !== false) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "削除済みのチャートは編集できません。",
        );
      }

      if (!editorSnapshot.exists) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "このGoogleアカウントには編集権限がありません。",
        );
      }

      return {
        chartId,
        editorId: authEmail,
      };
    });
  });
