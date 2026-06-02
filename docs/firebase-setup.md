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

手順:

1. Firebase Hostingを有効化する。
2. SPAルーティングは `firebase.json` のrewritesで `index.html` に向ける。
3. デプロイ時は `npm run build` 後に `firebase deploy --only hosting` を実行する。

## 6. Emulator Suite

ローカル起動:

```bash
npm run emulators
```

フロントエンドからEmulatorに接続する場合は `.env.local` に以下を設定する。

```bash
VITE_USE_FIREBASE_EMULATORS=true
```
