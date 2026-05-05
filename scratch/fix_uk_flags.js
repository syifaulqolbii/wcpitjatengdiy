require("dotenv").config({ path: ".env.local" });

const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  const updates = {
    englandA: (await sql`UPDATE matches SET flag_a = 'gb-eng' WHERE team_a = 'England'`).count,
    englandB: (await sql`UPDATE matches SET flag_b = 'gb-eng' WHERE team_b = 'England'`).count,
    scotlandA: (await sql`UPDATE matches SET flag_a = 'gb-sct' WHERE team_a = 'Scotland'`).count,
    scotlandB: (await sql`UPDATE matches SET flag_b = 'gb-sct' WHERE team_b = 'Scotland'`).count,
  };

  const rows = await sql`
    SELECT team_a, flag_a, team_b, flag_b
    FROM matches
    WHERE team_a IN ('England', 'Scotland') OR team_b IN ('England', 'Scotland')
    ORDER BY kickoff_time;
  `;

  console.log(JSON.stringify(updates, null, 2));
  console.table(rows);
}

main()
  .then(async () => {
    await sql.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await sql.end();
    process.exit(1);
  });
