# Portfolio React

モダンフロントエンド技術（Next.js / React / TypeScript）で再構築した、個人ポートフォリオサイトです。  
公開ギャラリー・本番管理画面・採用担当者向けデモモードを URL 単位で分離し、**「本番データを汚さずに体験してもらう」** という運用要件を、コードとインフラの両面で満たす構成を採用しています。

---

## 概要

本リポジトリは、従来の静的ポートフォリオを App Router ベースの Next.js アプリケーションへ移行したものです。  
作品データは `src/data/works.json` を正とし、画像はサーバー側で複数サイズに変換して `public/images/` に配置します。

採用面接やカジュアル面談において、リードエンジニアが **管理画面の操作感・拡張性・リスク配慮** をその場で確認できるよう、デモ専用ルート（`/demo` / `/demo/admin`）を設けています。

---

## Features

### 1. 採用担当者向けデモモード（お試し機能）

| ルート | 用途 | 認証 | データ保存先 |
|---|---|---|---|
| `/` | 本番ギャラリー | 不要 | `works.json` + 静的画像 |
| `/admin/**` | 本番管理 | 必須（Cookie セッション） | サーバー（JSON + ファイル） |
| `/demo` | デモギャラリー | 不要 | ブラウザ `localStorage` |
| `/demo/admin/**` | デモ管理 | 不要 | ブラウザ `localStorage` |

**設計意図**

採用担当者に管理画面を触ってもらう際、本番の `works.json` や画像ファイルを書き換えるリスクは許容できません。  
そこでデモモードでは、サーバーへの永続化を行わず、クライアントの `localStorage` にのみ状態を保持する **サンドボックス構成** を採用しました。

- 初回アクセス時は `works.json` の直近 **20 件** をシードデータとして投入
- 画像アップロードは Canvas API で **横幅 720px / JPEG 70%** に圧縮し、Base64 Data URL として保存
- `QuotaExceededError`（localStorage 容量上限）を捕捉し、ユーザーへ明示的に通知
- 「リセット」操作で初期状態へ復帰可能

この設計により、**サーバーを汚さない**・**ブラウザの 5MB 制限内に収める**・**面接官が安全に CRUD を試せる** という三つの要件を同時に満たしています。

```
┌─────────────────────────────────────────────────────────┐
│  本番パス                    デモパス                    │
│  /admin → Server Actions    /demo/admin → Client only   │
│         → works.json                 → localStorage     │
│         → sharp (画像変換)           → Canvas (圧縮)     │
└─────────────────────────────────────────────────────────┘
```

### 2. 本番管理画面の認証分離

本番管理の ID / パスワードは `.env.local` で管理し、リポジトリにはテンプレート（`.env.example`）のみを含めます。  
環境変数が未設定の場合はログインを無効化し、ハードコードされたフォールバック値は設けていません。

### 3. ギャラリー UI の共通化

`components/gallery-view.tsx` に表示ロジックを集約し、本番（`/`）とデモ（`/demo`）で同一 UI を再利用しています。  
デモ固有のデータソース差分は Context（`AdminGalleryProvider`）とカスタムフック（`useGalleryData`）で吸収しています。

### 4. 本番画像パイプライン（sharp）

本番アップロード時はサーバー側で以下のバリアントを生成します。

| 用途 | 最大サイズ | 品質 |
|---|---|---|
| `big/`（PC 表示） | 1600px 幅 | JPEG 90% |
| `sp/`（スマホ） | 1200px 幅 | JPEG 88% |
| `small/`（サムネ） | 320×180（cover） | JPEG 86% |

デモと本番で画像処理の責務を明確に分離し、それぞれの制約（ディスク容量 vs. localStorage 5MB）に最適化しています。

---

## Tech Stack

| カテゴリ | 技術 |
|---|---|
| Framework | Next.js 16（App Router） |
| UI | React 19 |
| Language | TypeScript 5.x |
| 画像処理（本番） | sharp |
| 画像処理（デモ） | Canvas API（クライアント） |
| 認証 | Cookie ベースセッション + 環境変数 |
| ホスティング | Vercel |
| Lint | ESLint（eslint-config-next） |
| Runtime | Node.js 20.9+（`.nvmrc` で固定） |

