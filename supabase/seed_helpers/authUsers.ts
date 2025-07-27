import { SeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";

export const authUsers = async ({ seed }: { seed: SeedClient }) => {
  const encrypted_password =
    "$2a$10$tiis0hbieVK5zA.BEQZ.y.kJyiwUYCPG9kGFRFsVefKK4wSTSff4a"; // Ab123456

  const userMinData = [
    {
      firstname: "user1",
      lastname: "last",
      firstname_kana: "k_user1",
      lastname_kana: "k_last",
      encrypted_password,
      raw_app_meta_data: {
        role: "community_admin",
        revenuecat_entitlement_ids: ["paid_user"],
        revenuecat_subscription_product_id: "standard",
      },
    },
    {
      firstname: "user2",
      lastname: "last",
      firstname_kana: "k_user2",
      lastname_kana: "k_last",
      encrypted_password,
      raw_app_meta_data: {
        role: "community_admin",
      },
    },
    {
      firstname: "user3",
      lastname: "last",
      firstname_kana: "k_user3",
      lastname_kana: "k_last",
      encrypted_password,
    },
    {
      firstname: "user4",
      lastname: "last",
      firstname_kana: "k_user4",
      lastname_kana: "k_last",
      encrypted_password,
    },
  ];
  let arr: any[] = Array.from({ length: 7 }, (v, i) => ({}));
  await seed.auth_users(
    [...userMinData, ...arr].map((y, i) => {
      const email = `user${i + 1}@test.com`; // somehow if we don't calculate it outside object all becomes same user1@test.com
      return {
        instance_id: "00000000-0000-0000-0000-000000000000", // required for login
        aud: "authenticated", // required for login
        role: "authenticated", // required for login
        email,
        encrypted_password: y.encrypted_password,
        raw_app_meta_data: y.raw_app_meta_data,
        public_users: (x) =>
          x(1, (a) => ({
            email,
            firstname: y.firstname,
            lastname: y.lastname,
            firstname_kana: y.firstname_kana,
            lastname_kana: y.lastname_kana,
            u_user_interests: copycat
              .someOf(a.index, [1, 3], seed.$store.m_interests)
              .map((x) => ({ interest: x.id })),
            u_user_skills: copycat
              .someOf(a.index, [1, 3], seed.$store.m_skills)
              .map((x) => ({ skill: x.id })),
          })),
      };
    }),
  );
};
