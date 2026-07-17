# 税金シミュレーション&専門家相談ポータル(デモ)

不動産×IT企業様向け提案モック。Web上で税金(不動産売却・相続・贈与・家賃収入)を概算し、
AIアドバイスを表示、専門家(税理士・司法書士・FP・弁護士)を利用者が指名して相談を申し込めるポータル。

## 開発

```bash
npm install
npm run dev
```

## ビルド(公開ディレクトリへ出力)

```bash
npm run build   # → ../../tax-simulation/ に出力
```

- 税計算ロジック: `src/lib/tax.ts`(概算・デモ用)
- AIアドバイス生成: `src/lib/advice.ts`(ルールベース)
- 専門家ダミーデータ: `src/data/experts.ts`
- 状態管理: zustand + localStorage 永続化(`src/store/useStore.ts`)
