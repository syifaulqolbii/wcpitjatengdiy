import { db } from "./src/db";
import { matches } from "./src/db/schema";

async function checkMatches() {
  const allMatches = await db.select().from(matches);
  console.log(JSON.stringify(allMatches, null, 2));
  process.exit(0);
}

checkMatches();
