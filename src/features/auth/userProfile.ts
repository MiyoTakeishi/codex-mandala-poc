import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { firestore } from "../../firebase/firestore";
import type { UserDocument } from "../../types/firestore";

type UserProfileInput = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
};

function toUserProfileInput(user: User): UserProfileInput | null {
  if (!user.email) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email.trim().toLowerCase(),
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export async function upsertUserProfile(user: User) {
  const profile = toUserProfileInput(user);

  if (!profile) {
    throw new Error("Googleアカウントのメールアドレスを取得できませんでした。");
  }

  const userRef = doc(firestore, "users", profile.uid);
  const snapshot = await getDoc(userRef);
  const userData = {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    updatedAt: serverTimestamp(),
  } satisfies Omit<UserDocument, "createdAt" | "updatedAt"> & {
    updatedAt: ReturnType<typeof serverTimestamp>;
  };

  if (snapshot.exists()) {
    await updateDoc(userRef, userData);
    return;
  }

  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
  });
}
