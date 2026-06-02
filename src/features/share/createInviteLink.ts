import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";

import { functions } from "../../firebase/functions";

type CreateInviteLinkRequest = {
  chartId: string;
};

type CreateInviteLinkResponse = {
  token: string;
};

const createInviteLinkCallable = httpsCallable<
  CreateInviteLinkRequest,
  CreateInviteLinkResponse
>(functions, "createInviteLink");

export async function createInviteLink(chartId: string) {
  try {
    const result = await createInviteLinkCallable({ chartId });
    return result.data.token;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "functions/unauthenticated") {
        throw new Error("招待リンクの発行にはログインが必要です。");
      }

      if (error.code === "functions/permission-denied") {
        throw new Error("招待リンクを発行する権限がありません。");
      }

      if (error.code === "functions/not-found") {
        throw new Error("チャートが見つかりません。");
      }

      if (error.code === "functions/failed-precondition") {
        throw new Error("削除済みのチャートには招待リンクを発行できません。");
      }

      if (error.code === "functions/invalid-argument") {
        throw new Error(error.message);
      }
    }

    throw new Error("招待リンクの発行に失敗しました。時間をおいて再試行してください。");
  }
}
