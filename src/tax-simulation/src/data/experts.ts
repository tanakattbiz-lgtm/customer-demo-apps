// 専門家のダミーデータ(実在の人物・事務所ではありません)
export type Qualification = "税理士" | "司法書士" | "FP" | "弁護士";

export interface Expert {
  id: string;
  name: string;
  kana: string;
  qualification: Qualification;
  office: string;
  area: string;
  station: string;
  specialties: string[];       // 得意分野タグ
  simTypes: string[];          // 対応するシミュレーション種別
  years: number;               // 経験年数
  cases: number;               // 対応実績件数
  rating: number;              // 評価(5点満点)
  reviews: number;             // レビュー数
  fee: string;                 // 初回相談料
  online: boolean;             // オンライン相談可
  weekend: boolean;            // 土日対応
  message: string;
  bio: string;
  color: string;               // アバター背景色
}

export const EXPERTS: Expert[] = [
  {
    id: "e01", name: "佐伯 直樹", kana: "さえき なおき", qualification: "税理士",
    office: "さえき税理士事務所", area: "品川区", station: "大井町駅 徒歩4分",
    specialties: ["不動産売却", "譲渡所得", "確定申告"], simTypes: ["sale", "rental"],
    years: 18, cases: 640, rating: 4.9, reviews: 87, fee: "初回無料", online: true, weekend: false,
    message: "不動産の売却税務を専門に18年。取得費の調査から特例適用まで、手取りを最大化するご提案をします。",
    bio: "大手税理士法人で資産税部門を10年経験後、独立。不動産譲渡・買換え特例の申告実績は年間70件超。金融機関・不動産会社での譲渡税務セミナー登壇多数。",
    color: "oklch(55% 0.14 255)",
  },
  {
    id: "e02", name: "有村 千夏", kana: "ありむら ちなつ", qualification: "税理士",
    office: "ありむら相続税理士事務所", area: "港区", station: "田町駅 徒歩3分",
    specialties: ["相続税", "生前対策", "財産評価"], simTypes: ["inheritance", "gift"],
    years: 15, cases: 520, rating: 4.8, reviews: 64, fee: "初回無料(60分)", online: true, weekend: true,
    message: "相続税の申告・生前対策が専門です。二次相続まで見据えた分割案をご提案します。",
    bio: "国税局で資産課税部門に7年勤務した後、税理士登録。相続税申告は累計500件以上。土地評価の減額に強み。書籍『いちばんやさしい相続の教科書』(架空)著者。",
    color: "oklch(60% 0.13 300)",
  },
  {
    id: "e03", name: "三好 亮平", kana: "みよし りょうへい", qualification: "税理士",
    office: "みよし総合会計事務所", area: "渋谷区", station: "渋谷駅 徒歩6分",
    specialties: ["不動産投資", "法人化", "確定申告"], simTypes: ["rental"],
    years: 12, cases: 480, rating: 4.7, reviews: 52, fee: "5,500円/30分", online: true, weekend: false,
    message: "サラリーマン大家さんの確定申告と法人化シミュレーションはお任せください。",
    bio: "自身も区分マンション3戸を保有する投資家税理士。個人・法人の損益分岐分析、資産管理会社の設立支援が得意。クラウド会計(freee/マネーフォワード)対応。",
    color: "oklch(55% 0.12 180)",
  },
  {
    id: "e04", name: "小田切 遥", kana: "おだぎり はるか", qualification: "司法書士",
    office: "おだぎり司法書士事務所", area: "品川区", station: "五反田駅 徒歩5分",
    specialties: ["相続登記", "生前贈与登記", "家族信託"], simTypes: ["inheritance", "gift"],
    years: 10, cases: 720, rating: 4.8, reviews: 71, fee: "初回無料", online: true, weekend: true,
    message: "相続登記の義務化に対応。戸籍収集から登記完了までワンストップで承ります。",
    bio: "司法書士登録後、都内の大手事務所で不動産登記を中心に経験を積み独立。相続登記・遺産承継業務は年間100件超。認知症対策としての家族信託の組成も多数。",
    color: "oklch(60% 0.12 40)",
  },
  {
    id: "e05", name: "梶原 誠司", kana: "かじわら せいじ", qualification: "税理士",
    office: "かじわら税務会計事務所", area: "大田区", station: "蒲田駅 徒歩2分",
    specialties: ["贈与税", "相続時精算課税", "住宅取得資金"], simTypes: ["gift", "inheritance"],
    years: 22, cases: 810, rating: 4.6, reviews: 45, fee: "初回無料(30分)", online: false, weekend: false,
    message: "暦年贈与と相続時精算課税、どちらが有利かを数字でお示しします。",
    bio: "開業22年のベテラン。親子間の資金援助・住宅取得等資金の非課税特例の申告に強く、地域金融機関と連携した生前対策セミナーを定期開催。",
    color: "oklch(50% 0.1 140)",
  },
  {
    id: "e06", name: "南 美月", kana: "みなみ みづき", qualification: "FP",
    office: "ミナミライフプランニング", area: "目黒区", station: "中目黒駅 徒歩4分",
    specialties: ["ライフプラン", "住み替え資金", "保険見直し"], simTypes: ["sale", "rental"],
    years: 9, cases: 390, rating: 4.9, reviews: 93, fee: "初回無料(60分)", online: true, weekend: true,
    message: "売却後の資金計画・住み替えのキャッシュフローを一緒に描きましょう。",
    bio: "CFP®・1級FP技能士。銀行の資産運用相談窓口を経て独立。不動産売却後の資金運用、老後資金シミュレーションの相談実績多数。女性やシニアの相談に定評。",
    color: "oklch(65% 0.13 350)",
  },
  {
    id: "e07", name: "轟 健太郎", kana: "とどろき けんたろう", qualification: "税理士",
    office: "とどろき資産税事務所", area: "新宿区", station: "新宿三丁目駅 徒歩3分",
    specialties: ["相続税", "不動産オーナー", "土地評価"], simTypes: ["inheritance", "sale", "rental"],
    years: 20, cases: 950, rating: 4.7, reviews: 58, fee: "11,000円/60分", online: true, weekend: false,
    message: "地主・不動産オーナー家系の相続対策を三代先まで設計します。",
    bio: "資産税専門で20年。広大地・貸家建付地など複雑な土地評価による相続税圧縮が専門。不動産管理法人を含む資産全体の承継スキーム構築を得意とする。",
    color: "oklch(45% 0.1 262)",
  },
  {
    id: "e08", name: "白鳥 恵理", kana: "しらとり えり", qualification: "司法書士",
    office: "しらとり法務事務所", area: "世田谷区", station: "三軒茶屋駅 徒歩1分",
    specialties: ["生前贈与登記", "遺言書作成", "成年後見"], simTypes: ["gift", "inheritance"],
    years: 13, cases: 560, rating: 4.8, reviews: 49, fee: "初回無料", online: true, weekend: true,
    message: "贈与・遺言・後見。ご家族の想いを法的に確実なかたちにします。",
    bio: "遺言書作成支援は累計300件。公正証書遺言の証人手配から贈与登記までワンストップ対応。土日・夜間の相談にも柔軟に対応し、ご自宅への出張相談も可能。",
    color: "oklch(58% 0.11 220)",
  },
  {
    id: "e09", name: "峰岸 大和", kana: "みねぎし やまと", qualification: "税理士",
    office: "みねぎし税理士法人", area: "千代田区", station: "神田駅 徒歩5分",
    specialties: ["法人化", "資産管理会社", "事業承継"], simTypes: ["rental", "inheritance"],
    years: 16, cases: 430, rating: 4.5, reviews: 31, fee: "初回無料(45分)", online: true, weekend: false,
    message: "課税所得900万円が法人化の目安。数字で分岐点をお見せします。",
    bio: "資産管理会社の設立・運営支援が専門。法人化による所得分散、退職金スキーム、社宅活用など、オーナー一族全体での手残り最大化を設計する。設立支援実績150社。",
    color: "oklch(52% 0.13 80)",
  },
  {
    id: "e10", name: "早乙女 玲奈", kana: "さおとめ れいな", qualification: "FP",
    office: "サオトメFPオフィス", area: "品川区", station: "武蔵小山駅 徒歩3分",
    specialties: ["相続準備", "家計改善", "教育資金"], simTypes: ["inheritance", "gift"],
    years: 7, cases: 280, rating: 4.7, reviews: 66, fee: "初回無料(60分)", online: true, weekend: true,
    message: "「うちは相続税かかるの?」の入口相談から専門家おつなぎまで伴走します。",
    bio: "CFP®。相続の入口相談を年間80件受ける「家庭の相続の相談窓口」。財産の棚卸しシートを使った現状整理が好評。必要に応じて税理士・司法書士と連携。",
    color: "oklch(62% 0.14 20)",
  },
  {
    id: "e11", name: "国枝 修蔵", kana: "くにえだ しゅうぞう", qualification: "弁護士",
    office: "くにえだ法律事務所", area: "港区", station: "虎ノ門駅 徒歩4分",
    specialties: ["遺産分割", "相続トラブル", "不動産紛争"], simTypes: ["inheritance"],
    years: 25, cases: 380, rating: 4.6, reviews: 27, fee: "11,000円/30分", online: true, weekend: false,
    message: "揉める前の予防が最善です。遺産分割協議・遺言の設計をサポートします。",
    bio: "弁護士歴25年。遺産分割調停・審判の代理経験が豊富で、共有不動産の解消・使用貸借トラブルなど不動産がからむ相続紛争に強い。予防法務としての遺言作成支援も行う。",
    color: "oklch(40% 0.08 262)",
  },
  {
    id: "e12", name: "浅葉 るり", kana: "あさば るり", qualification: "税理士",
    office: "あさば税理士事務所", area: "江東区", station: "豊洲駅 徒歩6分",
    specialties: ["確定申告", "住宅ローン控除", "副業税務"], simTypes: ["rental", "sale"],
    years: 8, cases: 350, rating: 4.8, reviews: 74, fee: "初回無料(30分)", online: true, weekend: true,
    message: "はじめての確定申告でも大丈夫。オンラインで全国対応しています。",
    bio: "30〜40代の会社員・共働き世帯の税務相談が中心。住宅の購入・売却・賃貸に伴う申告をLINEとオンライン面談で完結できる体制が人気。丁寧な説明に定評。",
    color: "oklch(63% 0.12 160)",
  },
  {
    id: "e13", name: "檜山 岳", kana: "ひやま がく", qualification: "税理士",
    office: "ひやま不動産税務研究所", area: "中央区", station: "日本橋駅 徒歩2分",
    specialties: ["買換え特例", "事業用資産", "譲渡所得"], simTypes: ["sale"],
    years: 19, cases: 590, rating: 4.7, reviews: 38, fee: "16,500円/60分", online: false, weekend: false,
    message: "事業用資産の買換え・交換特例など、高度な譲渡税務に対応します。",
    bio: "不動産譲渡の特例適用に特化。立体買換え、等価交換、収用の課税繰延べなど複雑案件の実績が豊富。不動産会社・デベロッパーの顧問も務める。",
    color: "oklch(48% 0.11 300)",
  },
  {
    id: "e14", name: "真柴 このみ", kana: "ましば このみ", qualification: "FP",
    office: "マシバマネークリニック", area: "渋谷区", station: "表参道駅 徒歩5分",
    specialties: ["不動産投資", "資産運用", "iDeCo/NISA"], simTypes: ["rental"],
    years: 11, cases: 460, rating: 4.6, reviews: 55, fee: "初回無料(45分)", online: true, weekend: true,
    message: "家賃収入と金融資産、トータルのポートフォリオで考えましょう。",
    bio: "証券会社出身のCFP®。不動産と金融資産を組み合わせた資産形成プランが専門。「不動産に偏りすぎない資産配分」の提案が持ち味。セミナー登壇年間30回。",
    color: "oklch(57% 0.14 130)",
  },
  {
    id: "e15", name: "楠見 宗一郎", kana: "くすみ そういちろう", qualification: "税理士",
    office: "くすみ&パートナーズ税理士法人", area: "品川区", station: "大崎駅 徒歩3分",
    specialties: ["相続税", "贈与税", "国際資産税"], simTypes: ["inheritance", "gift"],
    years: 24, cases: 1100, rating: 4.9, reviews: 41, fee: "初回無料(60分)", online: true, weekend: false,
    message: "海外資産・非居住者がからむ相続・贈与にも対応できる体制があります。",
    bio: "資産税一筋24年。国外財産調書・国外転出時課税など国際資産税の経験が豊富。相続税申告は法人全体で年間120件。医師・経営者など富裕層の相談が中心。",
    color: "oklch(44% 0.12 240)",
  },
  {
    id: "e16", name: "羽鳥 さくら", kana: "はとり さくら", qualification: "司法書士",
    office: "はとり司法書士事務所", area: "大田区", station: "大森駅 徒歩4分",
    specialties: ["相続登記", "抵当権抹消", "売買決済"], simTypes: ["inheritance", "sale"],
    years: 6, cases: 310, rating: 4.7, reviews: 59, fee: "初回無料", online: true, weekend: true,
    message: "売却前の名義整理・抵当権抹消もスムーズに。決済立会まで対応します。",
    bio: "不動産売買の決済立会を年間80件担当。相続した不動産を売却する際の「相続登記→売却決済」の一括サポートが強み。平日夜間・土日のオンライン相談可。",
    color: "oklch(66% 0.11 10)",
  },
];

export const QUALIFICATIONS: Qualification[] = ["税理士", "司法書士", "FP", "弁護士"];
export const AREAS = [...new Set(EXPERTS.map((e) => e.area))];
