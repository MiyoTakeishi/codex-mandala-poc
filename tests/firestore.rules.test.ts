import { readFileSync } from "node:fs";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

let testEnv: RulesTestEnvironment;

const PROJECT_ID = "demo-mandara";
const OWNER_UID = "owner-uid";
const EDITOR_UID = "editor-uid";
const OTHER_UID = "other-uid";
const OWNER_EMAIL = "owner@example.com";
const EDITOR_EMAIL = "editor@example.com";
const NOW = Timestamp.fromMillis(1_700_000_000_000);

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

function authedDb(uid: string, email: string) {
  return testEnv.authenticatedContext(uid, { email }).firestore();
}

function guestDb() {
  return testEnv.unauthenticatedContext().firestore();
}

async function seedChart(options: {
  chartId: string;
  ownerUid?: string;
  inviteToken?: string;
  isDeleted?: boolean;
  editorEmail?: string;
}) {
  const {
    chartId,
    ownerUid = OWNER_UID,
    inviteToken,
    isDeleted = false,
    editorEmail,
  } = options;

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const chartRef = doc(db, "charts", chartId);
    const cellRef = doc(db, "charts", chartId, "cells", "r0c0");

    await setDoc(chartRef, {
      id: chartId,
      ownerUid,
      title: "Initial title",
      ...(inviteToken ? { inviteToken } : {}),
      isDeleted,
      createdAt: NOW,
      updatedAt: NOW,
    });

    await setDoc(cellRef, {
      id: "r0c0",
      rowIndex: 0,
      colIndex: 0,
      body: "Initial body",
      createdAt: NOW,
      updatedAt: NOW,
    });

    if (editorEmail) {
      await setDoc(doc(db, "charts", chartId, "editors", editorEmail), {
        id: editorEmail,
        allowedEmail: editorEmail,
        addedByUid: ownerUid,
        createdAt: NOW,
        updatedAt: NOW,
      });
    }
  });
}

describe("users rules", () => {
  it("allows a user to create and read their own profile", async () => {
    const db = authedDb(OWNER_UID, OWNER_EMAIL);
    const userRef = doc(db, "users", OWNER_UID);

    await assertSucceeds(
      setDoc(userRef, {
        uid: OWNER_UID,
        email: OWNER_EMAIL,
        displayName: "Owner",
        photoURL: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(getDoc(userRef));
  });

  it("rejects writes to another user's profile", async () => {
    const db = authedDb(OTHER_UID, "other@example.com");

    await assertFails(
      setDoc(doc(db, "users", OWNER_UID), {
        uid: OWNER_UID,
        email: OWNER_EMAIL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("charts rules", () => {
  it("allows an owner to query their active charts", async () => {
    await seedChart({ chartId: "owned-chart" });
    await seedChart({ chartId: "deleted-chart", isDeleted: true });

    const db = authedDb(OWNER_UID, OWNER_EMAIL);
    const chartsQuery = query(
      collection(db, "charts"),
      where("ownerUid", "==", OWNER_UID),
      where("isDeleted", "==", false),
      orderBy("updatedAt", "desc"),
    );

    await assertSucceeds(getDocs(chartsQuery));
  });

  it("rejects unauthenticated chart listing", async () => {
    await seedChart({ chartId: "owned-chart" });

    const chartsQuery = query(
      collection(guestDb(), "charts"),
      where("isDeleted", "==", false),
    );

    await assertFails(getDocs(chartsQuery));
  });

  it("allows guest reads for shared active charts", async () => {
    await seedChart({ chartId: "shared-chart", inviteToken: "token-1" });

    await assertSucceeds(getDoc(doc(guestDb(), "charts", "shared-chart")));
    await assertSucceeds(
      getDoc(doc(guestDb(), "charts", "shared-chart", "cells", "r0c0")),
    );
  });

  it("rejects guest reads for deleted shared charts", async () => {
    await seedChart({
      chartId: "deleted-shared-chart",
      inviteToken: "token-1",
      isDeleted: true,
    });

    await assertFails(getDoc(doc(guestDb(), "charts", "deleted-shared-chart")));
    await assertFails(
      getDoc(doc(guestDb(), "charts", "deleted-shared-chart", "cells", "r0c0")),
    );
  });

  it("allows owners to update titles only", async () => {
    await seedChart({ chartId: "owned-chart" });

    const db = authedDb(OWNER_UID, OWNER_EMAIL);
    const chartRef = doc(db, "charts", "owned-chart");

    await assertSucceeds(
      updateDoc(chartRef, {
        title: "Updated title",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(chartRef, {
        ownerUid: OTHER_UID,
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("cell rules", () => {
  it("allows permitted editors to update cells", async () => {
    await seedChart({
      chartId: "editable-chart",
      editorEmail: EDITOR_EMAIL,
    });

    const db = authedDb(EDITOR_UID, EDITOR_EMAIL);

    await assertSucceeds(
      updateDoc(doc(db, "charts", "editable-chart", "cells", "r0c0"), {
        body: "Updated by editor",
        updatedByUid: EDITOR_UID,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("rejects cell updates from users without edit access", async () => {
    await seedChart({ chartId: "locked-chart" });

    const db = authedDb(OTHER_UID, "other@example.com");

    await assertFails(
      updateDoc(doc(db, "charts", "locked-chart", "cells", "r0c0"), {
        body: "Blocked update",
        updatedByUid: OTHER_UID,
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("inviteLinks rules", () => {
  it("allows reads for invite links connected to active charts", async () => {
    await seedChart({ chartId: "shared-chart", inviteToken: "token-1" });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "inviteLinks", "token-1"), {
        token: "token-1",
        chartId: "shared-chart",
        createdByUid: OWNER_UID,
        createdAt: NOW,
      });
    });

    await assertSucceeds(getDoc(doc(guestDb(), "inviteLinks", "token-1")));
  });

  it("rejects reads for invite links connected to deleted charts", async () => {
    await seedChart({
      chartId: "deleted-shared-chart",
      inviteToken: "token-1",
      isDeleted: true,
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "inviteLinks", "token-1"), {
        token: "token-1",
        chartId: "deleted-shared-chart",
        createdByUid: OWNER_UID,
        createdAt: NOW,
      });
    });

    await assertFails(getDoc(doc(guestDb(), "inviteLinks", "token-1")));
  });

  it("rejects listing invite links", async () => {
    await assertFails(getDocs(collection(guestDb(), "inviteLinks")));
  });
});
