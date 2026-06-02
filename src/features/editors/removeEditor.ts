import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";

import { functions } from "../../firebase/functions";

type RemoveEditorRequest = {
  chartId: string;
  email: string;
};

type RemoveEditorResponse = {
  editorId: string;
};

const removeEditorCallable = httpsCallable<
  RemoveEditorRequest,
  RemoveEditorResponse
>(functions, "removeEditor");

export async function removeEditor(chartId: string, email: string) {
  try {
    const result = await removeEditorCallable({ chartId, email });
    return result.data.editorId;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("編集者の削除にはログインが必要です。");
      }

      if (error.code === "functions/permission-denied") {
        throw new Error("編集者を削除する権限がありません。");
      }

      if (error.code === "functions/not-found") {
        throw new Error("編集者またはチャートが見つかりません。");
      }

      if (error.code === "functions/failed-precondition") {
        throw new Error("削除済みのチャートから編集者は削除できません。");
      }

      if (error.code === "functions/invalid-argument") {
        throw new Error(error.message);
      }
    }

    throw new Error("編集者の削除に失敗しました。時間をおいて再試行してください。");
  }
}
