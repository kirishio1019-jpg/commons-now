import {
  Wave,
  Organization,
  Clip,
  Notification,
  Participant,
  User,
  Commitment,
} from "../types";

export const mockUser: User = {
  id: "u1",
  nickname: "ハルカ",
  avatar_url: undefined,
  location_zone: "東京都世田谷区",
  tags: ["植樹", "料理", "読書", "自然", "音楽"],
  isolation_score: 35,
  age_range: "20代後半",
  bio: "自然の中で過ごすのが好き",
  is_onboarded: true,
  ai_companion_heavy_user: false,
  created_at: "2026-03-01T00:00:00Z",
};

export const mockOrganizations: Organization[] = [
  {
    id: "org1",
    name: "みどりの輪",
    type: "npo",
    description:
      "都市部での植樹活動と生態系の再生を目指すNPO。毎月定期的に植樹イベントを開催しています。",
    trust_score: 92,
    trust_rank: "gold",
    active_zones: ["東京都世田谷区", "東京都渋谷区", "神奈川県鎌倉市"],
    logo_url: "",
    event_count: 48,
    member_count: 320,
    themes: ["植樹", "生態系再生", "環境教育"],
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "org2",
    name: "まちの食卓",
    type: "community",
    description:
      "地域の食材を使ったコミュニティキッチン。余った食材をみんなで料理して分かち合います。",
    trust_score: 87,
    trust_rank: "silver",
    active_zones: ["東京都杉並区", "東京都中野区"],
    logo_url: "",
    event_count: 24,
    member_count: 150,
    themes: ["食", "地域交流", "フードロス削減"],
    created_at: "2025-01-15T00:00:00Z",
  },
  {
    id: "org3",
    name: "川辺の語り部",
    type: "community",
    description:
      "多摩川沿いで物語の交換会を開催。焚き火を囲んで、自分の物語を語り合う場を作っています。",
    trust_score: 78,
    trust_rank: "silver",
    active_zones: ["東京都世田谷区", "東京都大田区"],
    logo_url: "",
    event_count: 12,
    member_count: 65,
    themes: ["物語", "対話", "焚き火"],
    created_at: "2025-08-01T00:00:00Z",
  },
  {
    id: "org4",
    name: "雨水プロジェクト鎌倉",
    type: "npo",
    description:
      "鎌倉を中心に雨水の収集・活用を通じた水循環の再生に取り組んでいます。",
    trust_score: 95,
    trust_rank: "platinum",
    active_zones: ["神奈川県鎌倉市", "神奈川県藤沢市"],
    logo_url: "",
    event_count: 72,
    member_count: 480,
    themes: ["雨水収集", "水循環", "バイオリージョン"],
    created_at: "2023-04-01T00:00:00Z",
  },
];

export const mockWaves: Wave[] = [
  {
    id: "w1",
    title: "朝の植樹 — 冬の森に命を還す",
    theme: "植樹",
    description:
      "世田谷の小さな森で、冬を越した土に新しい苗木を植えます。初めての方も歓迎。手袋と軽い飲み物はこちらで用意します。",
    location: {
      name: "砧公園 東側広場",
      address: "東京都世田谷区砧公園1-1",
      latitude: 35.6324,
      longitude: 139.6142,
    },
    date: "2026-04-05",
    time_start: "08:00",
    time_end: "10:30",
    organizer_id: "org1",
    capacity: 20,
    current_participants: 12,
    eco_impact_target: {
      trees_planted: 15,
      water_collected_liters: 0,
      meals_shared: 0,
      contributor_count: 20,
    },
    image_url: "",
    distance_km: 2.3,
    is_personalized: true,
    created_at: "2026-03-20T00:00:00Z",
  },
  {
    id: "w2",
    title: "みんなの食卓 — 春の味噌づくり",
    theme: "食",
    description:
      "地元農家さんの大豆を使って、みんなで味噌を仕込みます。3ヶ月後にまた集まって味噌を開けましょう。",
    location: {
      name: "杉並区民センター 調理室",
      address: "東京都杉並区梅里1-22-32",
      latitude: 35.6985,
      longitude: 139.6364,
    },
    date: "2026-04-12",
    time_start: "10:00",
    time_end: "13:00",
    organizer_id: "org2",
    capacity: 15,
    current_participants: 8,
    eco_impact_target: {
      trees_planted: 0,
      water_collected_liters: 0,
      meals_shared: 15,
      contributor_count: 15,
    },
    image_url: "",
    distance_km: 5.1,
    is_personalized: true,
    created_at: "2026-03-18T00:00:00Z",
  },
  {
    id: "w3",
    title: "焚き火の夜 — 春の物語交換会",
    theme: "物語",
    description:
      "多摩川のほとりで焚き火を囲み、お互いの物語を語り合います。話すのが苦手でも大丈夫。聴くだけの参加も歓迎です。",
    location: {
      name: "多摩川河川敷 二子玉川付近",
      address: "東京都世田谷区玉川3丁目",
      latitude: 35.6115,
      longitude: 139.6268,
    },
    date: "2026-04-19",
    time_start: "18:00",
    time_end: "20:30",
    organizer_id: "org3",
    capacity: 12,
    current_participants: 5,
    eco_impact_target: {
      trees_planted: 0,
      water_collected_liters: 0,
      meals_shared: 0,
      contributor_count: 12,
    },
    image_url: "",
    distance_km: 1.8,
    is_personalized: false,
    created_at: "2026-03-22T00:00:00Z",
  },
  {
    id: "w4",
    title: "雨水タンクを作ろう — 水循環ワークショップ",
    theme: "雨水収集",
    description:
      "家庭用の雨水タンクを一緒に組み立てます。完成品は持ち帰りOK。地域の水循環について一緒に学びましょう。",
    location: {
      name: "鎌倉生涯学習センター",
      address: "神奈川県鎌倉市小町1-10-5",
      latitude: 35.319,
      longitude: 139.5503,
    },
    date: "2026-04-26",
    time_start: "13:00",
    time_end: "16:00",
    organizer_id: "org4",
    capacity: 10,
    current_participants: 7,
    eco_impact_target: {
      trees_planted: 0,
      water_collected_liters: 500,
      meals_shared: 0,
      contributor_count: 10,
    },
    image_url: "",
    distance_km: 48.2,
    is_personalized: false,
    created_at: "2026-03-25T00:00:00Z",
  },
];

