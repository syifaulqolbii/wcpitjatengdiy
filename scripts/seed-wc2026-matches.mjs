import postgres from "postgres";

const matches = [
  ["Mexico", "South Africa", "mx", "za", "Group A", "2026-06-11T19:00:00Z"],
  ["South Korea", "Czechia", "kr", "cz", "Group A", "2026-06-12T02:00:00Z"],
  ["Czechia", "South Africa", "cz", "za", "Group A", "2026-06-18T16:00:00Z"],
  ["Mexico", "South Korea", "mx", "kr", "Group A", "2026-06-19T01:00:00Z"],
  ["Czechia", "Mexico", "cz", "mx", "Group A", "2026-06-25T01:00:00Z"],
  ["South Africa", "South Korea", "za", "kr", "Group A", "2026-06-25T01:00:00Z"],
  ["Canada", "Bosnia and Herzegovina", "ca", "ba", "Group B", "2026-06-12T19:00:00Z"],
  ["Qatar", "Switzerland", "qa", "ch", "Group B", "2026-06-13T19:00:00Z"],
  ["Switzerland", "Bosnia and Herzegovina", "ch", "ba", "Group B", "2026-06-18T19:00:00Z"],
  ["Canada", "Qatar", "ca", "qa", "Group B", "2026-06-18T22:00:00Z"],
  ["Switzerland", "Canada", "ch", "ca", "Group B", "2026-06-24T19:00:00Z"],
  ["Bosnia and Herzegovina", "Qatar", "ba", "qa", "Group B", "2026-06-24T19:00:00Z"],
  ["Brazil", "Morocco", "br", "ma", "Group C", "2026-06-13T22:00:00Z"],
  ["Haiti", "Scotland", "ht", "gb-sct", "Group C", "2026-06-14T01:00:00Z"],
  ["Scotland", "Morocco", "gb-sct", "ma", "Group C", "2026-06-19T22:00:00Z"],
  ["Brazil", "Haiti", "br", "ht", "Group C", "2026-06-20T00:30:00Z"],
  ["Scotland", "Brazil", "gb-sct", "br", "Group C", "2026-06-24T22:00:00Z"],
  ["Morocco", "Haiti", "ma", "ht", "Group C", "2026-06-24T22:00:00Z"],
  ["United States", "Paraguay", "us", "py", "Group D", "2026-06-13T01:00:00Z"],
  ["Australia", "Turkey", "au", "tr", "Group D", "2026-06-14T04:00:00Z"],
  ["United States", "Australia", "us", "au", "Group D", "2026-06-19T19:00:00Z"],
  ["Turkey", "Paraguay", "tr", "py", "Group D", "2026-06-20T03:00:00Z"],
  ["Turkey", "United States", "tr", "us", "Group D", "2026-06-26T02:00:00Z"],
  ["Paraguay", "Australia", "py", "au", "Group D", "2026-06-26T02:00:00Z"],
  ["Germany", "Curacao", "de", "cw", "Group E", "2026-06-14T17:00:00Z"],
  ["Ivory Coast", "Ecuador", "ci", "ec", "Group E", "2026-06-14T23:00:00Z"],
  ["Germany", "Ivory Coast", "de", "ci", "Group E", "2026-06-20T20:00:00Z"],
  ["Ecuador", "Curacao", "ec", "cw", "Group E", "2026-06-21T00:00:00Z"],
  ["Curacao", "Ivory Coast", "cw", "ci", "Group E", "2026-06-25T20:00:00Z"],
  ["Ecuador", "Germany", "ec", "de", "Group E", "2026-06-25T20:00:00Z"],
  ["Netherlands", "Japan", "nl", "jp", "Group F", "2026-06-14T20:00:00Z"],
  ["Sweden", "Tunisia", "se", "tn", "Group F", "2026-06-15T02:00:00Z"],
  ["Netherlands", "Sweden", "nl", "se", "Group F", "2026-06-20T17:00:00Z"],
  ["Tunisia", "Japan", "tn", "jp", "Group F", "2026-06-21T04:00:00Z"],
  ["Japan", "Sweden", "jp", "se", "Group F", "2026-06-25T23:00:00Z"],
  ["Tunisia", "Netherlands", "tn", "nl", "Group F", "2026-06-25T23:00:00Z"],
  ["Belgium", "Egypt", "be", "eg", "Group G", "2026-06-15T19:00:00Z"],
  ["Iran", "New Zealand", "ir", "nz", "Group G", "2026-06-16T01:00:00Z"],
  ["Belgium", "Iran", "be", "ir", "Group G", "2026-06-21T19:00:00Z"],
  ["New Zealand", "Egypt", "nz", "eg", "Group G", "2026-06-22T01:00:00Z"],
  ["Egypt", "Iran", "eg", "ir", "Group G", "2026-06-27T03:00:00Z"],
  ["New Zealand", "Belgium", "nz", "be", "Group G", "2026-06-27T03:00:00Z"],
  ["Spain", "Cape Verde", "es", "cv", "Group H", "2026-06-15T16:00:00Z"],
  ["Saudi Arabia", "Uruguay", "sa", "uy", "Group H", "2026-06-15T22:00:00Z"],
  ["Spain", "Saudi Arabia", "es", "sa", "Group H", "2026-06-21T16:00:00Z"],
  ["Uruguay", "Cape Verde", "uy", "cv", "Group H", "2026-06-21T22:00:00Z"],
  ["Cape Verde", "Saudi Arabia", "cv", "sa", "Group H", "2026-06-27T00:00:00Z"],
  ["Uruguay", "Spain", "uy", "es", "Group H", "2026-06-27T00:00:00Z"],
  ["France", "Senegal", "fr", "sn", "Group I", "2026-06-16T19:00:00Z"],
  ["Iraq", "Norway", "iq", "no", "Group I", "2026-06-16T22:00:00Z"],
  ["France", "Iraq", "fr", "iq", "Group I", "2026-06-22T21:00:00Z"],
  ["Norway", "Senegal", "no", "sn", "Group I", "2026-06-23T00:00:00Z"],
  ["Norway", "France", "no", "fr", "Group I", "2026-06-26T19:00:00Z"],
  ["Senegal", "Iraq", "sn", "iq", "Group I", "2026-06-26T19:00:00Z"],
  ["Argentina", "Algeria", "ar", "dz", "Group J", "2026-06-17T01:00:00Z"],
  ["Austria", "Jordan", "at", "jo", "Group J", "2026-06-17T04:00:00Z"],
  ["Argentina", "Austria", "ar", "at", "Group J", "2026-06-22T17:00:00Z"],
  ["Jordan", "Algeria", "jo", "dz", "Group J", "2026-06-23T03:00:00Z"],
  ["Algeria", "Austria", "dz", "at", "Group J", "2026-06-28T02:00:00Z"],
  ["Jordan", "Argentina", "jo", "ar", "Group J", "2026-06-28T02:00:00Z"],
  ["Portugal", "DR Congo", "pt", "cd", "Group K", "2026-06-17T17:00:00Z"],
  ["Uzbekistan", "Colombia", "uz", "co", "Group K", "2026-06-18T02:00:00Z"],
  ["Portugal", "Uzbekistan", "pt", "uz", "Group K", "2026-06-23T17:00:00Z"],
  ["Colombia", "DR Congo", "co", "cd", "Group K", "2026-06-24T02:00:00Z"],
  ["Colombia", "Portugal", "co", "pt", "Group K", "2026-06-27T23:30:00Z"],
  ["DR Congo", "Uzbekistan", "cd", "uz", "Group K", "2026-06-27T23:30:00Z"],
  ["England", "Croatia", "gb-eng", "hr", "Group L", "2026-06-17T20:00:00Z"],
  ["Ghana", "Panama", "gh", "pa", "Group L", "2026-06-17T23:00:00Z"],
  ["England", "Ghana", "gb-eng", "gh", "Group L", "2026-06-23T20:00:00Z"],
  ["Panama", "Croatia", "pa", "hr", "Group L", "2026-06-23T23:00:00Z"],
  ["Panama", "England", "pa", "gb-eng", "Group L", "2026-06-27T21:00:00Z"],
  ["Croatia", "Ghana", "hr", "gh", "Group L", "2026-06-27T21:00:00Z"],
];

const shouldReset = process.argv.includes("--reset");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

try {
  const [{ count: existingCount }] = await sql`select count(*)::int from matches`;

  if (existingCount > 0 && !shouldReset) {
    console.log(`SKIPPED: matches already contains ${existingCount} rows. Pass --reset to replace them.`);
    process.exit(0);
  }

  if (shouldReset) {
    await sql`delete from matches`;
  }

  await sql.begin(async (tx) => {
    for (const [teamA, teamB, flagA, flagB, group, kickoffTime] of matches) {
      await tx`
        insert into matches (team_a, team_b, flag_a, flag_b, "group", kickoff_time, status)
        values (${teamA}, ${teamB}, ${flagA}, ${flagB}, ${group}, ${kickoffTime}, 'upcoming')
      `;
    }
  });

  const summary = await sql`
    select "group", count(*)::int as total_matches, min(kickoff_time) as earliest, max(kickoff_time) as latest
    from matches
    group by "group"
    order by "group"
  `;

  console.table(summary);
  console.log(`TOTAL_MATCHES=${summary.reduce((total, row) => total + row.total_matches, 0)}`);
} finally {
  await sql.end();
}
