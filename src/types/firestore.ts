import type { Timestamp } from "firebase/firestore";

export type UserDocument = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ChartDocument = {
  id: string;
  ownerUid: string;
  title: string;
  inviteToken?: string;
  isDeleted: boolean;
  deletedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CellDocument = {
  id: string;
  rowIndex: number;
  colIndex: number;
  body: string;
  updatedByUid?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type EditorDocument = {
  id: string;
  allowedEmail: string;
  addedByUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type InviteLinkDocument = {
  token: string;
  chartId: string;
  createdByUid: string;
  createdAt: Timestamp;
};

export type CellPosition = {
  rowIndex: number;
  colIndex: number;
};

export type CellId = `r${number}c${number}`;
