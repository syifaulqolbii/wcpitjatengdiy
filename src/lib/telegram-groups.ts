// Replace the groupId values below with actual UUIDs from your database.
// Run: SELECT id, name, invite_code FROM groups;
const TELEGRAM_GROUPS: Record<string, { groupId: string; groupName: string }> = {
  itjateng: { groupId: "9ecacc67-ac67-4052-906a-690c1c4e0830", groupName: "IT Jateng DIY" },
  itopera: { groupId: "c736c7c4-094a-4c17-ac49-609fd7c4ec1a", groupName: "IT OPERA" },
};

export function resolveTelegramGroup(input: string): { groupId: string; groupName: string } | null {
  const key = input.trim().toLowerCase();
  return TELEGRAM_GROUPS[key] ?? null;
}

export function getAllGroups(): { key: string; groupName: string }[] {
  return Object.entries(TELEGRAM_GROUPS).map(([key, val]) => ({ key, groupName: val.groupName }));
}
