import type { ArtKind } from "../data/seed";

/* =========================================================
   機械のSVGイラスト
   写真素材を使わず、軽量なベクターで明るいトーンを統一する
   ========================================================= */

type Props = {
  kind: ArtKind;
  className?: string;
  /** 背景の空・地面を描くか */
  scene?: boolean;
  /** グラデーションIDの衝突を避けるための接頭辞 */
  idKey?: string;
};

const Y = "var(--color-sun-500)";
const Y_DARK = "var(--color-sun-700)";
const INK = "var(--color-ink-800)";
const GLASS = "var(--color-sea-200)";

function Excavator() {
  return (
    <g>
      {/* 下部走行体 */}
      <rect x="46" y="116" width="132" height="22" rx="11" fill={INK} />
      <rect x="56" y="121" width="112" height="12" rx="6" fill="var(--color-ink-600)" />
      {[68, 90, 112, 134, 156].map((cx) => (
        <circle key={cx} cx={cx} cy={127} r="4" fill="var(--color-ink-300)" />
      ))}
      {/* 旋回体 */}
      <path d="M62 114 L66 96 Q68 90 76 90 L168 90 Q176 90 176 98 L176 114 Z" fill={Y} />
      <path d="M150 90 L176 90 L176 114 L150 114 Z" fill={Y_DARK} />
      {/* キャブ */}
      <rect x="70" y="56" width="42" height="36" rx="6" fill={Y} />
      <path d="M76 62 h30 v18 h-30 z" fill={GLASS} />
      <rect x="70" y="56" width="42" height="36" rx="6" fill="none" stroke={Y_DARK} strokeWidth="2" />
      {/* ブーム・アーム */}
      <path
        d="M120 92 Q146 52 178 60"
        stroke={Y}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M178 60 L204 100" stroke={Y_DARK} strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* バケット */}
      <path d="M198 98 L216 104 L212 124 L188 116 Z" fill={INK} />
      <path d="M212 124 l4 5 M204 121 l3 5 M196 118 l3 5" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* シリンダ */}
      <path d="M104 86 L140 70" stroke="var(--color-ink-400)" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function Loader() {
  return (
    <g>
      {/* 車体 */}
      <path d="M64 92 Q64 86 72 86 L164 86 Q174 86 176 96 L178 116 L60 116 Z" fill={Y} />
      <path d="M140 86 L176 86 L178 116 L140 116 Z" fill={Y_DARK} />
      {/* キャブ */}
      <rect x="98" y="52" width="44" height="36" rx="6" fill={Y} />
      <path d="M104 58 h32 v18 h-32 z" fill={GLASS} />
      <rect x="98" y="52" width="44" height="36" rx="6" fill="none" stroke={Y_DARK} strokeWidth="2" />
      {/* リフトアーム */}
      <path d="M100 96 L40 80" stroke={Y_DARK} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M106 104 L48 96" stroke="var(--color-ink-400)" strokeWidth="5" strokeLinecap="round" />
      {/* バケット */}
      <path d="M42 72 L14 76 L12 108 L44 106 Z" fill={INK} />
      <path d="M12 108 l-6 3 M22 107 l-5 3 M32 107 l-5 3" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* タイヤ */}
      <circle cx="84" cy="118" r="20" fill={INK} />
      <circle cx="84" cy="118" r="8" fill="var(--color-ink-300)" />
      <circle cx="158" cy="118" r="22" fill={INK} />
      <circle cx="158" cy="118" r="9" fill="var(--color-ink-300)" />
    </g>
  );
}

