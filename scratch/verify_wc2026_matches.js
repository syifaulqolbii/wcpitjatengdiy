require("dotenv").config({ path: ".env.local" });

const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  const rows = await sql.unsafe(`
    SELECT 
      "group",
      COUNT(*) as total_matches,
      MIN(kickoff_time) as earliest,
      MAX(kickoff_time) as latest
    FROM matches
    GROUP BY "group"
    ORDER BY "group";
  `);

  console.table(
    rows.map((row) => ({
      group: row.group,
      total_matches: Number(row.total_matches),
      earliest: row.earliest,
      latest: row.latest,
    }))
  );
  console.log(`TOTAL_MATCHES=${rows.reduce((sum, row) => sum + Number(row.total_matches), 0)}`);
  console.log(`GROUP_COUNT=${rows.length}`);
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
