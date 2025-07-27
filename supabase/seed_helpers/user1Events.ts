import { copycat } from "@snaplet/copycat";
import { SeedClient } from "@snaplet/seed";
import dayjs from "dayjs";

export const user1Events = async ({ seed }: { seed: SeedClient }) => {
  const profiles = seed.$store.public_users;
  const user1Id = profiles[0]?.id; // user1Id
  await seed.u_events([
    {
      name: "past attended event",
      category: copycat.oneOf(1, seed.$store.u_event_categories).id,
      sub_category_id: copycat.oneOf(1, seed.$store.u_event_categories).id,
      is_published: true,
      featured: 1,
      start_datetime: dayjs().subtract(5, "day").toISOString(),
      end_datetime: dayjs().add(3, "day").toISOString(),
      u_event_attends: (x) => x(1, { user_id: user1Id }),
    },
    {
      name: "past reviewed event",
      is_published: true,
      featured: 2,
      start_datetime: dayjs().subtract(5, "day").toISOString(),
      u_event_attends: (x) => x(1, { user_id: user1Id }),
      u_event_reviews: (x) =>
        x(3, (a) => ({
          user_id: copycat.oneOf(a.index, seed.$store.public_users).id,
        })),
      end_datetime: dayjs().add(3, "day").toISOString(),
    },
    {
      name: "past not attended event",
      is_published: true,
      featured: 3,
      start_datetime: dayjs().subtract(5, "day").toISOString(),
      end_datetime: dayjs().add(3, "day").toISOString(),
    },
    {
      name: "future unpublished event",
      is_published: false,
      featured: 4,
      start_datetime: dayjs().add(5, "day").toISOString(),
      end_datetime: dayjs().add(30, "day").toISOString(),
    },
    {
      name: "future published event",
      is_published: true,
      featured: 5,
      start_datetime: dayjs().add(5, "day").toISOString(),
      end_datetime: dayjs().add(30, "day").toISOString(),
    },
  ]);
  // await seed.u_events((x) =>
  //   x(3, (a) => ({
  //     category: copycat.oneOf(a.index, seed.$store.u_event_categories).id,
  //     sub_category_id: copycat.oneOf(a.index, seed.$store.u_event_categories)
  //       .id,
  //     u_event_attends: copycat
  //       .someOf(a.index, [1, 3], profiles)
  //       .map((y) => ({ user_id: y.id })),
  //     u_event_reviews: copycat
  //       .someOf(a.index, [1, 3], profiles)
  //       .map((y) => ({ user_id: y.id })),
  //     is_published: true,
  //     featured: a.index,
  //     start_datetime: dayjs().add(5, "day").toISOString(),
  //     end_datetime: dayjs().add(45, "day").toISOString(),
  //   })),
  // );
};