function Dozer() {
  return (
    <g>
      {/* 履帯 */}
      <path d="M62 138 L182 138 Q194 138 194 128 L194 118 L74 112 Q62 111 62 122 Z" fill={INK} />
      {[86, 110, 134, 158].map((cx) => (
        <circle key={cx} cx={cx} cy={128} r="5" fill="var(--color-ink-400)" />
      ))}
      {/* 車体 */}
      <path d="M78 110 L84 84 Q86 78 94 78 L172 78 Q180 78 180 86 L182 112 Z" fill={Y} />
      <path d="M152 78 L180 78 L182 112 L152 112 Z" fill={Y_DARK} />
      {/* キャブ */}
      <rect x="108" y="48" width="46" height="32" rx="6" fill={Y} />
      <path d="M114 54 h34 v16 h-34 z" fill={GLASS} />
      <rect x="108" y="48" width="46" height="32" rx="6" fill="none" stroke={Y_DARK} strokeWidth="2" />
      {/* 排土板 */}
      <path d="M40 74 Q30 74 30 84 L30 132 Q30 140 40 140 L52 140 L52 74 Z" fill={Y_DARK} />
      <rect x="30" y="130" width="24" height="10" rx="3" fill={INK} />
      <path d="M54 96 L92 100 M54 116 L90 116" stroke="var(--color-ink-500)" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}

function Crusher() {
  return (
    <g>
      {/* 履帯 */}
      <rect x="46" y="118" width="140" height="20" rx="10" fill={INK} />
      {[62, 88, 114, 140, 166].map((cx) => (
        <circle key={cx} cx={cx} cy={128} r="4" fill="var(--color-ink-400)" />
      ))}
      {/* 本体 */}
      <rect x="62" y="80" width="104" height="38" rx="6" fill={Y} />
      <rect x="132" y="80" width="34" height="38" fill={Y_DARK} />
      {/* ホッパ */}
      <path d="M56 44 L134 44 L120 78 L70 78 Z" fill={Y_DARK} />
      <path d="M64 50 L126 50" stroke="var(--color-sun-300)" strokeWidth="4" strokeLinecap="round" />
      {/* コンベア */}
      <path d="M160 100 L216 66" stroke="var(--color-ink-500)" strokeWidth="12" strokeLinecap="round" />
      <path d="M160 100 L216 66" stroke="var(--color-ink-300)" strokeWidth="4" strokeLinecap="round" />
      {/* 排出した砕石 */}
      <path d="M198 138 Q214 108 232 138 Z" fill="var(--color-ink-300)" />
      <circle cx="216" cy="124" r="3" fill="var(--color-ink-400)" />
      <circle cx="208" cy="132" r="2.5" fill="var(--color-ink-400)" />
      {/* 制御盤 */}
      <rect x="40" y="86" width="22" height="30" rx="4" fill="var(--color-ink-600)" />
      <circle cx="51" cy="96" r="3" fill="var(--color-ok-500)" />
    </g>
  );
}

function Carrier() {
  return (
    <g>
      {/* 履帯 */}
      <rect x="44" y="114" width="150" height="24" rx="12" fill={INK} />
      {[62, 90, 118, 146, 174].map((cx) => (
        <circle key={cx} cx={cx} cy={126} r="5" fill="var(--color-ink-400)" />
      ))}
      {/* シャシ */}
      <rect x="52" y="100" width="134" height="16" rx="4" fill={Y_DARK} />
      {/* 荷台(ダンプ) */}
      <path d="M74 96 L82 52 L192 62 L186 96 Z" fill={Y} />
      <path d="M84 88 L178 88" stroke={Y_DARK} strokeWidth="4" />
      {/* 積荷 */}
      <path d="M92 60 Q118 44 150 58 Q170 50 182 64 L86 56 Z" fill="var(--color-ink-400)" />
      {/* 運転席 */}
      <rect x="40" y="70" width="34" height="32" rx="6" fill={Y} />
      <path d="M45 76 h24 v14 h-24 z" fill={GLASS} />
      <rect x="40" y="70" width="34" height="32" rx="6" fill="none" stroke={Y_DARK} strokeWidth="2" />
    </g>
  );
}

function Aerial() {
  return (
    <g>
      {/* 台車 */}
      <rect x="62" y="116" width="116" height="22" rx="8" fill={Y} />
      <rect x="62" y="116" width="116" height="22" rx="8" fill="none" stroke={Y_DARK} strokeWidth="2" />
      <circle cx="84" cy="138" r="9" fill={INK} />
      <circle cx="156" cy="138" r="9" fill={INK} />
      {/* シザース */}
      <g stroke={Y_DARK} strokeWidth="7" strokeLinecap="round">
        <path d="M84 116 L156 82" />
        <path d="M156 116 L84 82" />
        <path d="M84 82 L156 48" />
        <path d="M156 82 L84 48" />
      </g>
      {/* 作業床 */}
      <rect x="60" y="34" width="120" height="12" rx="4" fill={Y} />
      <path d="M62 34 L62 12 M178 34 L178 12 M62 12 L178 12 M62 23 L178 23" stroke={Y_DARK} strokeWidth="4" strokeLinecap="round" />
      {/* 作業者 */}
      <circle cx="120" cy="18" r="6" fill={INK} />
      <path d="M120 24 L120 34" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function Attachment() {
  return (
    <g>
      {/* ブラケット */}
      <path d="M84 26 L156 26 Q166 26 166 36 L166 60 L74 60 L74 36 Q74 26 84 26 Z" fill={Y} />
      <rect x="92" y="34" width="18" height="8" rx="4" fill={Y_DARK} />
      <rect x="130" y="34" width="18" height="8" rx="4" fill={Y_DARK} />
      {/* 本体 */}
      <rect x="88" y="60" width="64" height="52" rx="8" fill={Y_DARK} />
      <path d="M96 70 h48 M96 82 h48 M96 94 h48" stroke="var(--color-sun-300)" strokeWidth="4" strokeLinecap="round" />
      {/* ロッド */}
      <rect x="110" y="112" width="20" height="30" rx="4" fill="var(--color-ink-500)" />
      <path d="M114 142 L126 142 L122 156 L118 156 Z" fill={INK} />
      {/* 破砕の衝撃 */}
      <path d="M96 150 l-12 8 M144 150 l12 8 M120 160 l0 0" stroke="var(--color-sun-600)" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

function Small() {
  return (
    <g>
      {/* フレーム */}
      <rect x="52" y="60" width="136" height="62" rx="10" fill={Y} />
      <rect x="52" y="60" width="136" height="62" rx="10" fill="none" stroke={Y_DARK} strokeWidth="2" />
      {/* ルーバー */}
      <path d="M66 76 h34 M66 88 h34 M66 100 h34" stroke={Y_DARK} strokeWidth="5" strokeLinecap="round" />
      {/* パネル */}
      <rect x="118" y="72" width="56" height="38" rx="5" fill="var(--color-ink-700)" />
      <circle cx="132" cy="86" r="6" fill="var(--color-ok-500)" />
      <circle cx="152" cy="86" r="6" fill="var(--color-sun-400)" />
      <path d="M126 100 h40" stroke="var(--color-ink-400)" strokeWidth="4" strokeLinecap="round" />
      {/* ハンドル */}
      <path d="M52 68 L34 58 M188 68 L206 58" stroke={Y_DARK} strokeWidth="6" strokeLinecap="round" />
      {/* 脚 */}
      <rect x="66" y="122" width="16" height="14" rx="3" fill={INK} />
      <rect x="158" y="122" width="16" height="14" rx="3" fill={INK} />
    </g>
  );
}

const ART: Record<ArtKind, () => React.JSX.Element> = {
  excavator: Excavator,
  loader: Loader,
  dozer: Dozer,
  crusher: Crusher,
  carrier: Carrier,
  aerial: Aerial,
  attachment: Attachment,
  small: Small,
};

export function MachineArt({ kind, className, scene = true, idKey = "a" }: Props) {
  const Art = ART[kind] ?? Excavator;
  const gid = `${idKey}-${kind}-sky`;
  return (
    <svg
      viewBox="0 0 240 160"
      className={className}
      role="img"
      aria-label={`${kind} のイラスト`}
      preserveAspectRatio="xMidYMid meet"
    >
      {scene && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-sea-100)" />
              <stop offset="100%" stopColor="var(--color-sun-50)" />
            </linearGradient>
          </defs>
          <rect width="240" height="160" fill={`url(#${gid})`} />
          <circle cx="204" cy="34" r="20" fill="var(--color-sun-200)" />
          <path d="M0 140 Q60 128 120 138 T240 136 L240 160 L0 160 Z" fill="var(--color-sun-100)" />
        </>
      )}
      <Art />
    </svg>
  );
}

export default MachineArt;
