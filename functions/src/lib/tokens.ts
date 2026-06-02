import { randomBytes } from "crypto";

import { INVITE_TOKEN_BYTES } from "./constants";

export function generateInviteToken() {
  return randomBytes(INVITE_TOKEN_BYTES).toString("base64url");
}
