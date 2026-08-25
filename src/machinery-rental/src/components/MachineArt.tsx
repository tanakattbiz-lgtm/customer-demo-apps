import type { ArtKind } from "../data/seed";

/* =========================================================
   機械のテクニカルライン画
   写真素材を使わず、製図調の線画で統一する。
   塗りは使わず、線の太さと余白だけで機械を表現する。
   機種クラスごとに proportion を変え、一覧で見分けがつくようにする。
   ========================================================= */

type Props = {
  kind: ArtKind;
  className?: string;
  /** 製図の枠(隅の見当・基準線)を描くか */
  frame?: boolean;
  /** data 属性用のキー */
  idKey?: string;
};

const S = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const HEAVY = 1.6;
const LIGHT = 1;

/* ---------- 共通パーツ ---------- */

/** クローラ(履帯)。x0..x1, 中心 cy, 高さ h */
function Track({ x0, x1, cy, h, rollers }: { x0: number; x1: number; cy: number; h: number; rollers: number }) {
  const r = h / 2;
  const step = (x1 - x0 - 28) / (rollers - 1);
  return (
    <>
      <path
        d={`M${x0 + r} ${cy - r} h${x1 - x0 - h} a${r} ${r} 0 0 1 0 ${h} h-${x1 - x0 - h} a${r} ${r} 0 0 1 0 -${h} z`}
        strokeWidth={HEAVY}
      />
      <path
        d={`M${x0 + r + 8} ${cy - r + 8} h${x1 - x0 - h - 16} a${r - 8} ${r - 8} 0 0 1 0 ${h - 16} h-${x1 - x0 - h - 16} a${r - 8} ${r - 8} 0 0 1 0 -${h - 16} z`}
        strokeWidth={LIGHT}
        opacity="0.45"
      />
      {Array.from({ length: rollers }).map((_, i) => (
        <circle key={i} cx={x0 + 14 + step * i} cy={cy} r="4.2" strokeWidth={LIGHT} opacity="0.5" />
      ))}
    </>
  );
}

/* ---------- 油圧ショベル(3 クラス + ロングリーチ) ---------- */

function MiniExcavator() {
  return (
    <g {...S}>
      <Track x0={86} x1={214} cy={168} h={34} rollers={4} />
      {/* 旋回体 */}
      <path d="M96 151 L98 126 Q99 120 106 120 L208 120 Q214 120 214 126 L214 151 Z" strokeWidth={HEAVY} />
      <path d="M188 120 L188 151" strokeWidth={LIGHT} opacity="0.4" />
      {/* キャノピー(オープンROPS) */}
      <path d="M110 120 L110 74 M156 120 L156 74" strokeWidth={HEAVY} />
      <path d="M104 74 L164 74" strokeWidth={HEAVY} />
      <path d="M120 120 L120 100 L146 100 L146 120" strokeWidth={LIGHT} opacity="0.6" />
      {/* 短いブーム */}
      <path d="M164 122 Q192 92 224 90 L226 102 Q200 105 176 130 Z" strokeWidth={HEAVY} />
      <path d="M224 90 L234 98 L252 132 L240 137 Z" strokeWidth={HEAVY} />
      {/* 小型バケット */}
      <path d="M239 132 L258 140 L253 160 L232 152 Z" strokeWidth={HEAVY} />
      <path d="M253 160 l3 5 M245 157 l3 5" strokeWidth={LIGHT} />
      {/* 排土板(アーム付き) */}
      <path d="M212 170 L228 170" strokeWidth={LIGHT} opacity="0.6" />
      <path d="M228 158 L242 158 L242 188 L228 188 Z" strokeWidth={HEAVY} />
    </g>
  );
}

