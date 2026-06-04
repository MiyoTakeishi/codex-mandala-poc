import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

const PROJECT_ID = "demo-mandara";
const OWNER_UID = "owner-uid";
const NOW = Timestamp.fromMillis(1_700_000_000_000);

let testEnv: RulesTestEnvironment;

test.beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

test.afterEach(async () => {
  await testEnv.clearFirestore();
});

test.afterAll(async () => {
  await testEnv.cleanup();
});

async function seedSharedChart(options: {
  chartId: string;
  token: string;
  title: string;
  isDeleted?: boolean;
}) {
  const { chartId, isDeleted = false, title, token } = options;

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const chartRef = doc(db, "charts", chartId);

    await setDoc(chartRef, {
      id: chartId,
      ownerUid: OWNER_UID,
      title,
      inviteToken: token,
      isDeleted,
      ...(isDeleted ? { deletedAt: NOW } : {}),
      createdAt: NOW,
      updatedAt: NOW,
    });

    await setDoc(doc(db, "inviteLinks", token), {
      token,
      chartId,
      createdByUid: OWNER_UID,
      createdAt: NOW,
    });

    await Promise.all(
      Array.from({ length: 81 }, async (_, index) => {
        const rowIndex = Math.floor(index / 9);
        const colIndex = index % 9;
        const cellId = `r${rowIndex}c${colIndex}`;

        await setDoc(doc(chartRef, "cells", cellId), {
          id: cellId,
          rowIndex,
          colIndex,
          body: rowIndex === 4 && colIndex === 4 ? "中心目標" : "",
          createdAt: NOW,
          updatedAt: NOW,
        });
      }),
    );
  });
}

test("guest can view an active shared chart", async ({ page }) => {
  await seedSharedChart({
    chartId: "shared-chart",
    token: "active-token",
    title: "E2E共有チャート",
  });
  const inviteLinkSnapshot = await getDoc(
    doc(
      testEnv.unauthenticatedContext().firestore(),
      "inviteLinks",
      "active-token",
    ),
  );
  expect(inviteLinkSnapshot.exists()).toBe(true);

  await page.goto("/share/active-token");

  await expect(
    page.getByRole("heading", { name: "E2E共有チャート" }),
  ).toBeVisible();
  await expect(page.getByText("ゲスト閲覧", { exact: true })).toBeVisible();
  await expect(page.getByText("中心目標", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "編集する" })).toBeVisible();
});

test("guest cannot view a deleted shared chart", async ({ page }) => {
  await seedSharedChart({
    chartId: "deleted-shared-chart",
    token: "deleted-token",
    title: "削除済みチャート",
    isDeleted: true,
  });

  await page.goto("/share/deleted-token");

  await expect(
    page.getByText("この招待リンクではチャートを閲覧できません。"),
  ).toBeVisible();
  await expect(page.getByText("削除済みチャート")).toHaveCount(0);
});
