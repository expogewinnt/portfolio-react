# microCMS 連携 実装計画（パターン B）

自作 `/admin` UI を維持したまま、本番データの保存先を microCMS に切り替える計画です。  
**デモモード（`/demo` / `/demo/admin`）は localStorage のまま変更しません。**

---

## 1. ゴール

| 項目 | 内容 |
|---|---|
| 維持するもの | `/admin` の UI/UX、認証、デモモード全体 |
| 変更するもの | 本番ギャラリー `/` と本番管理 `/admin` のデータ層 |
| ローカル確認 | `.env.local` に microCMS 設定 → `npm run dev` で検証 |
| Vercel 本番 | 同じ環境変数を Vercel に設定すれば CRUD 可能 |

---

## 2. アーキテクチャ

```
┌────────────────────────────────────────────────────────────┐
│ microCMS（API ID: works）                                   │
│  - title（テキスト）                                        │
│  - charge（テキストエリア）                                  │
│  - image（画像）                                            │
└───────────────┬────────────────────────────────────────────┘
                │
        readWorks() / CRUD
                │
    ┌───────────┴────────────┐
    ▼                          ▼
 / (本番ギャラリー)        /admin (自作管理UI)
                                │
                         Server Actions
                                │
                    microCMS API / Media API

/demo / /demo/admin  → localStorage（影響なし）
```

### フォールバック

`MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` が **未設定** のときは、従来どおり `works.json` + `public/images/` を使用します。  
microCMS 未契約の状態でもローカル開発は今まで通り動きます。

---

## 3. microCMS 側のセットアップ

### 3-1. サービス作成

1. [microCMS](https://microcms.io/) でアカウント作成
2. 新規サービスを作成（例: `portfolio-react`）
3. **サービスドメイン** を控える（例: `portfolio-react`）

### 3-2. API スキーマ作成

**API 名（エンドポイント）:** `works`  
**API 種類:** リスト形式  
**フィールド:**

| フィールドID | 種類 | 必須 | 備考 |
|---|---|---|---|
| `title` | テキストフィールド | ✅ | 作品タイトル（アプリ側 `ttl`） |
| `charge` | テキストエリア | ✅ | 担当内容 |
| `image` | 画像 | ✅ | サムネ・拡大表示の元画像 |

> フィールド ID はコードと一致させてください（`title` / `charge` / `image`）。

### 3-3. API キー発行

**設定 → API キー** で以下を用意:

| 用途 | 権限 |
|---|---|
| ローカル開発・Vercel 本番 | **読み取り + 書き込み + メディアアップロード** |

---

## 4. 環境変数

`.env.local` に追記:

```env
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-write-api-key
```

| 変数 | 例 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | `portfolio-react`（`.microcms.io` は含めない） |
| `MICROCMS_API_KEY` | microCMS 管理画面で発行したキー |

Vercel 本番でも同じキーを **Environment Variables** に設定します。

---

## 5. ローカル確認手順

### Step A: microCMS なし（現状確認）

```bash
npm run dev
```

- `/` ギャラリー表示
- `/admin` ログイン → 更新（`works.json` モード）
- `/demo/admin` デモ CRUD

Dashboard の Storage 表示が `works.json` になっていれば OK。

### Step B: 既存データを microCMS へ移行

```bash
npm run migrate:microcms
```

- `src/data/works.json` の 95 件を読み込み
- `public/images/big/` の画像をアップロード
- microCMS `works` API に登録

> 初回のみ実行。2 回目以降は重複登録されるので注意。

### Step C: microCMS モードで確認

`.env.local` に microCMS 変数を設定した状態で:

```bash
npm run dev
```

| 確認項目 | URL | 期待結果 |
|---|---|---|
| Storage 表示 | `/admin` | `microCMS` |
| ギャラリー | `/` | microCMS の作品が表示 |
| 作品更新 | `/admin/works/{id}` | タイトル・Credit 更新が成功 |
| 新規作成 | `/admin/works/new` | 画像アップロード付きで登録 |
| デモ | `/demo/admin` | 従来どおり localStorage で動作 |

---

## 6. 実装ファイル一覧

| ファイル | 責務 |
|---|---|
| `lib/cms-config.ts` | microCMS 設定の有無判定 |
| `lib/microcms-client.ts` | microCMS / Media API 呼び出し |
| `lib/microcms-image.ts` | CDN 画像のサイズ別 URL 生成 |
| `lib/works-store-local.ts` | 従来のファイル永続化 |
| `lib/works-store.ts` | 保存先の切り替え（facade） |
| `scripts/import-works-to-microcms.mjs` | 初回インポート |
| `app/admin/actions.ts` | microCMS / local 両対応 CRUD |

---

## 7. デモモードへの影響

| 項目 | 影響 |
|---|---|
| `/demo/admin` の CRUD | なし（localStorage） |
| `/demo` の UI | なし |
| 初回シードデータ | `readWorks()` 経由で microCMS から取得（件数・内容が CMS 側に同期） |

デモの「本番を汚さない」設計は維持されます。

---

## 8. 画像の扱い

| モード | 画像処理 |
|---|---|
| local（従来） | sharp で big / small / sp を生成 |
| microCMS | 1 枚アップロード → CDN クエリでリサイズ（`?w=320` 等） |

---

## 9. トラブルシュート

| 症状 | 原因 | 対処 |
|---|---|---|
| Dashboard が `works.json` のまま | 環境変数未設定 | `.env.local` を確認し dev サーバー再起動 |
| `microCMS への保存に失敗` | API キー権限不足 | 書き込み + メディア権限のキーを使う |
| インポート失敗 | 画像ファイル欠損 | `public/images/big/{img}` の存在を確認 |
| デモが動かない | 通常は無関係 | `/demo` は localStorage のみ |

---

## 10. 今後の拡張（任意）

- 編集画面での画像差し替え（PATCH + Media API）
- Webhook 連携で Vercel ISR 再生成
- Preview 環境と Production の API キー分離
