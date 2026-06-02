# マンダラチャート共有アプリ 実装計画書

## 1. 前提

- 本計画書は `docs/requirements.md` と `docs/basic-design.md` を元に作成する。
- 実装はまだ行わない。
- 技術構成は、普段利用しているFirebase構成に合わせる。
- MVPではGoogleログイン、作成者向けチャート一覧、9x9チャート編集、招待リンク閲覧、編集者管理、論理削除を対象とする。

## 2. 技術スタック

### 2.1 採用スタック

| 領域 | 技術 | 用途 |
| --- | --- | --- |
| フロントエンド | React | 画面、コンポーネント、9x9チャートUIを実装する。 |
| 言語 | TypeScript | 型安全に画面・Firebase操作を実装する。 |
| ビルド | Vite | Reactアプリの開発・ビルドを行う。 |
| UI | Chakra UI | ボタン、フォーム、モーダル、トースト、レイアウトを実装する。 |
| 認証 | Firebase Authentication | Googleログインを実装する。 |
| DB | Cloud Firestore | チャート、セル、編集者権限、招待リンクを保存する。 |
| ホスティング | Firebase Hosting | Viteのビルド成果物を配信する。 |
| 補助バックエンド | Cloud Functions for Firebase | 81セル初期作成、招待リンク発行、編集者管理、論理削除などを安全に実行する。 |
| セキュリティ | Firestore Security Rules | クライアントからの読み書き権限を制御する。 |
| ローカル開発 | Firebase Emulator Suite | Auth、Firestore、Functions、Hostingをローカルで検証する。 |
| テスト | Vitest, React Testing Library | ユーティリティとUI部品を検証する。 |
| E2E | Playwright | 主要フローをブラウザで検証する。 |

### 2.2 追加候補のGoogle/Firebaseサービス

| サービス | 初期リリースでの扱い | 用途 |
| --- | --- | --- |
| Firebase App Check | 推奨 | 不正なクライアントからのFirebaseアクセスを抑制する。 |
| Google Analytics for Firebase | 任意 | 利用状況の把握。MVP検証に使える。 |
| Firebase Performance Monitoring | 任意 | 初期表示やFirestore操作の性能確認。 |
| Cloud Logging | Cloud Functions利用時に使用 | Functionsのエラー調査。 |
| Firebase App Hosting | 対象外 | React/Viteの静的配信はFirebase Hostingで十分。 |
| Cloud Storage for Firebase | 対象外 | 画像・添付ファイルが初期リリース対象外のため不要。 |
| Firebase Cloud Messaging | 対象外 | 通知機能が対象外のため不要。 |

### 2.3 補足

- UIはChakra UIを基本とし、9x9チャート部分は必要に応じてCSS Gridを直接利用する。
- Firebase HostingでSPAルーティングを行うため、リライト設定で全パスを `index.html` に向ける。
- 招待リンクトークンはCloud Functions側で暗号学的に安全な乱数として生成する。
- セル本文はテキストとして扱い、HTMLとして描画しない。

## 3. ディレクトリ構成

