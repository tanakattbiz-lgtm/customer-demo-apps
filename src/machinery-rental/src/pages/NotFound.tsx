import { Link } from "react-router-dom";
import { MachineArt } from "../components/MachineArt";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="wash">
      <div className="blueprint">
        <div className="mx-auto flex max-w-[760px] flex-col items-center px-6 py-32 text-center sm:px-8">
          <div className="w-full max-w-sm border border-ink-200 bg-white/70 p-8">
            <MachineArt kind="excavator" frame idKey="404" className="w-full text-navy-700" />
          </div>
          <p className="tnum mt-12 text-[52px] leading-none tracking-widest text-ink-300">404</p>
          <h1 className="serif mt-6 text-[20px] leading-[1.7] text-ink-900">
            お探しのページが見つかりませんでした
          </h1>
          <p className="mt-5 text-[13px] leading-[2.1] text-ink-600">
            URL が変更されたか、掲載を終了した可能性があります。
            <br />
            トップページまたはサイト内の各ページから、目的の情報をお探しください。
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button size="lg">トップページへ</Button>
            </Link>
            <Link to="/rental">
              <Button size="lg" variant="outline">
                レンタル機械を見る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