function Excavator() {
  return (
    <g {...S}>
      <Track x0={70} x1={222} cy={170} h={40} rollers={5} />
      {/* 旋回体 */}
      <path d="M86 150 L89 121 Q90 113 99 113 L228 113 Q238 113 238 123 L238 150 Z" strokeWidth={HEAVY} />
      <path d="M198 113 L198 150" strokeWidth={LIGHT} opacity="0.4" />
      {/* キャブ */}
      <path d="M97 150 L97 66 Q97 60 104 60 L148 60 Q154 60 154 66 L154 150" strokeWidth={HEAVY} />
      <path d="M105 70 h40 v30 h-40 z" strokeWidth={LIGHT} opacity="0.55" />
      {/* ブーム */}
      <path d="M162 116 Q198 72 248 66 L252 81 Q206 87 174 126 Z" strokeWidth={HEAVY} />
      {/* アーム */}
      <path d="M247 66 L259 76 L288 129 L274 136 Z" strokeWidth={HEAVY} />
      {/* バケット */}
      <path d="M272 130 L298 140 L291 168 L262 156 Z" strokeWidth={HEAVY} />
      <path d="M291 168 l4 6 M281 164 l4 6 M271 160 l4 6" strokeWidth={LIGHT} />
      {/* ブームシリンダ */}
      <circle cx="166" cy="108" r="2.6" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M166 108 L204 88" strokeWidth={LIGHT} opacity="0.5" />
      <circle cx="204" cy="88" r="2.6" strokeWidth={LIGHT} opacity="0.55" />
    </g>
  );
}

function LargeExcavator() {
  return (
    <g {...S}>
      <Track x0={52} x1={230} cy={172} h={46} rollers={6} />
      {/* 旋回体(カウンタウェイト大) */}
      <path d="M68 149 L72 114 Q73 104 84 104 L236 104 Q248 104 248 116 L248 149 Z" strokeWidth={HEAVY} />
      <path d="M204 104 L204 149" strokeWidth={LIGHT} opacity="0.4" />
      <path d="M212 114 h28" strokeWidth={LIGHT} opacity="0.4" />
      {/* キャブ(高い) */}
      <path d="M82 149 L82 50 Q82 43 90 43 L138 43 Q145 43 145 50 L145 149" strokeWidth={HEAVY} />
      <path d="M90 55 h44 v34 h-44 z" strokeWidth={LIGHT} opacity="0.55" />
      {/* 長いブーム */}
      <path d="M156 108 Q196 54 254 46 L258 63 Q206 71 170 120 Z" strokeWidth={HEAVY} />
      <path d="M253 46 L268 58 L296 118 L280 126" strokeWidth={HEAVY} />
      <path d="M296 118 L280 126" strokeWidth={HEAVY} />
      {/* 大型バケット */}
      <path d="M276 118 L308 130 L300 166 L264 150 Z" strokeWidth={HEAVY} />
      <path d="M300 166 l5 7 M288 161 l5 7 M276 156 l5 7 M264 150 l5 7" strokeWidth={LIGHT} />
      <path d="M164 92 L208 70" strokeWidth={LIGHT} opacity="0.5" />
    </g>
  );
}

function LongExcavator() {
  return (
    <g {...S}>
      <Track x0={40} x1={196} cy={176} h={40} rollers={5} />
      {/* 旋回体 */}
      <path d="M54 156 L58 124 Q59 116 68 116 L202 116 Q212 116 212 126 L212 156 Z" strokeWidth={HEAVY} />
      {/* チルトキャブ */}
      <path d="M66 156 L70 74 Q71 67 78 68 L120 71 Q127 72 126 79 L122 156" strokeWidth={HEAVY} />
      <path d="M76 80 L118 83 L116 112 L74 109 Z" strokeWidth={LIGHT} opacity="0.55" />
      {/* 超ロングブーム */}
      <path d="M140 120 L238 26 L250 36 L152 130 Z" strokeWidth={HEAVY} />
      {/* ロングアーム */}
      <path d="M243 30 L256 38 L292 92 L278 100 Z" strokeWidth={HEAVY} />
      {/* 小型バケット(解体用) */}
      <path d="M280 94 L302 104 L296 126 L272 114 Z" strokeWidth={HEAVY} />
      <path d="M158 104 L200 74" strokeWidth={LIGHT} opacity="0.45" />
    </g>
  );
}

