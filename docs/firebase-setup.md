# Firebase手動設定手順

Phase 0ではFirebaseコンソール上の設定は実施しない。以下を手動で設定する。

## 1. Firebaseプロジェクト作成

必要なデータ:

- FirebaseプロジェクトID
- Firebaseプロジェクト名
- Google Analyticsを有効化するかどうか

手順:

1. Firebaseコンソールで新規プロジェクトを作成する。
2. プロジェクトIDを控える。
3. `.firebaserc` の `your-firebase-project-id` を実際のプロジェクトIDに置き換える。

## 2. Webアプリ登録

必要なデータ:

- Firebase Webアプリの設定値
  - apiKey
  - authDomain
  - projectId
  - storageBucket
  - messagingSenderId
  - appId
  - measurementId

手順:

1. FirebaseコンソールでWebアプリを追加する。
2. 表示されたFirebase設定値を控える。
3. `.env.example` を参考に `.env.local` を作成し、`VITE_FIREBASE_*` に設定値を入れる。

## 3. Authentication

必要なデータ:

- Googleログインを許可するサポートメール
- 承認済みドメイン
  - localhost
  - Firebase Hostingドメイン
  - 独自ドメインを使う場合はそのドメイン

手順:

1. Firebase Authenticationを開始する。
2. Sign-in methodでGoogleプロバイダを有効化する。
3. 承認済みドメインに必要なドメインを追加する。

## 4. Cloud Firestore

必要なデータ:

- Firestoreロケーション

手順:

1. Cloud Firestoreを作成する。
2. 本番モードで開始する。
3. `npm run emulators` でローカル検証できることを確認する。

## 5. Firebase Hosting

必要なデータ:

- Firebase Hostingサイト名
- FirebaseプロジェクトID
- Firebase Hostingの公開URL

手順:

1. Firebase Hostingを有効化する。
2. SPAルーティングは `firebase.json` のrewritesで `index.html` に向ける。
3. デプロイ時は `npm run build` 後に `firebase deploy --only hosting` を実行する。

現在のリポジトリ設定:

- FirebaseプロジェクトID: `bpapp-354eb`
- Firebase Hosting site: `codex-mandala-poc`
- 公開ディレクトリ: `dist`

## 6. MVP Hostingデプロイ前チェック

デプロイ前に、ローカルで以下を確認する。

```bash
npm run build
npm run test:rules
npm run test:e2e
npm --prefix functions run build
```

補足:

- `npm run test:e2e` の初回実行前、または別PCで初めて実行する場合は `npm run test:e2e:install` を実行する。
- `npm run lint` は、現時点ではESLint設定ファイルが未作成のため実行対象外とする。
- `test:rules` と `test:e2e` はFirebase Emulatorを使うため、本番Firestoreのデータは変更しない。

## 7. MVP Hostingデプロイ手順

必要なデータ:

- Firebase CLIで `bpapp-354eb` にログイン済みであること。
- `.env.local` に本番Firebase Webアプリ設定が入っていること。
- Firebase Hostingサイト `codex-mandala-poc` が有効化済みであること。
- Firebase Authenticationの承認済みドメインにHostingドメインが含まれていること。

手順:

1. デプロイ対象ブランチが最新であることを確認する。
2. `npm run build` を実行する。
3. 必要に応じてFirestore RulesとIndexesを反映する。

```bash
npx firebase deploy --only firestore:rules
npx firebase deploy --only firestore:indexes
```

4. Hostingへデプロイする。

```bash
npx firebase deploy --only hosting
```

5. デプロイ後、Firebase CLIに表示されたHosting URLを開いて動作確認する。

デプロイ後に確認すること:

- Googleログインできる。
- 作成者がチャート一覧を表示できる。
- チャート詳細を開ける。
- タイトルとセルを保存できる。
- 招待リンクを発行し、ゲスト閲覧できる。
- 許可済み編集者が招待リンクから編集できる。
- チャート削除後、一覧と招待リンクから閲覧できない。

## 8. Emulator Suite

ローカル起動:

```bash
npm run emulators
```

フロントエンドからEmulatorに接続する場合は `.env.local` に以下を設定する。

```bash
VITE_USE_FIREBASE_EMULATORS=true
```
