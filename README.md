# customer-demo-apps

受託開発の**モック(デモアプリ)を顧客に共有するためのリポジトリ**です。
GitHub Pages でホスティングし、顧客ごとのディレクトリ URL を直接共有します。

## 🌐 公開 URL

```
https://<owner>.github.io/customer-demo-apps/            ← デモ一覧(パスワード保護・社内用)
https://<owner>.github.io/customer-demo-apps/<顧客名>/   ← 顧客に渡す URL
```

## 📁 ディレクトリ構成

```
customer-demo-apps/
├── index.html        # デモ一覧ページ(パスワード保護・社内用)
├── .nojekyll         # GitHub Pages で Jekyll 処理を無効化
├── CLAUDE.md         # AI 向け開発ルール(モック作成の憲法)
├── README.md         # このファイル
├── customerA/        # 顧客ごとにディレクトリを分ける
│   └── index.html    # 各ディレクトリ直下に必ず index.html を置く
└── customerB/
    ├── index.html
    └── assets/       # 画像等はディレクトリ内に閉じる
```

## 📏 運用ルール

### 1. 顧客ごとにディレクトリを分ける

- ディレクトリ名は **英小文字ケバブケース**(例: `acme-corp`, `sakura-clinic`)
- 1 顧客 = 1 ディレクトリ。同一顧客の複数デモはサブディレクトリで分ける
  (例: `acme-corp/reservation/`, `acme-corp/dashboard/`)
- 各デモのエントリポイントは必ず `index.html`(ディレクトリ URL だけで開けるように)

### 2. 顧客への共有

- 顧客には **ディレクトリの URL を直接渡す**(例: `https://<owner>.github.io/customer-demo-apps/customerA/`)
- 顧客のデモページ自体にはパスワードを掛けない(URL を知っている人だけが見られる運用)
- デモページから他顧客のディレクトリや一覧ページへ**リンクしない**

### 3. デモ一覧(`index.html`)

- ルートの `index.html` は全デモの一覧ページ(社内・関係者用)
- **パスワードを知っている人だけが閲覧可能**(SHA-256 ハッシュ照合、パスワード平文はコードに含めない)
- 新しいデモを追加したら、`index.html` 内の `DEMOS` 配列に 1 エントリ追加する

### 4. 技術ルール(詳細は [CLAUDE.md](./CLAUDE.md))

- **静的ファイルのみ**(GitHub Pages で動くこと)。サーバーサイド処理・DB は使えない
- リンク・アセット参照は**相対パス**(GitHub Pages はサブパス配信のため絶対パス `/...` は壊れる)
- 機密情報(API キー・実データ・顧客の内部情報)は**絶対にコミットしない**。データはすべてダミー

### 5. デモの削除・アーカイブ

- 案件終了後、公開を止めたいデモはディレクトリごと削除(Git 履歴には残る点に注意)
- 完全に消したい機密が入ってしまった場合は履歴の書き換えが必要(そもそも入れない)

## 🚀 新しいデモの追加手順

1. `mkdir <顧客名>` してディレクトリを作成
2. `<顧客名>/index.html` にモックを作成(作り方は [CLAUDE.md](./CLAUDE.md) 参照)
3. ルート `index.html` の `DEMOS` 配列にエントリを追加
4. コミット & `main` にプッシュ → 数分で GitHub Pages に反映
5. `https://<owner>.github.io/customer-demo-apps/<顧客名>/` を顧客に共有

## ⚠️ セキュリティ上の注意

- パスワード保護は**クライアントサイドの簡易的なゲート**です(静的サイトの制約)。
  一覧ページの閲覧ハードルにはなりますが、本気の攻撃者を防ぐものではありません
- したがって、**リポジトリ・デモに機密情報を置かないことが大前提**です
- パスワードを変更する場合: 新パスワードの SHA-256 ハッシュを生成し、`index.html` の `PASSWORD_HASH` を差し替える

  ```bash
  printf '新しいパスワード' | shasum -a 256
  ```

## GitHub Pages の設定

リポジトリの **Settings → Pages → Source** で `main` ブランチ / `/ (root)` を指定。
