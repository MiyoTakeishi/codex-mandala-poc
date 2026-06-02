import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

import { firebaseApp } from "./app";

export const functions = getFunctions(
  firebaseApp,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "asia-northeast1",
);

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
