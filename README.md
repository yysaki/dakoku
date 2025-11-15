# dakoku

Jobcanの自動打刻と複数のSlackワークスペースへのメッセージ投稿を同時に行うDenoスクリプトです。

## 必要要件

- [Deno](https://deno.land/) 2.0以降
- Node.js（Playwrightのインストールに必要）

## セットアップ

### 1. 依存関係のインストール

```bash
deno cache main.ts
deno run -A npm:playwright install
```

### 2. 設定ファイルのコピー

`.env.example`をコピーして`.env`ファイルを作成します：

```bash
cp .env.example .env
cp config.example.ts config.ts
```

### 3. Slack User Tokenの取得方法

1. [Slack API](https://api.slack.com/apps)にアクセス
2. "Create New App" → "From scratch"を選択
3. "OAuth & Permissions"に移動
4. User Token Scopesに以下を追加：
   - `chat:write`
   - `channels:read`（チャンネル名を使用する場合）
5. 各ワークスペースに"Install to Workspace"でインストール
6. "User OAuth Token"（`xoxp-`で始まるトークン）をコピー
7. `.env`ファイルに追加

## 使い方

### タスク実行

```bash
deno task enter  # 出勤時
deno task leave  # 退勤時
```

### jobcan(playwright)動作確認

```bash
deno task dryrun                          # dryrun実行(playwrightの動作確認)
npx playwright show-trace trace/trace.zip # トレースを取得した場合の表示
```

### ユニットテスト, linter, formatter

```bash
deno test            # ユニットテスト実行
deno test --coverage # テストカバレッジ生成
deno coverage        # テストカバレッジ表示
deno lint            # linter
deno lint --fix      # lint fix
deno fmt             # formatter
```

## ファイル構成

```
.
├── main.ts              # エントリーポイント
├── dakoku.ts            # メインロジック（ドメインモデル）
├── jobcan.ts            # Jobcan自動打刻の実装
├── slack.ts             # Slackメッセージ投稿の実装
├── deno.json            # Deno設定とタスク定義
├── config.ts            # アクション設定(Git管理外)
├── .env                 # 環境変数(Git管理外)
└── dakoku_test.ts       # ユニットテスト
```
