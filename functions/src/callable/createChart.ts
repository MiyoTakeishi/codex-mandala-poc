import * as functions from "firebase-functions";

import {
  FUNCTIONS_REGION,
  MANDALA_GRID_SIZE,
  MAX_CHARTS_PER_USER,
} from "../lib/constants";
import { db, FieldValue } from "../lib/admin";
import { normalizeChartTitle, requireUid } from "../lib/validation";

type CreateChartResult = {
  chartId: string;
};

function cellId(rowIndex: number, colIndex: number) {
  return `r${rowIndex}c${colIndex}`;
}

export const createChart = functions
  .region(FUNCTIONS_REGION)
  .https.onCall(async (data, context): Promise<CreateChartResult> => {
    const ownerUid = requireUid(context);
    const title = normalizeChartTitle(data ?? {});

    const activeChartsSnapshot = await db
      .collection("charts")
      .where("ownerUid", "==", ownerUid)
      .where("isDeleted", "==", false)
      .limit(MAX_CHARTS_PER_USER)
      .get();

    if (activeChartsSnapshot.size >= MAX_CHARTS_PER_USER) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `作成できるチャートは最大${MAX_CHARTS_PER_USER}件です。`,
      );
    }

    const chartRef = db.collection("charts").doc();
    const batch = db.batch();
    const now = FieldValue.serverTimestamp();

    batch.set(chartRef, {
      id: chartRef.id,
      ownerUid,
      title,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    for (let rowIndex = 0; rowIndex < MANDALA_GRID_SIZE; rowIndex += 1) {
      for (let colIndex = 0; colIndex < MANDALA_GRID_SIZE; colIndex += 1) {
        const id = cellId(rowIndex, colIndex);
        const cellRef = chartRef.collection("cells").doc(id);

        batch.set(cellRef, {
          id,
          rowIndex,
          colIndex,
          body: "",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await batch.commit();

    return {
      chartId: chartRef.id,
    };
  });
