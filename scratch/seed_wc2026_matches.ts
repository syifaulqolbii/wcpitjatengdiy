import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const matchValues = [
  { teamA: "Mexico", teamB: "South Africa", flagA: "🇲🇽", flagB: "🇿🇦", group: "Group A", kickoffTime: new Date("2026-06-11T19:00:00Z"), status: "upcoming" },
  { teamA: "South Korea", teamB: "Czechia", flagA: "🇰🇷", flagB: "🇨🇿", group: "Group A", kickoffTime: new Date("2026-06-12T02:00:00Z"), status: "upcoming" },
  { teamA: "Czechia", teamB: "South Africa", flagA: "🇨🇿", flagB: "🇿🇦", group: "Group A", kickoffTime: new Date("2026-06-18T16:00:00Z"), status: "upcoming" },
  { teamA: "Mexico", teamB: "South Korea", flagA: "🇲🇽", flagB: "🇰🇷", group: "Group A", kickoffTime: new Date("2026-06-19T01:00:00Z"), status: "upcoming" },
  { teamA: "Czechia", teamB: "Mexico", flagA: "🇨🇿", flagB: "🇲🇽", group: "Group A", kickoffTime: new Date("2026-06-25T01:00:00Z"), status: "upcoming" },
  { teamA: "South Africa", teamB: "South Korea", flagA: "🇿🇦", flagB: "🇰🇷", group: "Group A", kickoffTime: new Date("2026-06-25T01:00:00Z"), status: "upcoming" },

  { teamA: "Canada", teamB: "Bosnia and Herzegovina", flagA: "🇨🇦", flagB: "🇧🇦", group: "Group B", kickoffTime: new Date("2026-06-12T19:00:00Z"), status: "upcoming" },
  { teamA: "Qatar", teamB: "Switzerland", flagA: "🇶🇦", flagB: "🇨🇭", group: "Group B", kickoffTime: new Date("2026-06-13T19:00:00Z"), status: "upcoming" },
  { teamA: "Switzerland", teamB: "Bosnia and Herzegovina", flagA: "🇨🇭", flagB: "🇧🇦", group: "Group B", kickoffTime: new Date("2026-06-18T19:00:00Z"), status: "upcoming" },
  { teamA: "Canada", teamB: "Qatar", flagA: "🇨🇦", flagB: "🇶🇦", group: "Group B", kickoffTime: new Date("2026-06-18T22:00:00Z"), status: "upcoming" },
  { teamA: "Switzerland", teamB: "Canada", flagA: "🇨🇭", flagB: "🇨🇦", group: "Group B", kickoffTime: new Date("2026-06-24T19:00:00Z"), status: "upcoming" },
  { teamA: "Bosnia and Herzegovina", teamB: "Qatar", flagA: "🇧🇦", flagB: "🇶🇦", group: "Group B", kickoffTime: new Date("2026-06-24T19:00:00Z"), status: "upcoming" },

  { teamA: "Brazil", teamB: "Morocco", flagA: "🇧🇷", flagB: "🇲🇦", group: "Group C", kickoffTime: new Date("2026-06-13T22:00:00Z"), status: "upcoming" },
  { teamA: "Haiti", teamB: "Scotland", flagA: "🇭🇹", flagB: "gb-sct", group: "Group C", kickoffTime: new Date("2026-06-14T01:00:00Z"), status: "upcoming" },
  { teamA: "Scotland", teamB: "Morocco", flagA: "gb-sct", flagB: "🇲🇦", group: "Group C", kickoffTime: new Date("2026-06-19T22:00:00Z"), status: "upcoming" },
  { teamA: "Brazil", teamB: "Haiti", flagA: "🇧🇷", flagB: "🇭🇹", group: "Group C", kickoffTime: new Date("2026-06-20T00:30:00Z"), status: "upcoming" },
  { teamA: "Scotland", teamB: "Brazil", flagA: "gb-sct", flagB: "🇧🇷", group: "Group C", kickoffTime: new Date("2026-06-24T22:00:00Z"), status: "upcoming" },
  { teamA: "Morocco", teamB: "Haiti", flagA: "🇲🇦", flagB: "🇭🇹", group: "Group C", kickoffTime: new Date("2026-06-24T22:00:00Z"), status: "upcoming" },

  { teamA: "United States", teamB: "Paraguay", flagA: "🇺🇸", flagB: "🇵🇾", group: "Group D", kickoffTime: new Date("2026-06-13T01:00:00Z"), status: "upcoming" },
  { teamA: "Australia", teamB: "Turkey", flagA: "🇦🇺", flagB: "🇹🇷", group: "Group D", kickoffTime: new Date("2026-06-14T04:00:00Z"), status: "upcoming" },
  { teamA: "United States", teamB: "Australia", flagA: "🇺🇸", flagB: "🇦🇺", group: "Group D", kickoffTime: new Date("2026-06-19T19:00:00Z"), status: "upcoming" },
  { teamA: "Turkey", teamB: "Paraguay", flagA: "🇹🇷", flagB: "🇵🇾", group: "Group D", kickoffTime: new Date("2026-06-20T03:00:00Z"), status: "upcoming" },
  { teamA: "Turkey", teamB: "United States", flagA: "🇹🇷", flagB: "🇺🇸", group: "Group D", kickoffTime: new Date("2026-06-26T02:00:00Z"), status: "upcoming" },
  { teamA: "Paraguay", teamB: "Australia", flagA: "🇵🇾", flagB: "🇦🇺", group: "Group D", kickoffTime: new Date("2026-06-26T02:00:00Z"), status: "upcoming" },

  { teamA: "Germany", teamB: "Curaçao", flagA: "🇩🇪", flagB: "🇨🇼", group: "Group E", kickoffTime: new Date("2026-06-14T17:00:00Z"), status: "upcoming" },
  { teamA: "Ivory Coast", teamB: "Ecuador", flagA: "🇨🇮", flagB: "🇪🇨", group: "Group E", kickoffTime: new Date("2026-06-14T23:00:00Z"), status: "upcoming" },
  { teamA: "Germany", teamB: "Ivory Coast", flagA: "🇩🇪", flagB: "🇨🇮", group: "Group E", kickoffTime: new Date("2026-06-20T20:00:00Z"), status: "upcoming" },
  { teamA: "Ecuador", teamB: "Curaçao", flagA: "🇪🇨", flagB: "🇨🇼", group: "Group E", kickoffTime: new Date("2026-06-21T00:00:00Z"), status: "upcoming" },
  { teamA: "Curaçao", teamB: "Ivory Coast", flagA: "🇨🇼", flagB: "🇨🇮", group: "Group E", kickoffTime: new Date("2026-06-25T20:00:00Z"), status: "upcoming" },
  { teamA: "Ecuador", teamB: "Germany", flagA: "🇪🇨", flagB: "🇩🇪", group: "Group E", kickoffTime: new Date("2026-06-25T20:00:00Z"), status: "upcoming" },

  { teamA: "Netherlands", teamB: "Japan", flagA: "🇳🇱", flagB: "🇯🇵", group: "Group F", kickoffTime: new Date("2026-06-14T20:00:00Z"), status: "upcoming" },
  { teamA: "Sweden", teamB: "Tunisia", flagA: "🇸🇪", flagB: "🇹🇳", group: "Group F", kickoffTime: new Date("2026-06-15T02:00:00Z"), status: "upcoming" },
  { teamA: "Netherlands", teamB: "Sweden", flagA: "🇳🇱", flagB: "🇸🇪", group: "Group F", kickoffTime: new Date("2026-06-20T17:00:00Z"), status: "upcoming" },
  { teamA: "Tunisia", teamB: "Japan", flagA: "🇹🇳", flagB: "🇯🇵", group: "Group F", kickoffTime: new Date("2026-06-21T04:00:00Z"), status: "upcoming" },
  { teamA: "Japan", teamB: "Sweden", flagA: "🇯🇵", flagB: "🇸🇪", group: "Group F", kickoffTime: new Date("2026-06-25T23:00:00Z"), status: "upcoming" },
  { teamA: "Tunisia", teamB: "Netherlands", flagA: "🇹🇳", flagB: "🇳🇱", group: "Group F", kickoffTime: new Date("2026-06-25T23:00:00Z"), status: "upcoming" },

  { teamA: "Belgium", teamB: "Egypt", flagA: "🇧🇪", flagB: "🇪🇬", group: "Group G", kickoffTime: new Date("2026-06-15T19:00:00Z"), status: "upcoming" },
  { teamA: "Iran", teamB: "New Zealand", flagA: "🇮🇷", flagB: "🇳🇿", group: "Group G", kickoffTime: new Date("2026-06-16T01:00:00Z"), status: "upcoming" },
  { teamA: "Belgium", teamB: "Iran", flagA: "🇧🇪", flagB: "🇮🇷", group: "Group G", kickoffTime: new Date("2026-06-21T19:00:00Z"), status: "upcoming" },
  { teamA: "New Zealand", teamB: "Egypt", flagA: "🇳🇿", flagB: "🇪🇬", group: "Group G", kickoffTime: new Date("2026-06-22T01:00:00Z"), status: "upcoming" },
  { teamA: "Egypt", teamB: "Iran", flagA: "🇪🇬", flagB: "🇮🇷", group: "Group G", kickoffTime: new Date("2026-06-27T03:00:00Z"), status: "upcoming" },
  { teamA: "New Zealand", teamB: "Belgium", flagA: "🇳🇿", flagB: "🇧🇪", group: "Group G", kickoffTime: new Date("2026-06-27T03:00:00Z"), status: "upcoming" },

  { teamA: "Spain", teamB: "Cape Verde", flagA: "🇪🇸", flagB: "🇨🇻", group: "Group H", kickoffTime: new Date("2026-06-15T16:00:00Z"), status: "upcoming" },
  { teamA: "Saudi Arabia", teamB: "Uruguay", flagA: "🇸🇦", flagB: "🇺🇾", group: "Group H", kickoffTime: new Date("2026-06-15T22:00:00Z"), status: "upcoming" },
  { teamA: "Spain", teamB: "Saudi Arabia", flagA: "🇪🇸", flagB: "🇸🇦", group: "Group H", kickoffTime: new Date("2026-06-21T16:00:00Z"), status: "upcoming" },
  { teamA: "Uruguay", teamB: "Cape Verde", flagA: "🇺🇾", flagB: "🇨🇻", group: "Group H", kickoffTime: new Date("2026-06-21T22:00:00Z"), status: "upcoming" },
  { teamA: "Cape Verde", teamB: "Saudi Arabia", flagA: "🇨🇻", flagB: "🇸🇦", group: "Group H", kickoffTime: new Date("2026-06-27T00:00:00Z"), status: "upcoming" },
  { teamA: "Uruguay", teamB: "Spain", flagA: "🇺🇾", flagB: "🇪🇸", group: "Group H", kickoffTime: new Date("2026-06-27T00:00:00Z"), status: "upcoming" },

  { teamA: "France", teamB: "Senegal", flagA: "🇫🇷", flagB: "🇸🇳", group: "Group I", kickoffTime: new Date("2026-06-16T19:00:00Z"), status: "upcoming" },
  { teamA: "Iraq", teamB: "Norway", flagA: "🇮🇶", flagB: "🇳🇴", group: "Group I", kickoffTime: new Date("2026-06-16T22:00:00Z"), status: "upcoming" },
  { teamA: "France", teamB: "Iraq", flagA: "🇫🇷", flagB: "🇮🇶", group: "Group I", kickoffTime: new Date("2026-06-22T21:00:00Z"), status: "upcoming" },
  { teamA: "Norway", teamB: "Senegal", flagA: "🇳🇴", flagB: "🇸🇳", group: "Group I", kickoffTime: new Date("2026-06-23T00:00:00Z"), status: "upcoming" },
  { teamA: "Norway", teamB: "France", flagA: "🇳🇴", flagB: "🇫🇷", group: "Group I", kickoffTime: new Date("2026-06-26T19:00:00Z"), status: "upcoming" },
  { teamA: "Senegal", teamB: "Iraq", flagA: "🇸🇳", flagB: "🇮🇶", group: "Group I", kickoffTime: new Date("2026-06-26T19:00:00Z"), status: "upcoming" },

  { teamA: "Argentina", teamB: "Algeria", flagA: "🇦🇷", flagB: "🇩🇿", group: "Group J", kickoffTime: new Date("2026-06-17T01:00:00Z"), status: "upcoming" },
  { teamA: "Austria", teamB: "Jordan", flagA: "🇦🇹", flagB: "🇯🇴", group: "Group J", kickoffTime: new Date("2026-06-17T04:00:00Z"), status: "upcoming" },
  { teamA: "Argentina", teamB: "Austria", flagA: "🇦🇷", flagB: "🇦🇹", group: "Group J", kickoffTime: new Date("2026-06-22T17:00:00Z"), status: "upcoming" },
  { teamA: "Jordan", teamB: "Algeria", flagA: "🇯🇴", flagB: "🇩🇿", group: "Group J", kickoffTime: new Date("2026-06-23T03:00:00Z"), status: "upcoming" },
  { teamA: "Algeria", teamB: "Austria", flagA: "🇩🇿", flagB: "🇦🇹", group: "Group J", kickoffTime: new Date("2026-06-28T02:00:00Z"), status: "upcoming" },
  { teamA: "Jordan", teamB: "Argentina", flagA: "🇯🇴", flagB: "🇦🇷", group: "Group J", kickoffTime: new Date("2026-06-28T02:00:00Z"), status: "upcoming" },

  { teamA: "Portugal", teamB: "DR Congo", flagA: "🇵🇹", flagB: "🇨🇩", group: "Group K", kickoffTime: new Date("2026-06-17T17:00:00Z"), status: "upcoming" },
  { teamA: "Uzbekistan", teamB: "Colombia", flagA: "🇺🇿", flagB: "🇨🇴", group: "Group K", kickoffTime: new Date("2026-06-18T02:00:00Z"), status: "upcoming" },
  { teamA: "Portugal", teamB: "Uzbekistan", flagA: "🇵🇹", flagB: "🇺🇿", group: "Group K", kickoffTime: new Date("2026-06-23T17:00:00Z"), status: "upcoming" },
  { teamA: "Colombia", teamB: "DR Congo", flagA: "🇨🇴", flagB: "🇨🇩", group: "Group K", kickoffTime: new Date("2026-06-24T02:00:00Z"), status: "upcoming" },
  { teamA: "Colombia", teamB: "Portugal", flagA: "🇨🇴", flagB: "🇵🇹", group: "Group K", kickoffTime: new Date("2026-06-27T23:30:00Z"), status: "upcoming" },
  { teamA: "DR Congo", teamB: "Uzbekistan", flagA: "🇨🇩", flagB: "🇺🇿", group: "Group K", kickoffTime: new Date("2026-06-27T23:30:00Z"), status: "upcoming" },

  { teamA: "England", teamB: "Croatia", flagA: "gb-eng", flagB: "🇭🇷", group: "Group L", kickoffTime: new Date("2026-06-17T20:00:00Z"), status: "upcoming" },
  { teamA: "Ghana", teamB: "Panama", flagA: "🇬🇭", flagB: "🇵🇦", group: "Group L", kickoffTime: new Date("2026-06-17T23:00:00Z"), status: "upcoming" },
  { teamA: "England", teamB: "Ghana", flagA: "gb-eng", flagB: "🇬🇭", group: "Group L", kickoffTime: new Date("2026-06-23T20:00:00Z"), status: "upcoming" },
  { teamA: "Panama", teamB: "Croatia", flagA: "🇵🇦", flagB: "🇭🇷", group: "Group L", kickoffTime: new Date("2026-06-23T23:00:00Z"), status: "upcoming" },
  { teamA: "Panama", teamB: "England", flagA: "🇵🇦", flagB: "gb-eng", group: "Group L", kickoffTime: new Date("2026-06-27T21:00:00Z"), status: "upcoming" },
  { teamA: "Croatia", teamB: "Ghana", flagA: "🇭🇷", flagB: "🇬🇭", group: "Group L", kickoffTime: new Date("2026-06-27T21:00:00Z"), status: "upcoming" },
];

async function main() {
  const { db } = await import("../src/db");
  const { matches } = await import("../src/db/schema");

  const inserted = await db
    .insert(matches)
    .values(matchValues)
    .returning({
      id: matches.id,
      group: matches.group,
      kickoffTime: matches.kickoffTime,
    });

  const [range] = await db
    .select({
      total: sql<number>`count(*)::int`,
      earliest: sql<Date>`min(${matches.kickoffTime})`,
      latest: sql<Date>`max(${matches.kickoffTime})`,
    })
    .from(matches);

  const breakdown = await db
    .select({
      group: matches.group,
      totalMatches: sql<number>`count(*)::int`,
    })
    .from(matches)
    .groupBy(matches.group)
    .orderBy(matches.group);

  console.log(JSON.stringify({
    inserted: inserted.length,
    range,
    breakdown,
  }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
