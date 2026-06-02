import * as functions from "firebase-functions";

import { DEFAULT_CHART_TITLE, MAX_CHART_TITLE_LENGTH } from "./constants";

type CreateChartData = {
  title?: unknown;
};

export function requireUid(context: functions.https.CallableContext) {
  const uid = context.auth?.uid;

  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "ログインが必要です。",
    );
  }

  return uid;
}

export function normalizeChartTitle(data: CreateChartData) {
  if (data.title === undefined || data.title === null) {
    return DEFAULT_CHART_TITLE;
  }

  if (typeof data.title !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "チャートタイトルが不正です。",
    );
  }

  const title = data.title.trim();

  if (title.length === 0) {
    return DEFAULT_CHART_TITLE;
  }

  if (title.length > MAX_CHART_TITLE_LENGTH) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `チャートタイトルは${MAX_CHART_TITLE_LENGTH}文字以内で入力してください。`,
    );
  }

  return title;
}
