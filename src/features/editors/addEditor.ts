import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";

import { functions } from "../../firebase/functions";

type AddEditorRequest = {
  chartId: string;
  email: string;
};

type AddEditorResponse = {
  editorId: string;
};

const addEditorCallable = httpsCallable<AddEditorRequest, AddEditorResponse>(
  functions,
  "addEditor",
);

export async function addEditor(chartId: string, email: string) {
  try {
    const result = await addEditorCallable({ chartId, email });
    return result.data.editorId;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("編集者の追加にはログインが必要です。");
      }

      if (error.code === "functions/permission-denied") {
        throw new Error("編集者を追加する権限がありません。");
      }

      if (error.code === "functions/not-found") {
        throw new Error("チャートが見つかりません。");
      }

      if (error.code === "functions/failed-precondition") {
        throw new Error("削除済みのチャートには編集者を追加できません。");
      }

      if (error.code === "functions/already-exists") {
        throw new Error("このメールアドレスは既に編集者として追加されています。");
      }

      if (error.code === "functions/resource-exhausted") {
        throw new Error("編集者は最大10名まで追加できます。");
      }

      if (error.code === "functions/invalid-argument") {
        throw new Error(error.message);
      }
    }

    throw new Error("編集者の追加に失敗しました。時間をおいて再試行してください。");
  }
}