/* ---------- ホイールローダ ---------- */
function Loader() {
  return (
    <g {...S}>
      <path d="M94 152 L94 116 Q94 108 103 108 L232 108 Q246 108 249 122 L253 152 Z" strokeWidth={HEAVY} />
      <path d="M196 108 L196 152" strokeWidth={LIGHT} opacity="0.4" />
      <path d="M142 108 L142 62 Q142 56 149 56 L198 56 Q204 56 204 62 L204 108" strokeWidth={HEAVY} />
      <path d="M150 66 h44 v28 h-44 z" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M142 124 L62 104 L59 118 L143 141 Z" strokeWidth={HEAVY} />
      <path d="M148 140 L74 128" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M62 96 L18 102 L14 146 L64 141 Z" strokeWidth={HEAVY} />
      <path d="M14 146 l-7 4 M27 145 l-6 4 M40 144 l-6 4" strokeWidth={LIGHT} />
      <circle cx="120" cy="156" r="27" strokeWidth={HEAVY} />
      <circle cx="120" cy="156" r="11" strokeWidth={LIGHT} opacity="0.5" />
      <circle cx="216" cy="156" r="29" strokeWidth={HEAVY} />
      <circle cx="216" cy="156" r="12" strokeWidth={LIGHT} opacity="0.5" />
    </g>
  );
}

/* ---------- ブルドーザ ---------- */
function Dozer() {
  return (
    <g {...S}>
      <path
        d="M104 188 L248 188 Q262 188 262 175 L262 154 L124 143 Q104 141 104 158 Z"
        strokeWidth={HEAVY}
      />
      {[130, 158, 186, 214, 242].map((cx) => (
        <circle key={cx} cx={cx} cy={172} r="4.6" strokeWidth={LIGHT} opacity="0.45" />
      ))}
      <path d="M118 142 L124 106 Q125 98 134 98 L238 98 Q248 98 248 108 L250 148 Z" strokeWidth={HEAVY} />
      <path d="M154 98 L154 54 Q154 48 161 48 L212 48 Q218 48 218 54 L218 98" strokeWidth={HEAVY} />
      <path d="M162 58 h46 v26 h-46 z" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M58 92 Q46 92 46 104 L46 176 Q46 186 57 186 L74 186 L74 92 Z" strokeWidth={HEAVY} />
      <path d="M46 168 L74 168" strokeWidth={LIGHT} opacity="0.45" />
      <path d="M76 116 L124 122 M76 150 L120 150" strokeWidth={LIGHT} opacity="0.6" />
    </g>
  );
}

/* ---------- 運搬機械 ---------- */
function Carrier() {
  return (
    <g {...S}>
      <Track x0={62} x1={234} cy={169} h={42} rollers={5} />
      <path d="M70 146 L246 146 L246 132 L70 132 Z" strokeWidth={LIGHT} opacity="0.65" />
      <path d="M96 130 L104 62 L256 74 L248 130 Z" strokeWidth={HEAVY} />
      <path d="M108 118 L244 118" strokeWidth={LIGHT} opacity="0.4" />
      <path d="M52 132 L52 84 Q52 78 59 78 L90 78 Q96 78 96 84 L96 132" strokeWidth={HEAVY} />
      <path d="M59 88 h30 v20 h-30 z" strokeWidth={LIGHT} opacity="0.55" />
    </g>
  );
}

/* ---------- 環境リサイクル機械 ---------- */
function Crusher() {
  return (
    <g {...S}>
      <Track x0={62} x1={212} cy={171} h={38} rollers={5} />
      <path d="M78 150 L78 104 L212 104 L212 150 Z" strokeWidth={HEAVY} />
      <path d="M176 104 L176 150" strokeWidth={LIGHT} opacity="0.4" />
      <path d="M70 46 L172 46 L154 102 L88 102 Z" strokeWidth={HEAVY} />
      <path d="M80 56 L162 56" strokeWidth={LIGHT} opacity="0.45" />
      <path d="M206 128 L296 76 L304 90 L214 142 Z" strokeWidth={HEAVY} />
      <path d="M222 124 L288 86" strokeWidth={LIGHT} opacity="0.4" />
      <path d="M50 112 L74 112 L74 148 L50 148 Z" strokeWidth={LIGHT} opacity="0.65" />
      <path d="M56 120 h12" strokeWidth={LIGHT} opacity="0.45" />
    </g>
  );
}

