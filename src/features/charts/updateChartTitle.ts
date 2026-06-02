import { FirebaseError } from "firebase/app";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import { firestore } from "../../firebase/firestore";

const MAX_CHART_TITLE_LENGTH = 80;
const DEFAULT_CHART_TITLE = "無題のチャート";

export function normalizeChartTitle(title: string) {
  const normalizedTitle = title.trim();

  if (normalizedTitle.length === 0) {
    return DEFAULT_CHART_TITLE;
  }

  if (normalizedTitle.length > MAX_CHART_TITLE_LENGTH) {
    throw new Error(`チャートタイトルは${MAX_CHART_TITLE_LENGTH}文字以内で入力してください。`);
  }

  return normalizedTitle;
}

export async function updateChartTitle(chartId: string, title: string) {
  const normalizedTitle = normalizeChartTitle(title);

  try {
    await updateDoc(doc(firestore, "charts", chartId), {
      title: normalizedTitle,
      updatedAt: serverTimestamp(),
    });

    return normalizedTitle;
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      throw new Error("チャートタイトルを編集する権限がありません。");
    }

    throw new Error("チャートタイトルの保存に失敗しました。");
  }
}
