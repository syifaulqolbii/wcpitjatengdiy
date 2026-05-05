require("dotenv").config({ path: ".env.local" });

const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

function getCountryCode(flag) {
  if (!flag) return "id";
  if (/^gb-(eng|sct|wls)$/i.test(flag)) return flag.toLowerCase();
  if (flag === "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}") return "gb-eng";
  if (flag === "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}") return "gb-sct";
  if (flag === "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}") return "gb-wls";
  if (flag.length === 2 && /^[a-zA-Z]+$/.test(flag)) return flag.toLowerCase();

  const code = Array.from(flag)
    .map((char) => {
      const codePoint = char.codePointAt(0);
      if (codePoint && codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff) {
        return String.fromCodePoint(codePoint - 0x1f1e6 + 65);
      }
      return "";
    })
    .join("");

  return code.length === 2 ? code.toLowerCase() : "id";
}

async function main() {
  const rows = await sql`
    SELECT team, flag
    FROM (
      SELECT DISTINCT team_a AS team, flag_a AS flag FROM matches
      UNION
      SELECT DISTINCT team_b AS team, flag_b AS flag FROM matches
    ) teams
    ORDER BY team;
  `;

  const audit = rows.map((row) => ({
    team: row.team,
    flag: row.flag,
    flagcdnCode: getCountryCode(row.flag),
  }));

  console.table(audit);
  console.log(`TEAM_COUNT=${audit.length}`);
  console.log(`DEFAULT_ID_COUNT=${audit.filter((row) => row.flagcdnCode === "id" && row.team !== "Indonesia").length}`);
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
