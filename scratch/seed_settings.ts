import { db } from "../src/db";
import { settings } from "../src/db/schema";

async function main() {
  console.log("Seeding settings...");
  
  const defaultSettings = [
    { key: 'champion_points', value: '30' },
    { key: 'champion_deadline', value: '2026-06-10T19:00:00Z' },
    { key: 'champion_winner', value: '' }
  ];

  for (const s of defaultSettings) {
    await db.insert(settings)
      .values(s)
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: s.value }
      });
  }

  console.log("Settings seeded successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding settings:", err);
  process.exit(1);
});
