import { SeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import dayjs from "dayjs";

export const user1Friends = async ({ seed }: { seed: SeedClient }) => {
  const profiles = seed.$store.public_users;
  /**
   * user1 is friend with user2 ( from user1)
   */
  await seed.u_matches((x) => {
    const user1_id = profiles[0]?.id;
    const user2_id = profiles[1]?.id;
    return x(1, {
      user1_id, // create from me and to me
      user2_id, // create from me and to me
      u_match_reports: (b) =>
        b(1, {
          reporter_id: user1_id,
        }),
      u_messages: (b) =>
        b(3, (c) => ({
          user_id: copycat.oneOf(c.index, [user1_id, user2_id]),
        })),
    });
  });

  /**
   * user1 is friend with user5 ( from user5 )
   */
  await seed.u_matches((x) => {
    const user1_id = profiles[4]?.id;
    const user2_id = profiles[0]?.id;
    return x(1, {
      user1_id, // create from me and to me
      user2_id, // create from me and to me
      u_match_reports: (b) =>
        b(1, {
          reporter_id: user1_id,
        }),
      u_messages: (b) =>
        b(3, (c) => ({
          user_id: copycat.oneOf(c.index, [user1_id, user2_id]),
        })),
    });
  });

  /**
   * user1 is sent friend request to user3
   */
  await seed.u_recommendations((x) => {
    const user1_id = profiles[0]?.id;
    const user2_id = profiles[2]?.id;
    // to create recommendation from user1
    return x(1, {
      user1_id,
      user2_id,
      status: "ACCEPTED",
      last_action_at: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    });
  });

  /**
   * user1 is sent friend request to user6 status REJECTED
   */
  await seed.u_recommendations((x) => {
    const user1_id = profiles[0]?.id;
    const user2_id = profiles[5]?.id;
    // to create recommendation from user1
    return x(1, {
      user1_id,
      user2_id,
      status: "REJECTED",
      last_action_at: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    });
  });

  /**
   * user1 is received friend request from user4
   */
  await seed.u_recommendations((x) => {
    const user1_id = profiles[3]?.id;
    const user2_id = profiles[0]?.id;
    // to create recommendation to me
    return x(1, {
      user1_id, // create from me and to me
      user2_id, // create from me and to me
      status: "ACCEPTED",
      last_action_at: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    });
  });

  /**
   * user1 is received friend request from user7 status NOT_USED
   */
  await seed.u_recommendations((x) => {
    const user1_id = profiles[6]?.id;
    const user2_id = profiles[0]?.id;
    // to create recommendation to me
    return x(1, {
      user1_id, // create from me and to me
      user2_id, // create from me and to me
      status: "NOT_USED",
      last_action_at: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    });
  });

  /**
   * user1 is received friend request from user8 status NULL
   */
  await seed.u_recommendations((x) => {
    const user1_id = profiles[7]?.id;
    const user2_id = profiles[0]?.id;
    // to create recommendation to me
    return x(1, {
      user1_id, // create from me and to me
      user2_id, // create from me and to me
      last_action_at: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    });
  });
};