/* ---------- 転圧機械(ローラ) ---------- */
function Roller() {
  return (
    <g {...S}>
      <circle cx="96" cy="150" r="40" strokeWidth={HEAVY} />
      <circle cx="96" cy="150" r="14" strokeWidth={LIGHT} opacity="0.45" />
      <circle cx="228" cy="152" r="38" strokeWidth={HEAVY} />
      <circle cx="228" cy="152" r="13" strokeWidth={LIGHT} opacity="0.45" />
      <path d="M104 118 L104 96 Q104 88 113 88 L214 88 Q224 88 224 98 L224 120" strokeWidth={HEAVY} />
      <path d="M96 110 L232 110" strokeWidth={LIGHT} opacity="0.45" />
      <path d="M136 88 L136 34 L206 34 L206 88" strokeWidth={HEAVY} />
      <path d="M148 46 h46 v18 h-46 z" strokeWidth={LIGHT} opacity="0.5" />
      <path d="M158 88 L158 70 L184 70 L184 88" strokeWidth={LIGHT} opacity="0.65" />
    </g>
  );
}

/* ---------- アタッチメント ---------- */
function Breaker() {
  return (
    <g {...S}>
      <path d="M116 30 L206 30 Q216 30 216 40 L216 66 L106 66 L106 40 Q106 30 116 30 Z" strokeWidth={HEAVY} />
      <circle cx="134" cy="46" r="7" strokeWidth={LIGHT} opacity="0.55" />
      <circle cx="188" cy="46" r="7" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M122 66 L200 66 L200 134 L122 134 Z" strokeWidth={HEAVY} />
      <path d="M134 82 h54 M134 98 h54 M134 114 h54" strokeWidth={LIGHT} opacity="0.4" />
      <path d="M148 134 L174 134 L174 172 L148 172 Z" strokeWidth={HEAVY} />
      <path d="M154 172 L168 172 L164 190 L158 190 Z" strokeWidth={HEAVY} />
      <path d="M126 182 l-16 10 M196 182 l16 10" strokeWidth={LIGHT} opacity="0.5" />
    </g>
  );
}

function Pulverizer() {
  return (
    <g {...S}>
      {/* 取付部 */}
      <path d="M138 18 L182 18 L182 42 L138 42 Z" strokeWidth={HEAVY} />
      <circle cx="160" cy="30" r="6" strokeWidth={LIGHT} opacity="0.55" />
      {/* 旋回・シリンダ部 */}
      <path d="M126 42 L194 42 Q202 42 202 50 L202 88 Q202 96 194 96 L126 96 Q118 96 118 88 L118 50 Q118 42 126 42 Z" strokeWidth={HEAVY} />
      <path d="M132 56 h56 M132 72 h56" strokeWidth={LIGHT} opacity="0.4" />
      {/* 厚い顎(左右) */}
      <path d="M132 96 L120 152 Q118 164 130 166 L146 168 Q152 152 150 120 L150 96 Z" strokeWidth={HEAVY} />
      <path d="M188 96 L200 152 Q202 164 190 166 L174 168 Q168 152 170 120 L170 96 Z" strokeWidth={HEAVY} />
      {/* 歯 */}
      <path d="M150 120 L170 120 M148 138 L172 138 M146 156 L174 156" strokeWidth={LIGHT} opacity="0.45" />
      {/* 開度シリンダ */}
      <path d="M118 74 L96 88 M202 74 L224 88" strokeWidth={LIGHT} opacity="0.55" />
    </g>
  );
}

