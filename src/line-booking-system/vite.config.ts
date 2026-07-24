import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",                  // 必須: GitHub Pages はサブパス配信
  build: {
    outDir: "../../line-booking-system",   // 必須: 公開ディレクトリへ直接出力
    emptyOutDir: true,
  },
});
