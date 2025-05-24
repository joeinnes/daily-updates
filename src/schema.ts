import { co, Group, Loaded, z } from "jazz-tools";

export const Area = co.map({
  name: co.plainText(),
  color: z.string(),
});

export const Update = co.map({
  type: z.literal("update"),
  update: co.plainText(),
  details: co.richText(),
  date: z.date(),
  area: Area,
  link: z.optional(z.string()),
});

export const DraftUpdate = co.map({
  type: z.literal("update"),
  update: z.optional(co.plainText()),
  details: z.optional(co.richText()),
  date: z.optional(z.date()),
  area: z.optional(Area),
  link: z.optional(z.string()),
});

export const MusicUpdate = co.map({
  type: z.literal("music"),
  name: co.plainText(),
  link: z.string(),
  date: z.date(),
});

export const UpdatesAccountRoot = co.map({
  areas: co.list(Area),
  updates: co.list(z.discriminatedUnion("type", [Update, MusicUpdate])),
  draft: DraftUpdate,
});

export const UpdatesAccount = co
  .account({
    root: UpdatesAccountRoot,
    profile: co.profile(),
  })
  .withMigration(async (account, creationProps?: { name: string }) => {
    if (account.root === undefined) {
      account.root = UpdatesAccountRoot.create({
        areas: co.list(Area).create([], Group.create()),
        updates: co.list(Update).create([], Group.create()),
        draft: DraftUpdate.create({
          update: co.plainText().create(""),
          details: co.richText().create(""),
          type: "update",
        }),
      });
    }
    await account.ensureLoaded({
      resolve: {
        root: true,
      },
    });
    if (account.root.areas === undefined) {
      account.root.areas = co.list(Area).create([], Group.create());
    }
    if (account.root.updates === undefined) {
      account.root.updates = co.list(Update).create([], Group.create());
    }
    if (account.profile === undefined) {
      const profileGroup = Group.create();
      profileGroup.addMember("everyone", "reader");

      account.profile = co
        .profile()
        .create(
          { name: creationProps?.name || "Anonymous User" },
          profileGroup
        );
    }
  });

export type UpdateItem =
  | Loaded<
      typeof Update,
      {
        area: true;
      }
    >
  | Loaded<typeof MusicUpdate>;