function Mower() {
  return (
    <g {...S}>
      {/* 取付ブラケット */}
      <path d="M138 22 L182 22 L182 46 L138 46 Z" strokeWidth={HEAVY} />
      <circle cx="160" cy="34" r="5.5" strokeWidth={LIGHT} opacity="0.55" />
      {/* 油圧モータ */}
      <path d="M144 46 L176 46 L176 70 L144 70 Z" strokeWidth={LIGHT} opacity="0.7" />
      {/* 本体(刈刃カバー) */}
      <path
        d="M52 70 L268 70 Q280 70 280 82 L280 128 Q280 140 268 140 L52 140 Q40 140 40 128 L40 82 Q40 70 52 70 Z"
        strokeWidth={HEAVY}
      />
      <path d="M40 112 L280 112" strokeWidth={LIGHT} opacity="0.35" />
      {/* 刈刃 */}
      {[64, 100, 136, 172, 208, 244].map((cx) => (
        <path key={cx} d={`M${cx} 140 L${cx - 6} 164 M${cx} 140 L${cx + 6} 164`} strokeWidth={LIGHT} opacity="0.6" />
      ))}
      {/* ゲージローラ */}
      <path d="M40 128 L28 128 M280 128 L292 128" strokeWidth={LIGHT} opacity="0.5" />
      <circle cx="24" cy="132" r="7" strokeWidth={LIGHT} opacity="0.6" />
      <circle cx="296" cy="132" r="7" strokeWidth={LIGHT} opacity="0.6" />
    </g>
  );
}

function Grapple() {
  return (
    <g {...S}>
      {/* 取付部 */}
      <path d="M140 20 L180 20 L180 44 L140 44 Z" strokeWidth={HEAVY} />
      <circle cx="160" cy="32" r="6" strokeWidth={LIGHT} opacity="0.55" />
      {/* 旋回モータ */}
      <path d="M132 44 L188 44 L188 74 L132 74 Z" strokeWidth={HEAVY} />
      <path d="M144 54 h32" strokeWidth={LIGHT} opacity="0.45" />
      {/* シリンダ */}
      <path d="M118 84 L142 96 M202 84 L178 96" strokeWidth={LIGHT} opacity="0.6" />
      {/* 爪(左右) */}
      <path d="M148 74 Q120 88 92 132 Q86 142 96 148 Q104 152 112 142 Q136 106 156 96 Z" strokeWidth={HEAVY} />
      <path d="M172 74 Q200 88 228 132 Q234 142 224 148 Q216 152 208 142 Q184 106 164 96 Z" strokeWidth={HEAVY} />
      <path d="M104 124 Q124 100 148 88 M216 124 Q196 100 172 88" strokeWidth={LIGHT} opacity="0.35" />
    </g>
  );
}

function Bucket() {
  return (
    <g {...S}>
      {/* 取付ブラケット */}
      <path d="M132 26 L188 26 L188 52 L132 52 Z" strokeWidth={HEAVY} />
      <circle cx="147" cy="39" r="5.5" strokeWidth={LIGHT} opacity="0.55" />
      <circle cx="173" cy="39" r="5.5" strokeWidth={LIGHT} opacity="0.55" />
      {/* バケット本体 */}
      <path
        d="M74 62 L246 62 L238 118 Q234 152 196 158 L124 158 Q86 152 82 118 Z"
        strokeWidth={HEAVY}
      />
      <path d="M86 84 L234 84" strokeWidth={LIGHT} opacity="0.4" />
      {/* 刃先 */}
      <path d="M124 158 L124 176 M154 159 L154 178 M186 159 L186 178 L186 178" strokeWidth={HEAVY} />
      <path d="M124 176 L136 176 L134 160 M154 178 L166 178 L164 160 M186 178 L198 177 L196 159" strokeWidth={LIGHT} opacity="0.6" />
      {/* 補強リブ */}
      <path d="M110 62 L114 150 M210 62 L206 150" strokeWidth={LIGHT} opacity="0.35" />
    </g>
  );
}

/* ---------- 小物商品 ---------- */
function Generator() {
  return (
    <g {...S}>
      <path
        d="M64 66 L256 66 Q266 66 266 76 L266 152 Q266 162 256 162 L64 162 Q54 162 54 152 L54 76 Q54 66 64 66 Z"
        strokeWidth={HEAVY}
      />
      <path d="M78 88 h56 M78 106 h56 M78 124 h56" strokeWidth={LIGHT} opacity="0.5" />
      <path d="M160 86 L244 86 L244 142 L160 142 Z" strokeWidth={LIGHT} opacity="0.7" />
      <circle cx="182" cy="106" r="9" strokeWidth={LIGHT} opacity="0.55" />
      <circle cx="212" cy="106" r="9" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M172 126 h60" strokeWidth={LIGHT} opacity="0.45" />
      <path d="M100 66 L100 50 L220 50 L220 66" strokeWidth={LIGHT} opacity="0.55" />
      <path d="M86 162 L86 178 M234 162 L234 178" strokeWidth={HEAVY} />
    </g>
  );
}

