/**
 * ! Executing this script will delete all data in your database and seed it with 10 auth_users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { copycat } from "@snaplet/copycat";
import { createSeedClient, SeedClient } from "@snaplet/seed";
import { authUsers } from "seed_helpers/authUsers";
import { user1Events } from "seed_helpers/user1Events";
import { user1Friends } from "seed_helpers/user1Friends";

const main = async () => {
  const seed = await createSeedClient({ dryRun: true });

  // Truncate all tables in the database
  await seed.$resetDatabase();

  await generateData(seed);
  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  console.log("Database seeded successfully!");

  process.exit();
};

main();

const generateData = async (seed: SeedClient) => {
  const staffMinData = [
    {
      name: "マイコネサポート",
      password: "$2a$10$n8EyzBILomMWFEpQxTDLs.EtOnjruSoBxI.J2jpm3nCBgixJA83Xy", // Ab123456
    },
    {
      name: "una",
      password: "$2a$10$n8EyzBILomMWFEpQxTDLs.EtOnjruSoBxI.J2jpm3nCBgixJA83Xy", // Ab123456
    },
    {
      name: "はるか",
      password: "$2a$10$Z7Qp6wY8YXQwD3rN9C5j5.0CtBpRtQwXKcQ9zjF8rG1Q9bZwF7hK",
    },
  ];
  const staffCategories = [
    { name: "フィットネスジャンキー" },
    { name: "旅行好き" },
    { name: "ペット愛好家" },
    { name: "ファッション愛好家" },
    { name: "冒険好き" },
    { name: "ゲームプレイヤー" },
    { name: "スポーツ愛好者" },
    { name: "読書好き" },
    { name: "アート＆クラフト愛好家" },
    { name: "テクノロジーエンスーシアスト" },
    { name: "料理マスター" },
    { name: "音楽好き" },
    { name: "ビジネスウーマン" },
    { name: "映画マニア" },
    { name: "アウトドア好き" },
  ];
  const eventCategories = [
    {
      title: "芸術展示会",
      image_url:
        "https://cdn.britannica.com/87/2087-004-264616BB/Mona-Lisa-oil-wood-panel-Leonardo-da.jpg",
      display_order: null,
    },
    {
      title: "学術",
      image_url:
        "https://cdn.vox-cdn.com/thumbor/MQU8A_Z_Cfq0UGhxiH82OBi7qWM=/0x502:6280x5212/1200x800/filters:focal(0x502:6280x5212)/cdn.vox-cdn.com/uploads/chorus_image/image/46622634/shutterstock_172355312.0.0.jpg",
      display_order: null,
    },
    {
      title: "フード",
      image_url:
        "https://cdn.britannica.com/36/123536-050-95CB0C6E/Variety-fruits-vegetables.jpg",
      display_order: null,
    },
    {
      title: "ファッション",
      image_url:
        "https://m.media-amazon.com/images/I/61NduGwyh5L._AC_UF1000,1000_QL80_.jpg",
      display_order: 3,
    },
    {
      title: "音楽コンサート12",
      image_url:
        "https://daily.jstor.org/wp-content/uploads/2023/01/good_times_with_bad_music_1050x700.jpg",
      display_order: 1,
    },
    {
      title: "スポーツイベント12",
      image_url:
        "https://img.freepik.com/free-vector/soccer-volleyball-baseball-rugby-equipment_1441-4026.jpg?w=2000",
      display_order: 2,
    },
  ];
  const interests = [
    { name: "猫" },
    { name: "音楽" },
    { name: "料理" },
    { name: "旅行" },
    { name: "読書" },
    { name: "映画" },
    { name: "アート" },
    { name: "写真" },
    { name: "スポーツ" },
    { name: "自然" },
    { name: "科学" },
    { name: "テクノロジー" },
    { name: "歴史" },
    { name: "飲食" },
    { name: "ファッション" },
    { name: "アニメ" },
    { name: "マンガ" },
    { name: "ゲーム" },
    { name: "車" },
    { name: "自転車" },
    { name: "航空" },
    { name: "宇宙" },
    { name: "釣り" },
    { name: "ガーデニング" },
    { name: "ペット" },
    { name: "料理" },
    { name: "アウトドア" },
    { name: "ウォーキング" },
    { name: "ビール" },
    { name: "ワイン" },
    { name: "日本文化" },
    { name: "外国語" },
    { name: "アート" },
    { name: "美術" },
    { name: "音楽" },
    { name: "ダンス" },
    { name: "演劇" },
    { name: "サッカー" },
    { name: "バスケットボール" },
    { name: "テニス" },
    { name: "バドミントン" },
    { name: "卓球" },
    { name: "スキー" },
    { name: "スノーボード" },
    { name: "山登り" },
    { name: "サーフィン" },
    { name: "スカイダイビング" },
    { name: "バンジージャンプ" },
    { name: "自動車レース" },
    { name: "バイク" },
    { name: "ヨガ" },
    { name: "ジムトレーニング" },
    { name: "ボディビル" },
    { name: "ランニング" },
    { name: "サイクリング" },
    { name: "プール" },
    { name: "ボウリング" },
    { name: "ビリヤード" },
    { name: "ゴルフ" },
    { name: "テーブルテニス" },
    { name: "スケートボード" },
    { name: "サーキットトレーニング" },
    { name: "水泳" },
    { name: "柔道" },
    { name: "空手" },
    { name: "剣道" },
    { name: "柔術" },
    { name: "空中ヨガ" },
    { name: "格闘技" },
    { name: "スポーツカードコレクション" },
    { name: "野球" },
    { name: "アメリカンフットボール" },
    { name: "ラグビー" },
    { name: "ハイキング" },
    { name: "キャンプ" },
    { name: "野外活動" },
    { name: "鳥観察" },
    { name: "星空観察" },
    { name: "自然保護" },
    { name: "動物愛護" },
    { name: "環境問題" },
    { name: "人権" },
    { name: "社会問題" },
    { name: "政治" },
    { name: "経済" },
    { name: "教育" },
    { name: "宗教" },
    { name: "哲学" },
    { name: "心理学" },
    { name: "科学技術" },
    { name: "宇宙探査" },
    { name: "ロボティクス" },
    { name: "人工知能" },
    { name: "仮想現実" },
    { name: "クリプトカレンシー" },
    { name: "ブロックチェーン" },
    { name: "仮想通貨" },
    { name: "テクノロジー" },
    { name: "ロボット" },
    { name: "未来予想" },
  ];

  await seed.m_app_settings([
    {
      value: JSON.stringify([
        {
          benefits: ["・毎日3人マッチング", "・ランダムマッチング"],
          bgColor: "#9ca3af",
          displayString: "無料",
          name: "free",
        },
        {
          benefits: ["・毎日5人マッチング", "・カテゴリマッチング"],
          bgColor: "#22d3ee",
          displayString: "7,800円",
          name: "standard",
        },
        {
          benefits: [
            "・毎日5人マッチング",
            "・カテゴリマッチング",
            "・イベント主催を追加",
          ],
          bgColor: "#60a5fa",
          displayString: "19,800円",
          name: "Premium",
        },
      ]),
      name: "price_data",
    },
    {
      value: JSON.stringify({
        until: "2024/02/01 09:00",
        popup: {
          title: "事前登録ありがとうございます",
          messages: ["正式サービスは2024年03月01日に開始予定です。"],
        },
      }),
      name: "pre_release",
    },
    {
      value: JSON.stringify({
        title: "システムメンテナンスの知らせ",
        messages: [
          "ご利用の皆様にはご迷惑をおかけし、申し訳ございません。メンテナンス終了までしばらくお待ちください。",
          "2020年1月1日 0:00〜0:30",
        ],
        okButtonLink: { ios: "apple.com", android: "google.com" },
        _okButtonLink:
          "if you leave this object, ok button will reload app settings",
      }),
      name: "latestVersion",
    },
    {
      value: JSON.stringify({
        title: "システムメンテナンスの知らせ",
        messages: [
          "ご利用の皆様にはご迷惑をおかけし、申し訳ございません。メンテナンス終了までしばらくお待ちください。",
          "2020年1月1日 0:00〜0:30",
        ],
        okButtonLink: { ios: "apple.com", android: "google.com" },
        _okButtonLink:
          "if you leave this object, ok button will reload app settings",
      }),
      name: "underMaintainance",
    },
    {
      value: JSON.stringify({
        popup: {
          title: "アップデートのお願い",
          messages: [
            "現在のバーションでは利用いただけません。",
            "ストアから最新バージョンをダウンロードしてください。",
          ],
          okButtonLink: { ios: "apple.com", android: "google.com" },
        },
        version: "1.0.0",
      }),
      name: "minimalVersion",
    },
    {
      value: JSON.stringify({
        underMaintainance_1: {
          title: "システムメンテナンスの知らせ",
          messages: [
            "ご利用の皆様にはご迷惑をおかけし、申し訳ございません。メンテナンス終了までしばらくお待ちください。",
            "2020年1月1日 0:00〜0:30",
          ],
          okButtonLink: { ios: "apple.com", android: "google.com" },
          _okButtonLink:
            "if you leave this object, ok button will reload app settings",
        },
        preRelease_1: {
          date: "2023/11/15 09:00",
          popup: {
            title: "事前登録誠にありがとうございます。",
            messages: ["正式サービスは2023年11月15日に開始予定です。"],
          },
        },
        latestVersion: {
          popup: {
            title: "アップデートのお願い",
            messages: [
              "新しいバーションがあります。",
              "ストアから最新バージョンをダウンロードしてください。",
            ],
            okButtonLink: { ios: "apple.com", android: "google.com" },
          },
          version: "1.0.0",
        },
        minimalVersion: {
          popup: {
            title: "アップデートのお願い",
            messages: [
              "現在のバーションでは利用いただけません。",
              "ストアから最新バージョンをダウンロードしてください。",
            ],
            okButtonLink: {
              ios: "https://apple.com",
              android: "https://google.com",
            },
          },
          version: "1.0.0",
        },
      }),
      name: "default",
    },
    {
      value: JSON.stringify({
        chat_list: 30,
        chat_detail: 30,
      }),
      name: "last_active_datetime_interval",
    },
  ]);
  await seed.m_industries([
    { name: "情報通信業" },
    { name: "卸売業" },
    { name: "小売業" },
    { name: "不動産業" },
    { name: "建設業" },
    { name: "製造業" },
    { name: "金融業" },
    { name: "医療・福祉" },
    { name: "教育・研究" },
    { name: "宿泊・飲食業" },
  ]);
  await seed.m_interests(interests);
  await seed.m_skills([
    { name: "プログラミング" },
    { name: "ウェブ開発" },
    { name: "データ分析" },
    { name: "コンピューターグラフィックス" },
    { name: "デザイン" },
    { name: "プロジェクト管理" },
    { name: "コミュニケーション" },
    { name: "問題解決" },
    { name: "チームワーク" },
    { name: "リーダーシップ" },
    { name: "財務管理" },
    { name: "言語学習" },
    { name: "プレゼンテーション" },
    { name: "マーケティング" },
    { name: "セールススキル" },
    { name: "デジタルマーケティング" },
    { name: "ソーシャルメディアマネジメント" },
    { name: "コピーライティング" },
    { name: "プロジェクト管理" },
    { name: "時間管理" },
    { name: "クリエイティビティ" },
    { name: "問題解決" },
    { name: "マネージャー" },
    { name: "カスタマーサービス" },
    { name: "人事管理" },
    { name: "調査スキル" },
    { name: "プレゼンテーション" },
    { name: "心理学" },
    { name: "教育" },
    { name: "プロトタイピング" },
    { name: "デジタルアート" },
    { name: "映像編集" },
    { name: "音楽制作" },
    { name: "フォトグラフィー" },
    { name: "3Dモデリング" },
    { name: "語学力" },
    { name: "プロトコルデザイン" },
    { name: "人工知能" },
    { name: "機械学習" },
    { name: "ブロックチェーン" },
    { name: "セキュリティスキル" },
    { name: "ロボティクス" },
    { name: "物理学" },
    { name: "生物学" },
    { name: "化学" },
    { name: "宇宙科学" },
    { name: "環境科学" },
    { name: "データベース管理" },
    { name: "クラウドコンピューティング" },
    { name: "ネットワーク管理" },
    { name: "サイバーセキュリティ" },
    { name: "クリエイティブライティング" },
    { name: "小説執筆" },
    { name: "詩の執筆" },
    { name: "コミック制作" },
    { name: "ジャーナリズム" },
    { name: "歴史研究" },
    { name: "心理学研究" },
    { name: "社会学研究" },
    { name: "哲学" },
    { name: "芸術鑑賞" },
    { name: "音楽理論" },
    { name: "アウトドア活動" },
    { name: "ハイキング" },
    { name: "キャンプ" },
    { name: "釣り" },
    { name: "サーフィン" },
    { name: "登山" },
    { name: "自転車修理" },
    { name: "園芸" },
    { name: "料理" },
    { name: "パン焼き" },
    { name: "料理" },
    { name: "ワイン知識" },
    { name: "ビール知識" },
    { name: "カクテル作成" },
    { name: "バーテンダー" },
    { name: "バーベキュー" },
    { name: "日本料理" },
    { name: "中国料理" },
    { name: "イタリア料理" },
    { name: "フランス料理" },
    { name: "スパニッシュ料理" },
    { name: "タイ料理" },
    { name: "インド料理" },
    { name: "日本茶道" },
    { name: "料理" },
    { name: "スポーツ" },
    { name: "ヨガ" },
    { name: "ピラティス" },
    { name: "スイミング" },
    { name: "ボクシング" },
    { name: "テコンドー" },
    { name: "柔道" },
    { name: "空手" },
    { name: "剣道" },
    { name: "野球" },
    { name: "サッカー" },
    { name: "バスケットボール" },
    { name: "バドミントン" },
  ]);
  await seed.s_staff_categories(staffCategories);

  const profiles = seed.$store.public_users;
  await authUsers({ seed });

  // s_staffs
  await seed.auth_users(
    staffMinData.map((y, i) => {
      const email = `staff${i + 1}@test.com`; // somehow if we don't calculate it outside object all becomes same staff1@test.com
      return {
        email,
        s_staffs: (x) =>
          x(1, (a) => ({
            email,
            name: y.name,
            s_matches: (b) =>
              b(1, (c) => ({
                user_id: profiles[1]?.id,
              })),
            s_staff_categories: copycat.someOf(
              a.index,
              [1, 3],
              staffCategories,
            ),
          })),
      };
    }),
  );
  const supportUserId = profiles[0]?.id;
  await seed.m_app_settings([
    {
      value: supportUserId,
      name: "SUPPORT_USER_ID",
    },
  ]);

  await seed.u_event_categories(eventCategories);

  await user1Events({ seed });

  await user1Friends({ seed });

  await seed.c_community((x) => {
    return x(5, (a) => {
      const manager_id = profiles[a.index < 3 ? 0 : 1]?.id;
      return {
        name: `community${a.index}`,
        manager_id,
        c_community_posts: (b) => b({ min: 0, max: 5 }, (c) => ({})),
        c_community_members: (b) =>
          b({ min: 0, max: profiles.length }, (c) => ({})),
      };
    });
  });

  // somehow snaplet creates strange NULL values and postgres does not recognize it
  // for now we  use seed_bucket.sql file and sed/ buckets
  // await seed.buckets([
  //   {
  //     name: "staff_public",
  //     public: true,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: undefined,
  //   },
  //   {
  //     name: "public_assets",
  //     public: true,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: [],
  //   },
  //   {
  //     name: "user_public",
  //     public: true,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: [],
  //   },
  //   {
  //     name: "message_images",
  //     public: false,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: [],
  //   },
  //   {
  //     name: "event_public",
  //     public: true,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: [],
  //   },
  //   {
  //     name: "community_public",
  //     public: true,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: [],
  //   },
  //   {
  //     name: "community_posts_public",
  //     public: true,
  //     avif_autodetection: false,
  //     file_size_limit: null,
  //     allowed_mime_types: [],
  //   },
  // ]);
  // await seed.objects([
  //   {
  //     bucket_id: "public_assets",
  //     name: ".emptyFolderPlaceholder",
  //     owner: null,
  //     last_accessed_at: "2023-10-06 15:25:07.706544+00",
  //     metadata:
  //       '{"eTag": ""d41d8cd98f00b204e9800998ecf8427e"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2023-10-06T15:25:08.000Z", "contentLength": 0, "httpStatusCode": 200}',
  //   },
  //   {
  //     bucket_id: "user_public",
  //     name: "f93e49da-3dcb-4c67-90be-d1af85fe760f/profile_bg.jpg",
  //     owner: "f93e49da-3dcb-4c67-90be-d1af85fe760f",
  //     last_accessed_at: "2023-10-08 13:01:41.010648+00",
  //     metadata:
  //       '{"eTag": ""3ac227836a3c15690e760286b5c84bb2"", "size": 105363, "mimetype": "image/jpeg", "cacheControl": "no-cache", "lastModified": "2023-10-08T13:01:41.000Z", "contentLength": 105363, "httpStatusCode": 200}',
  //   },
  // ]);
};
