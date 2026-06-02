import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";

import { functions } from "../../firebase/functions";

type VerifyEditorAccessRequest = {
  token: string;
};

type VerifyEditorAccessResponse = {
  chartId: string;
  editorId: string;
};

const verifyEditorAccessCallable = httpsCallable<
  VerifyEditorAccessRequest,
  VerifyEditorAccessResponse
>(functions, "verifyEditorAccess");

export async function verifyEditorAccess(token: string) {
  try {
    const result = await verifyEditorAccessCallable({ token });
    return result.data;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("編集するにはGoogleログインが必要です。");
      }

      if (error.code === "functions/permission-denied") {
        throw new Error("このGoogleアカウントには編集権限がありません。");
      }

      if (error.code === "functions/not-found") {
        throw new Error("招待リンクまたはチャートが見つかりません。");
      }

      if (error.code === "functions/failed-precondition") {
        throw new Error("このチャートは編集できない状態です。");
      }

      if (error.code === "functions/invalid-argument") {
        throw new Error(error.message);
      }
    }

    throw new Error("編集権限の確認に失敗しました。時間をおいて再試行してください。");
  }
}