function Plate() {
  return (
    <g {...S}>
      {/* ベースプレート */}
      <path d="M76 158 L244 158 Q256 158 254 146 L250 132 L70 132 L66 146 Q64 158 76 158 Z" strokeWidth={HEAVY} />
      <path d="M70 144 L250 144" strokeWidth={LIGHT} opacity="0.4" />
      {/* エンジン */}
      <path d="M124 132 L124 84 L200 84 L200 132 Z" strokeWidth={HEAVY} />
      <path d="M136 96 h52 M136 110 h52" strokeWidth={LIGHT} opacity="0.4" />
      {/* 燃料タンク */}
      <path d="M132 84 L132 66 Q132 60 140 60 L184 60 Q192 60 192 66 L192 84" strokeWidth={HEAVY} />
      {/* ハンドル */}
      <path d="M124 108 L74 76 Q66 71 60 78 L48 92" strokeWidth={HEAVY} />
      <path d="M40 86 L56 100" strokeWidth={HEAVY} />
      {/* 散水タンク */}
      <path d="M200 100 L238 100 L238 128 L200 128 Z" strokeWidth={LIGHT} opacity="0.65" />
      {/* 振動 */}
      <path d="M84 172 h24 M132 172 h24 M180 172 h24 M228 172 h14" strokeWidth={LIGHT} opacity="0.4" />
    </g>
  );
}

function LightTower() {
  return (
    <g {...S}>
      {/* 灯体 */}
      <path d="M96 40 L146 40 L152 66 L90 66 Z" strokeWidth={HEAVY} />
      <path d="M174 40 L224 40 L230 66 L168 66 Z" strokeWidth={HEAVY} />
      <path d="M104 52 h34 M182 52 h34" strokeWidth={LIGHT} opacity="0.45" />
      {/* 光 */}
      <path d="M96 78 L74 100 M146 78 L146 104 M224 78 L246 100 M174 78 L174 104" strokeWidth={LIGHT} opacity="0.35" />
      {/* 支柱 */}
      <path d="M160 40 L160 148" strokeWidth={HEAVY} />
      <path d="M90 52 L230 52" strokeWidth={LIGHT} opacity="0.5" />
      {/* 台車 */}
      <path d="M112 148 L208 148 Q216 148 216 156 L216 170 L104 170 L104 156 Q104 148 112 148 Z" strokeWidth={HEAVY} />
      <path d="M118 158 h36" strokeWidth={LIGHT} opacity="0.45" />
      <circle cx="126" cy="180" r="10" strokeWidth={HEAVY} />
      <circle cx="194" cy="180" r="10" strokeWidth={HEAVY} />
    </g>
  );
}

const ART: Record<ArtKind, () => React.JSX.Element> = {
  "excavator-mini": MiniExcavator,
  excavator: Excavator,
  "excavator-large": LargeExcavator,
  "excavator-long": LongExcavator,
  loader: Loader,
  dozer: Dozer,
  carrier: Carrier,
  crusher: Crusher,
  roller: Roller,
  breaker: Breaker,
  pulverizer: Pulverizer,
  mower: Mower,
  grapple: Grapple,
  bucket: Bucket,
  generator: Generator,
  plate: Plate,
  light: LightTower,
};

export function MachineArt({ kind, className, frame = false, idKey = "a" }: Props) {
  const Art = ART[kind] ?? Excavator;
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      data-art={`${idKey}-${kind}`}
    >
      {frame && (
        <g stroke="currentColor" fill="none" strokeWidth="1" opacity="0.26">
          <path d="M8 22 L8 8 L22 8" />
          <path d="M298 8 L312 8 L312 22" />
          <path d="M312 178 L312 192 L298 192" />
          <path d="M22 192 L8 192 L8 178" />
          <path d="M8 192 L312 192" opacity="0.5" strokeDasharray="2 4" />
        </g>
      )}
      <Art />
    </svg>
  );
}

export default MachineArt;
