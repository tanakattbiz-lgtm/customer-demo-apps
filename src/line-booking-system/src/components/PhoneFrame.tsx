import { type ReactNode } from "react";

/**
 * スマホ実機風のフレーム。PC では枠付きで中央に、モバイル幅では画面いっぱいに表示。
 * 「LINE の中でそのまま動く予約画面」という提案の世界観を伝えるための器。
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <>
      {/* モバイル: フレームなしで全画面 */}
      <div className="flex min-h-screen flex-col bg-white sm:hidden">{children}</div>

      {/* PC / タブレット: 実機フレーム */}
      <div className="hidden min-h-screen items-center justify-center py-10 sm:flex">
        <div className="relative">
          <div className="w-[390px] rounded-[2.6rem] border border-slate-300 bg-slate-900 p-2.5 shadow-2xl">
            <div className="relative h-[780px] overflow-hidden rounded-[2rem] bg-white">
              {/* ノッチ */}
              <div className="pointer-events-none absolute top-0 left-1/2 z-30 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
              <div className="flex h-full flex-col">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