---

## Getting Started

### 前提

- Node.js 20.9 以上（`nvm use` 推奨）

### セットアップ

```bash
git clone git@github.com:expogewinnt/portofolio-react.git
cd portofolio-react
npm install

cp .env.example .env.local
# .env.local を編集（本番管理画面の認証情報）
```

### 開発サーバー

```bash
npm run dev
```

| URL | 説明 |
|---|---|
| http://localhost:3000 | 本番ギャラリー |
| http://localhost:3000/admin | 本番管理（要ログイン） |
| http://localhost:3000/demo | デモギャラリー |
| http://localhost:3000/demo/admin | デモ管理 |

### スクリプト

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド（型チェック含む）
npm run start      # 本番サーバー
npm run lint       # ESLint
npm run typecheck  # TypeScript（tsc --noEmit）
npm run test       # Vitest（ユニットテスト）
npm run test:e2e   # Playwright（E2Eスモーク）
```

---

## 品質保証と CI/CD

`.github/workflows/ci.yml` で、push / PR 時に以下の品質ゲートを実行します。

```
┌──────────┐    ┌─────────────────────────────────────┐    ┌─────────┐
│  Push /  │───▶│  GitHub Actions                     │───▶│ Vercel  │
│  PR      │    │  1. ESLint                          │    │ Deploy  │
└──────────┘    │  2. TypeScript (tsc / next build)   │    └─────────┘
                │  3. Vitest（ユニットテスト）           │
                │  4. Playwright（E2E）                │
                └─────────────────────────────────────┘
```

| レイヤー | 目的 |
|---|---|
| **Lint** | コーディング規約・潜在的バグの早期検出 |
| **Type check** | 型安全性の担保（ビルド時に検証） |
| **Vitest** | ユーティリティ層の単体テスト（11本） |
| **Playwright** | `/` と `/demo` の表示スモーク（1本） |
| **Vercel** | main ブランチマージ後の自動デプロイ |

デモモードのような **クライアント完結型の機能** は、ブラウザ API（`localStorage` / Canvas）への依存が強いため、Vitest ではロジック層、Playwright では実ブラウザ上の動作を分担して検証する方針です。

---

## Future Architecture

現在は Vercel ホスティングで運用コストとデプロイ速度を最適化していますが、以下の要件が顕在化した際には AWS への段階的移行を視野に入れています。

| フェーズ | 想定構成 | 移行トリガー |
|---|---|---|
| **現行** | Vercel + GitHub Actions | 個人ポートフォリオ・低トラフィック |
| **Phase 1** | S3（静的アセット）+ CloudFront | 画像配信の CDN 最適化・帯域コスト管理 |
| **Phase 2** | AWS Amplify または ECS/Fargate | 認証基盤の強化・社内 SSO 連携 |
| **Phase 3** | RDS / DynamoDB + API Gateway | マルチユーザー管理・監査ログ要件 |

特に本番管理画面については、現行のファイルベース永続化（`works.json` + ローカル画像）から、オブジェクトストレージ + メタデータ DB への移行パスを想定しています。デモモードで検証した CRUD フローと UI は、そのまま API 層の差し替え先として再利用可能な設計にしています。

---

## Project Structure

```
app/
  page.tsx                 # 本番ギャラリー
  admin/                   # 本番管理（認証必須）
  demo/                    # デモギャラリー + デモ管理
components/
  gallery-view.tsx         # ギャラリー UI（本番・デモ共通）
  admin/                   # 管理画面コンポーネント
hooks/
  use-gallery-data.ts      # デモ用 CRUD + localStorage 永続化
lib/
  works-store.ts           # 本番データ層（server-only, sharp）
  gallery-storage.ts       # デモ用 localStorage 層
  gallery-image.ts         # デモ用クライアント画像圧縮
  admin-config.ts          # 認証設定（環境変数）
```

---

## License

Private — 採用選考・技術評価目的での閲覧を想定しています。
