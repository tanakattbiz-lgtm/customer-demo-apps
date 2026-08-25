import { Link } from "react-router-dom";
import { MachineArt } from "../components/MachineArt";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="mesh-light">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="w-64 overflow-hidden rounded-3xl border border-ink-200 bg-white/70">
          <MachineArt kind="excavator" idKey="404" className="w-full" />
        </div>
        <p className="mt-8 text-6xl font-black tracking-tight text-ink-900">404</p>
        <h1 className="mt-3 text-xl font-black text-ink-900">
          お探しのページが見つかりませんでした
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500">
          URL が変更されたか、削除された可能性があります。トップページから目的の情報をお探しください。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button variant="secondary" size="lg">
              トップページへ
            </Button>
          </Link>
          <Link to="/rental">
            <Button variant="outline" size="lg">
              レンタル機械を探す
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