export const mockClips: Clip[] = [
  {
    id: "c1",
    wave_id: "w1",
    user_id: "u2",
    media_url: "",
    thumbnail_url: "",
    caption: "朝霧の中で土に触れた。手が冷たくて、でも温かい。",
    duration_sec: 12,
    feed_score: 95,
    created_at: "2026-03-15T10:30:00Z",
  },
  {
    id: "c2",
    wave_id: "w2",
    user_id: "u3",
    media_url: "",
    thumbnail_url: "",
    caption: "味噌の匂いがこんなに甘いって知らなかった",
    duration_sec: 8,
    feed_score: 88,
    created_at: "2026-03-10T14:00:00Z",
  },
  {
    id: "c3",
    wave_id: "w3",
    user_id: "u4",
    media_url: "",
    thumbnail_url: "",
    caption: "焚き火の前で初めて、自分の話をちゃんとした",
    duration_sec: 15,
    feed_score: 92,
    created_at: "2026-03-08T20:00:00Z",
  },
];

export const mockParticipants: Participant[] = [
  {
    id: "u2",
    nickname: "タケシ",
    age_range: "30代前半",
    bio: "会社員。週末は外に出たい",
    is_first_time: true,
    has_kids: false,
    is_repeat: false,
  },
  {
    id: "u3",
    nickname: "ミキ",
    age_range: "20代後半",
    bio: "子連れで来ます",
    is_first_time: false,
    has_kids: true,
    is_repeat: true,
  },
  {
    id: "u4",
    nickname: "ユウジ",
    age_range: "40代",
    bio: undefined,
    is_first_time: true,
    has_kids: false,
    is_repeat: false,
  },
  {
    id: "u5",
    nickname: "サクラ",
    age_range: "20代前半",
    bio: "最近AIとばっかり話してた。人に会いたい",
    is_first_time: true,
    has_kids: false,
    is_repeat: false,
  },
  {
    id: "u6",
    nickname: "ケン",
    age_range: "30代後半",
    bio: "前回も来ました。今回は友達も誘いました",
    is_first_time: false,
    has_kids: false,
    is_repeat: true,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    user_id: "u1",
    type: "wave_nearby",
    title: "新しい波が近くで起きます",
    body: "2.3km先で今週末、朝の植樹イベントが起きます。あなた向けに選ばれました",
    wave_id: "w1",
    is_read: false,
    created_at: "2026-03-28T09:00:00Z",
  },
  {
    id: "n2",
    user_id: "u1",
    type: "reminder",
    title: "明日の植樹イベント",
    body: "明日の「朝の植樹」、タケシさんも来るみたいです",
    wave_id: "w1",
    is_read: false,
    created_at: "2026-03-27T18:00:00Z",
  },
  {
    id: "n3",
    user_id: "u1",
    type: "isolation_nudge",
    title: "最近、外で誰かに会いましたか？",
    body: "近くで小さな波が起きています。焚き火の夜 — あなたの1.8km先",
    wave_id: "w3",
    is_read: true,
    created_at: "2026-03-25T20:00:00Z",
  },
  {
    id: "n4",
    user_id: "u1",
    type: "contribution_report",
    title: "あなたの参加が届きました",
    body: "先週の植樹で3本の木が植わりました。地域への影響レポートが届きました",
    wave_id: "w1",
    is_read: true,
    created_at: "2026-03-22T10:00:00Z",
  },
  {
    id: "n5",
    user_id: "u1",
    type: "continuation_nudge",
    title: "前回から2週間",
    body: "次の波がすでに近くで動いています。春の味噌づくりはいかがですか？",
    wave_id: "w2",
    is_read: true,
    created_at: "2026-03-20T09:00:00Z",
  },
];

export const mockCommitments: Commitment[] = [
  {
    id: "cm1",
    user_id: "u1",
    wave_id: "w1",
    level: "going",
    created_at: "2026-03-21T00:00:00Z",
    updated_at: "2026-03-23T00:00:00Z",
  },
  {
    id: "cm2",
    user_id: "u1",
    wave_id: "w2",
    level: "curious",
    created_at: "2026-03-25T00:00:00Z",
    updated_at: "2026-03-25T00:00:00Z",
  },
];

export function getOrgForWave(wave: Wave): Organization | undefined {
  return mockOrganizations.find((o) => o.id === wave.organizer_id);
}

export function getCommitmentForWave(waveId: string): Commitment | undefined {
  return mockCommitments.find((c) => c.wave_id === waveId);
}

export function getClipsForWave(waveId: string): Clip[] {
  return mockClips.filter((c) => c.wave_id === waveId);
}
