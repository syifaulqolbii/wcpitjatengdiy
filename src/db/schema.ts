import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  unique,
  boolean,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────
// Managed by Better Auth — extended with admin plugin fields
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("player").notNull(), // 'player' | 'admin'
  // Better Auth admin plugin fields
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Better Auth: Sessions ────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // Better Auth admin plugin: impersonation support
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Better Auth: Accounts ───────────────────────────────────
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Better Auth: Verifications ──────────────────────────────
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Matches ─────────────────────────────────────────────────
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  flagA: text("flag_a").notNull(),
  flagB: text("flag_b").notNull(),
  group: text("group").notNull(),
  kickoffTime: timestamp("kickoff_time", { withTimezone: true }).notNull(),
  status: text("status").default("upcoming").notNull(),
  scoreA: integer("score_a"),
  scoreB: integer("score_b"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Predictions ─────────────────────────────────────────────
export const predictions = pgTable(
  "predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    predictedA: integer("predicted_a").notNull(),
    predictedB: integer("predicted_b").notNull(),
    points: integer("points"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserMatch: unique("uq_user_match").on(table.userId, table.matchId),
  })
);

// ─── Settings ────────────────────────────────────────────────
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─── Tournament Predictions ────────────────────────────────────
export const tournamentPredictions = pgTable(
  'tournament_predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    predictedWinner: text('predicted_winner').notNull(),
    predictedWinnerFlag: text('predicted_winner_flag').notNull(),
    points: integer('points'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userUnique: unique('tournament_pred_user_unique').on(table.userId),
  })
);


export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rank: integer('rank').notNull(),
  totalPoints: integer('total_points').notNull(),
  snapshotAt: timestamp('snapshot_at', { withTimezone: true }).defaultNow().notNull(),
});
// ─── Type Exports ────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type TournamentPrediction = typeof tournamentPredictions.$inferSelect;
export type NewTournamentPrediction = typeof tournamentPredictions.$inferInsert;
export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type NewLeaderboardSnapshot = typeof leaderboardSnapshots.$inferInsert;
