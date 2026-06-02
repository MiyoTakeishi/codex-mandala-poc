import { FirebaseError } from "firebase/app";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import { firestore } from "../../firebase/firestore";

const MAX_CELL_BODY_LENGTH = 200;

export function normalizeCellBody(body: string) {
  const normalizedBody = body.trim();

  if (normalizedBody.length > MAX_CELL_BODY_LENGTH) {
    throw new Error(`セル本文は${MAX_CELL_BODY_LENGTH}文字以内で入力してください。`);
  }

  return normalizedBody;
}

export async function updateCellBody(params: {
  chartId: string;
  cellId: string;
  body: string;
  updatedByUid: string;
}) {
  const body = normalizeCellBody(params.body);

  try {
    await updateDoc(doc(firestore, "charts", params.chartId, "cells", params.cellId), {
      body,
      updatedByUid: params.updatedByUid,
      updatedAt: serverTimestamp(),
    });

    return body;
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      throw new Error("このセルを編集する権限がありません。");
    }

    throw new Error("セルの保存に失敗しました。");
  }
}
