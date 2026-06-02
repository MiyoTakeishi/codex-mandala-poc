import * as functions from "firebase-functions";

import { db, FieldValue } from "../lib/admin";
import { FUNCTIONS_REGION } from "../lib/constants";
import { generateInviteToken } from "../lib/tokens";
import { requireUid } from "../lib/validation";

type CreateInviteLinkData = {
  chartId?: unknown;
};

type CreateInviteLinkResult = {
  token: string;
};

function normalizeChartId(data: CreateInviteLinkData) {
  if (typeof data.chartId !== "string" || data.chartId.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "チャートIDが不正です。",
    );
  }

  return data.chartId.trim();
}

export const createInviteLink = functions
  .region(FUNCTIONS_REGION)
  .https.onCall(async (data, context): Promise<CreateInviteLinkResult> => {
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
          "招待リンクを発行する権限がありません。",
        );
      }

      if (chart.isDeleted !== false) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "削除済みのチャートには招待リンクを発行できません。",
        );
      }

      if (typeof chart.inviteToken === "string" && chart.inviteToken.length > 0) {
        return {
          token: chart.inviteToken,
        };
      }

      const token = generateInviteToken();
      const inviteLinkRef = db.collection("inviteLinks").doc(token);
      const now = FieldValue.serverTimestamp();

      transaction.update(chartRef, {
        inviteToken: token,
        updatedAt: now,
      });
      transaction.set(inviteLinkRef, {
        token,
        chartId,
        createdByUid: uid,
        createdAt: now,
      });

      return {
        token,
      };
    });
  });