```text
.
├── docs/
│   ├── requirements.md
│   ├── basic-design.md
│   └── implementation-plan.md
├── functions/
│   ├── src/
│   │   ├── index.ts
│   │   ├── callable/
│   │   │   ├── createChart.ts
│   │   │   ├── deleteChart.ts
│   │   │   ├── createInviteLink.ts
│   │   │   ├── addEditor.ts
│   │   │   ├── removeEditor.ts
│   │   │   └── verifyEditorAccess.ts
│   │   ├── lib/
│   │   │   ├── admin.ts
│   │   │   ├── auth.ts
│   │   │   ├── tokens.ts
│   │   │   └── validation.ts
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── features/
│   │   ├── auth/
│   │   ├── charts/
│   │   ├── share/
│   │   └── editors/
│   ├── components/
│   │   ├── chart/
│   │   ├── layout/
│   │   └── feedback/
│   ├── firebase/
│   │   ├── app.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   └── functions.ts
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   ├── styles/
│   └── main.tsx
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 3.1 構成方針

- `src/` はReact/Viteアプリ本体。
- `functions/` はCloud Functions for Firebase。
- `firestore.rules` にSecurity Rulesを定義する。
- `firestore.indexes.json` にFirestoreインデックスを定義する。
- MVPでは単一リポジトリ構成とし、過度なmonorepo化は行わない。

## 4. 実装順序

### Phase 0: Firebaseプロジェクト基盤

1. Vite + React + TypeScriptプロジェクトを作成する。
2. Chakra UIを導入する。
3. Firebase SDKを導入する。
4. Firebaseプロジェクトを作成する。
5. Firebase AuthenticationでGoogleプロバイダを有効化する。
6. Cloud Firestoreを作成する。
7. Firebase Hostingを設定する。
8. Firebase Emulator Suiteを設定する。

成果物:

- Reactアプリが起動する。
- Firebase EmulatorでAuth/Firestore/Functions/Hostingを起動できる。

### Phase 1: 認証

1. Firebase初期化コードを作成する。
2. Googleログインを実装する。
3. ログアウトを実装する。
4. Auth状態監視を実装する。
5. 初回ログイン時に `users/{uid}` を作成する。
6. ログイン失敗時のエラー表示を実装する。

成果物:

- Googleログインでアプリに入れる。
- ユーザー情報がFirestoreに保存される。

### Phase 2: Firestoreデータモデル・Rules

1. `users`, `charts`, `cells`, `editors`, `inviteLinks` の型を定義する。
2. Firestore Security Rulesの初期版を作成する。
3. Firestoreインデックスを定義する。
4. Emulator上でRulesテストを作成する。

成果物:

- 作成者・編集者・ゲストの基本的な読み書き制御ができる。

### Phase 3: チャート作成・一覧

1. `createChart` callable functionを実装する。
2. チャート作成上限5件を検証する。
3. 9x9分の81セル初期作成を実装する。
4. 作成中ローディング表示を実装する。
5. 作成者向けチャート一覧を実装する。
6. チャート詳細取得を実装する。

成果物:

- ログイン済みユーザーがチャートを作成できる。
- 作成者が自分のチャート一覧を閲覧できる。

### Phase 4: 作成者向け編集

1. 9x9チャート表示コンポーネントを実装する。
2. チャートタイトル編集を実装する。
3. セル編集UIを実装する。
4. フォーカスアウト時のFirestore保存を実装する。
5. 保存中、保存済み、保存失敗表示を実装する。
6. サーバー時刻基準の `updatedAt` 更新を実装する。

成果物:

- 作成者が自分のチャートタイトルとセルを編集できる。

### Phase 5: 招待リンク・ゲスト閲覧

1. `createInviteLink` callable functionを実装する。
2. 招待リンクトークン生成を実装する。
3. 共有設定画面を実装する。
4. 招待リンク未発行・発行済み状態を表示する。
5. コピー成功・失敗表示を実装する。
6. `/share/:token` 画面を実装する。
7. ゲスト閲覧用のFirestore取得を実装する。
8. 削除済み・不正トークン時のエラー表示を実装する。

成果物:

- 招待リンクを知っているユーザーがゲストとしてチャートを閲覧できる。

### Phase 6: 編集者管理・権限確認

1. `addEditor` callable functionを実装する。
2. `removeEditor` callable functionを実装する。
3. `verifyEditorAccess` callable functionを実装する。
4. 編集者一覧表示を実装する。
5. 編集者追加・削除UIを実装する。
6. メールアドレス形式チェック、重複チェック、上限チェックを実装する。
7. 招待リンク画面で編集アクション時のGoogleログイン導線を実装する。
8. 許可メールアドレスとGoogleメールアドレス不一致時のエラー表示を実装する。
9. 編集者削除後の保存失敗時にゲスト閲覧状態へ戻す処理を実装する。

成果物:

- 作成者が編集者を管理できる。
- 許可済みGoogleメールアドレスのユーザーだけが招待リンクから編集できる。

### Phase 7: チャート削除・仕上げ

1. `deleteChart` callable functionを実装する。
2. 論理削除後の一覧非表示を実装する。
3. 論理削除後の招待リンク閲覧不可を実装する。
4. 確認ダイアログと削除成功・失敗表示を実装する。
5. スマートフォン閲覧表示を調整する。
6. PC/タブレットの9x9編集UIを調整する。
7. 主要フローのE2Eテストを追加する。
8. Firebase Hostingへデプロイする。

成果物:

- MVPとして一連の利用フローがFirebase Hosting上で確認できる。

## 5. 工数見積もり

### 5.1 前提

- 1人日 = 6から8時間程度。
- 実装者がReact/TypeScript/Firebaseに慣れている前提。
- Firebaseプロジェクト作成、Googleログイン設定、Firestore Rules調整で詰まる可能性を見込む。

### 5.2 概算

| フェーズ | 内容 | 見積もり |
| --- | --- | --- |
| Phase 0 | Firebaseプロジェクト基盤 | 1.0から1.5人日 |
| Phase 1 | 認証 | 1.0から1.5人日 |
| Phase 2 | Firestoreデータモデル・Rules | 1.5から2.5人日 |
| Phase 3 | チャート作成・一覧 | 1.5から2.5人日 |
| Phase 4 | 作成者向け編集 | 2.0から3.0人日 |
| Phase 5 | 招待リンク・ゲスト閲覧 | 1.5から2.5人日 |
| Phase 6 | 編集者管理・権限確認 | 2.0から3.0人日 |
| Phase 7 | チャート削除・仕上げ | 1.5から2.5人日 |
| テスト・不具合修正 | Rules/E2E/手動確認 | 2.0から3.0人日 |

合計:

- 最短: 約14人日
- 標準: 約18人日
- 余裕込み: 約22人日

### 5.3 優先度別リリース候補

| 優先度 | 対象 |
| --- | --- |
| P0 | Googleログイン、チャート作成、81セル初期作成、作成者一覧、9x9表示、作成者セル編集、自動保存 |
| P1 | チャートタイトル編集、チャート削除、招待リンク、ゲスト閲覧 |
| P2 | 編集者追加・削除、編集アクション時の権限確認 |
| P3 | コピー失敗時の手動コピー、スマートフォン閲覧調整、詳細なエラー表示、Rulesテスト拡充 |

## 6. リスク

### 6.1 Firebase Authentication

| リスク | 内容 | 対策 |
| --- | --- | --- |
| Googleログイン設定の詰まり | 承認済みドメインやOAuth設定で詰まる可能性がある。 | Phase 0でFirebase Hostingドメインとローカルドメインを設定する。 |
| リダイレクト復帰 | 招待リンクからログインした後に元の `/share/:token` へ戻す必要がある。 | ログイン前に戻り先URLを保持する。 |
| メールアドレス判定の揺れ | 大文字小文字や空白で一致しない可能性。 | メールアドレスは小文字化・前後空白除去して保存・比較する。 |

### 6.2 Firestore Security Rules

| リスク | 内容 | 対策 |
| --- | --- | --- |
| Rulesが複雑化する | 作成者、編集者、ゲスト閲覧の条件が混在する。 | 書き込み系はFunctions経由に寄せ、Rulesは読み取りとセル更新中心に絞る。 |
| Rulesの抜け漏れ | フロントから直接Firestoreへアクセスするため、Rulesミスが権限漏れになる。 | EmulatorでRulesテストを作る。 |
| ゲスト閲覧の公開範囲 | 招待リンクを知っていれば誰でも読める。 | 機密情報を入力しない前提を画面にも表示する。 |

### 6.3 Cloud Functions

| リスク | 内容 | 対策 |
| --- | --- | --- |
| Functions追加による工数増 | Firebaseのみのクライアント実装より実装対象が増える。 | 上限チェック、81セル作成、トークン生成など安全性が必要な処理だけに限定する。 |
| ローカル検証の手間 | Emulator設定が必要。 | Phase 0でEmulator起動を最初に整備する。 |
| リージョン設定 | Functionsリージョンとフロントの呼び出し設定がずれる可能性。 | リージョンを1つに固定し、定数化する。 |

### 6.4 データ整合性

| リスク | 内容 | 対策 |
| --- | --- | --- |
| 81セル初期作成失敗 | チャートだけ作られてセルが欠ける可能性。 | Functions内でbatched writeを使い、一括失敗させる。 |
| 後勝ち保存による上書き | 同時編集で前の編集が失われる。 | 要件通り復旧不可とし、保存時刻はFirestoreのサーバータイムスタンプに統一する。 |
| 編集者削除後の保存 | 削除済み編集者が画面を開き続けて保存する可能性。 | セル更新時にRulesで毎回編集者権限を確認する。 |

### 6.5 UI/UX

| リスク | 内容 | 対策 |
| --- | --- | --- |
| 9x9 UIの視認性 | 81セルは画面密度が高い。 | PC/タブレット編集を優先し、スマホは閲覧中心にする。 |
| フォーカスアウト保存の分かりづらさ | 保存タイミングが明示的でない。 | 保存中、保存済み、保存失敗の状態を表示する。 |
| Chakra UIだけでは9x9が窮屈 | 汎用コンポーネントだけではチャート表示が難しい可能性。 | チャート本体はCSS Gridで専用実装する。 |

## 7. 実装前に決めること

1. Cloud Functionsを追加採用する方針でよいか。
2. Firebaseプロジェクト名、Hostingドメイン、Googleログインの承認済みドメインをどうするか。
3. Functionsのリージョンをどこにするか。
4. タイトルとセル本文の最大文字数をどうするか。
5. 招待リンクトークンの長さと形式をどうするか。
6. App Checkを初期リリースで有効化するか。

