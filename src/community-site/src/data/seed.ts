import { subDays, subHours, subMinutes } from "date-fns";

export interface User {
  id: string;
  name: string;
  handle: string; // @なし
  bio: string;
  location: string;
  interests: string[];
  joinedAt: string;
  followingIds: string[]; // このユーザーがフォローしている相手
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  body: string;
  topic: string; // コミュニティ / タグ
  createdAt: string;
  likedBy: string[]; // userId[]
  comments: Comment[];
}

export interface AppData {
  users: User[];
  posts: Post[];
}

export const CURRENT_USER_ID = "u_me";

const now = new Date();
const iso = (d: Date) => d.toISOString();

/** 相対時刻を短く書くヘルパ */
const mAgo = (m: number) => iso(subMinutes(now, m));
const hAgo = (h: number) => iso(subHours(now, h));
const dAgo = (d: number) => iso(subDays(now, d));

export function buildSeed(): AppData {
  const users: User[] = [
    {
      id: CURRENT_USER_ID,
      name: "青木 結衣",
      handle: "yui_aoki",
      bio: "写真とコーヒーが好きです。休日はカメラ片手にお散歩。よろしくお願いします☕📷",
      location: "東京都 世田谷区",
      interests: ["カメラ", "コーヒー", "散歩"],
      joinedAt: dAgo(38),
      followingIds: ["u_haruki", "u_mai", "u_kenta", "u_sora", "u_rin"],
    },
    {
      id: "u_haruki",
      name: "佐藤 春輝",
      handle: "haruki_camp",
      bio: "週末キャンパー。焚き火とコーヒーがあれば幸せ。ソロキャン多めです🔥",
      location: "長野県 松本市",
      interests: ["キャンプ", "アウトドア", "コーヒー"],
      joinedAt: dAgo(120),
      followingIds: ["u_me", "u_mai", "u_sora", "u_yuka"],
    },
    {
      id: "u_mai",
      name: "田中 麻衣",
      handle: "mai_books",
      bio: "本の虫📚 月に10冊が目標。ミステリーと文芸が好き。読書記録つけてます。",
      location: "大阪府 大阪市",
      interests: ["読書", "ミステリー", "カフェ"],
      joinedAt: dAgo(96),
      followingIds: ["u_me", "u_rin", "u_kenta"],
    },
    {
      id: "u_kenta",
      name: "山本 健太",
      handle: "kenta_run",
      bio: "市民ランナー。フルマラソン ベスト3時間48分。次は名古屋を狙ってます🏃",
      location: "愛知県 名古屋市",
      interests: ["ランニング", "マラソン", "筋トレ"],
      joinedAt: dAgo(150),
      followingIds: ["u_me", "u_haruki", "u_sora"],
    },
    {
      id: "u_sora",
      name: "中村 そら",
      handle: "sora_garden",
      bio: "ベランダ菜園はじめました🌱 トマトとバジル育成中。花のある暮らしを目指して。",
      location: "神奈川県 横浜市",
      interests: ["ガーデニング", "料理", "DIY"],
      joinedAt: dAgo(64),
      followingIds: ["u_me", "u_mai", "u_yuka", "u_rin"],
    },
    {
      id: "u_rin",
      name: "小林 りん",
      handle: "rin_cooks",
      bio: "おうちごはん記録。今日の献立に迷ったら覗いてください🍳 作り置きが得意。",
      location: "福岡県 福岡市",
      interests: ["料理", "お菓子作り", "カフェ"],
      joinedAt: dAgo(72),
      followingIds: ["u_me", "u_sora", "u_mai"],
    },
    {
      id: "u_yuka",
      name: "渡辺 由香",
      handle: "yuka_trip",
      bio: "旅と温泉が生きがい。国内47都道府県あと6県!ローカル線でのんびり旅が好き🚃♨️",
      location: "北海道 札幌市",
      interests: ["旅行", "温泉", "写真"],
      joinedAt: dAgo(88),
      followingIds: ["u_haruki", "u_sora"],
    },
    {
      id: "u_daiki",
      name: "伊藤 大輝",
      handle: "daiki_diy",
      bio: "休日大工。棚も机も自分で作る派。工具沼にハマり中🔨 木の香りに癒される。",
      location: "埼玉県 さいたま市",
      interests: ["DIY", "木工", "インテリア"],
      joinedAt: dAgo(45),
      followingIds: ["u_sora", "u_kenta"],
    },
    {
      id: "u_nao",
      name: "松本 奈緒",
      handle: "nao_neko",
      bio: "保護猫2匹と暮らしています🐈 名前はもなかとあずき。猫の写真ばかり載せます。",
      location: "京都府 京都市",
      interests: ["猫", "写真", "読書"],
      joinedAt: dAgo(52),
      followingIds: ["u_me", "u_mai", "u_nana"],
    },
    {
      id: "u_nana",
      name: "加藤 七海",
      handle: "nana_music",
      bio: "弾き語りをちまちま。アコギ歴3年🎸 好きなものを好きなだけ、をモットーに。",
      location: "広島県 広島市",
      interests: ["音楽", "ギター", "映画"],
      joinedAt: dAgo(30),
      followingIds: ["u_nao", "u_yuka"],
    },
  ];

  const posts: Post[] = [
    {
      id: "p_01",
      authorId: "u_haruki",
      body: "今朝の松本、放射冷却で冷え込みました。テントから顔を出したら山にうっすら霧。こういう静かな朝のためにキャンプに来てる気がする。淹れたてのコーヒーが五臓六腑に沁みます☕",
      topic: "キャンプ",
      createdAt: mAgo(28),
      likedBy: ["u_me", "u_kenta", "u_sora", "u_yuka"],
      comments: [
        {
          id: "c_0101",
          authorId: "u_yuka",
          body: "朝霧の写真見たいです!温度差ある場所のコーヒーは格別ですよね〜",
          createdAt: mAgo(19),
        },
        {
          id: "c_0102",
          authorId: "u_me",
          body: "静かな朝、憧れます。私もいつかソロキャンやってみたい…!",
          createdAt: mAgo(11),
        },
      ],
    },
    {
      id: "p_02",
      authorId: "u_rin",
      body: "今日の作り置き、6品完成🍳 鶏むねの照り焼き、ひじきの煮物、無限ピーマン、きんぴら、卵焼き、ミニトマトのマリネ。平日の自分を助けるのは休日の自分、を今週も実践しました。",
      topic: "料理",
      createdAt: hAgo(2),
      likedBy: ["u_me", "u_sora", "u_mai", "u_nao"],
      comments: [
        {
          id: "c_0201",
          authorId: "u_sora",
          body: "無限ピーマンのレシピ知りたいです!家の消費が追いつかなくて…😂",
          createdAt: hAgo(1),
        },
      ],
    },
    {
      id: "p_03",
      authorId: "u_mai",
      body: "今月8冊目、読了。伏線の回収が見事で、最後の20ページは息をするのを忘れてました。ミステリー好きな人にはぜひおすすめしたい一冊。次は積んでる文芸に手を伸ばします📚",
      topic: "読書",
      createdAt: hAgo(4),
      likedBy: ["u_me", "u_rin", "u_nao"],
      comments: [],
    },
    {
      id: "p_04",
      authorId: "u_kenta",
      body: "朝ラン20km完了🏃 気温が下がってきて走りやすい季節になってきました。名古屋に向けて距離を戻していく。今日のペースは5分10秒/km、心拍も落ち着いてていい感じ。",
      topic: "ランニング",
      createdAt: hAgo(6),
      likedBy: ["u_me", "u_haruki", "u_daiki"],
      comments: [
        {
          id: "c_0401",
          authorId: "u_haruki",
          body: "20kmを朝から…尊敬します。私は焚き火の前から動けません🔥",
          createdAt: hAgo(5),
        },
      ],
    },
    {
      id: "p_05",
      authorId: "u_sora",
      body: "ベランダのミニトマトがついに色づいてきました🍅 種から育てて2ヶ月半、毎朝の水やりが楽しみで仕方ない。収穫したら真っ先にサラダにする予定です。バジルも隣で元気。",
      topic: "ガーデニング",
      createdAt: hAgo(9),
      likedBy: ["u_me", "u_rin", "u_daiki", "u_yuka", "u_mai"],
      comments: [
        {
          id: "c_0501",
          authorId: "u_rin",
          body: "採れたてトマトのサラダ、最高ですよね!オリーブオイルと塩だけで充分。",
          createdAt: hAgo(8),
        },
        {
          id: "c_0502",
          authorId: "u_me",
          body: "種から育てるの尊敬します🌱 毎朝の小さな楽しみっていいですね。",
          createdAt: hAgo(7),
        },
      ],
    },
    {
      id: "p_06",
      authorId: "u_nao",
      body: "もなかが箱の中でぎゅうぎゅうになって寝てます🐈 どう見てもサイズが合ってないのに、この箱がお気に入りらしい。猫の「ちょうどいい」は人間には分からない。癒しをおすそ分け。",
      topic: "猫",
      createdAt: hAgo(11),
      likedBy: ["u_me", "u_mai", "u_nana", "u_rin", "u_sora"],
      comments: [
        {
          id: "c_0601",
          authorId: "u_nana",
          body: "箱に収まりきらない猫、なぜあんなに愛おしいんでしょう…😭",
          createdAt: hAgo(10),
        },
      ],
    },
    {
      id: "p_07",
      authorId: "u_me",
      body: "近所の商店街を散歩しながら、夕方の光を何枚か。オレンジ色に染まる路地って、なんでこんなに懐かしい気持ちになるんだろう。フィルムっぽい色味に現像してみました📷",
      topic: "カメラ",
      createdAt: hAgo(14),
      likedBy: ["u_haruki", "u_mai", "u_nao", "u_yuka"],
      comments: [
        {
          id: "c_0701",
          authorId: "u_nao",
          body: "夕方の路地、大好物です。結衣さんの写真いつも空気感がありますよね。",
          createdAt: hAgo(13),
        },
      ],
    },
    {
      id: "p_08",
      authorId: "u_daiki",
      body: "念願だった壁付けの本棚、ようやく完成🔨 水平を出すのに3回やり直したけど、ぴったり収まると気持ちいい。木の断面にオイルを塗る瞬間がいちばん好きかもしれない。",
      topic: "DIY",
      createdAt: hAgo(20),
      likedBy: ["u_sora", "u_kenta", "u_me"],
      comments: [],
    },
    {
      id: "p_09",
      authorId: "u_yuka",
      body: "ローカル線に揺られて温泉の町へ♨️ 無人駅で降りたら誰もいなくて、蝉の声だけが響いてました。こういう「何もない贅沢」を味わうために旅してるのかも。宿の露天風呂が最高でした。",
      topic: "旅行",
      createdAt: dAgo(1),
      likedBy: ["u_haruki", "u_sora", "u_nana", "u_me"],
      comments: [
        {
          id: "c_0901",
          authorId: "u_haruki",
          body: "無人駅の静けさ、わかります。旅の写真もっと見たいです🚃",
          createdAt: hAgo(22),
        },
      ],
    },
    {
      id: "p_10",
      authorId: "u_nana",
      body: "夜、ベランダで一曲だけ弾き語り🎸 上手くなくても、好きな歌を自分のために歌う時間が心を整えてくれる。アコギ3年目、少しずつコードチェンジが滑らかになってきた気がします。",
      topic: "音楽",
      createdAt: dAgo(1),
      likedBy: ["u_nao", "u_yuka", "u_me"],
      comments: [],
    },
    {
      id: "p_11",
      authorId: "u_mai",
      body: "雨の日は近所のカフェにこもって読書📖 窓際の席、あたたかいカフェオレ、そして分厚い文庫。これ以上の贅沢を私は知りません。店主さんが選ぶBGMもいつも心地いい。",
      topic: "読書",
      createdAt: dAgo(2),
      likedBy: ["u_me", "u_rin", "u_nao", "u_sora"],
      comments: [
        {
          id: "c_1101",
          authorId: "u_me",
          body: "雨×カフェ×読書、優勝の組み合わせですね☔️ そのカフェ気になります!",
          createdAt: dAgo(2),
        },
      ],
    },
    {
      id: "p_12",
      authorId: "u_kenta",
      body: "走った後の銭湯がやめられない♨️ 大きい湯船で足を伸ばすと、疲労が全部溶けていく感覚。運動habitを続けられてるのは、このご褒美があるからかもしれません。今日もお疲れ自分。",
      topic: "ランニング",
      createdAt: dAgo(3),
      likedBy: ["u_haruki", "u_daiki", "u_me"],
      comments: [],
    },
  ];

  return { users, posts };
}

/** おすすめコミュニティ(タグ)。右カラムの飾りに使う */
export const TRENDING_TOPICS: { topic: string; count: number }[] = [
  { topic: "コーヒー", count: 1284 },
  { topic: "おうちごはん", count: 986 },
  { topic: "カメラ散歩", count: 742 },
  { topic: "ソロキャンプ", count: 613 },
  { topic: "読書記録", count: 588 },
  { topic: "ベランダ菜園", count: 421 },
];
