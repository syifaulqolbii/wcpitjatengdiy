import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboard";

export const runtime = "nodejs";

const W = 1200;
const H = 630;

const COLOR = {
  bg: "#0D0D0D",
  card: "#1A1A1A",
  green: "#00E676",
  white: "#FFFFFF",
  muted: "#E0E0E0",
  border: "#333333",
  gold: "#FACC1E",
  silver: "#CBD5E1",
  bronze: "#D97706",
};

function rankColor(rank: number): string {
  if (rank === 1) return COLOR.gold;
  if (rank === 2) return COLOR.silver;
  if (rank === 3) return COLOR.bronze;
  return COLOR.muted;
}

function Avatar({ name, rank, size }: { name: string; rank: number; size: number }) {
  const initial = (name?.[0] ?? "?").toUpperCase();
  const border = rankColor(rank);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${border}`,
        background: "#262626",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: border, fontSize: size * 0.4, fontWeight: 900 }}>{initial}</span>
    </div>
  );
}

function PodiumColumn({
  entry,
  height,
  width,
  offsetY,
}: {
  entry: { rank: number; name: string; totalPoints: number };
  height: number;
  width: number;
  offsetY: number;
}) {
  const border = rankColor(entry.rank);
  const avatarSize = entry.rank === 1 ? 64 : 52;

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: offsetY,
      }}
    >
      <Avatar name={entry.name} rank={entry.rank} size={avatarSize} />
      <div
        style={{
          marginTop: 8,
          width: "100%",
          height,
          background: "rgba(38,38,38,0.7)",
          borderTop: `2px solid ${border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            fontSize: entry.rank === 1 ? 72 : 56,
            fontWeight: 900,
            color: border,
            opacity: 0.15,
            lineHeight: 1,
          }}
        >
          {entry.rank}
        </span>
        <span
          style={{
            color: COLOR.white,
            fontSize: entry.rank === 1 ? 14 : 12,
            fontWeight: 700,
            textAlign: "center",
            padding: "0 8px",
            maxWidth: width - 16,
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          {entry.name}
        </span>
        <span
          style={{
            color: COLOR.green,
            fontSize: entry.rank === 1 ? 16 : 13,
            fontWeight: 700,
            marginTop: 4,
            zIndex: 1,
          }}
        >
          {entry.totalPoints} pts
        </span>
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const groupId = searchParams.get("groupId");
  const groupName = searchParams.get("groupName") ?? "Klasemen";

  const allEntries = await getLeaderboardData(groupId ?? null);
  const top10 = allEntries.slice(0, 10);

  const podium = [
    top10.find((e) => e.rank === 2),
    top10.find((e) => e.rank === 1),
    top10.find((e) => e.rank === 3),
  ].filter(Boolean) as typeof top10;

  const rest = top10.filter((e) => e.rank > 3);

  const PADDING = 40;
  const HEADER_H = 90;
  const PODIUM_H = H - HEADER_H - PADDING * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: COLOR.bg,
          display: "flex",
          flexDirection: "column",
          padding: PADDING,
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* green ambient glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(0,230,118,0.07)",
            filter: "blur(60px)",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
          <span
            style={{
              color: COLOR.green,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            KLASEMEN
          </span>
          <span
            style={{
              color: COLOR.white,
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: -1,
            }}
          >
            {groupName}
          </span>
        </div>

        {/* Body: podium left + list right */}
        <div style={{ display: "flex", flex: 1, gap: 24 }}>
          {/* Podium */}
          <div
            style={{
              width: 320,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {podium.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const colHeight = isFirst ? 180 : isSecond ? 140 : 110;
              const colWidth = isFirst ? 110 : 95;
              const offsetY = isFirst ? 0 : isSecond ? 40 : 70;
              return (
                <PodiumColumn
                  key={entry.userId}
                  entry={entry}
                  height={colHeight}
                  width={colWidth}
                  offsetY={offsetY}
                />
              );
            })}
          </div>

          {/* List rank 4–10 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            {rest.map((entry) => (
              <div
                key={entry.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: COLOR.card,
                  border: `1px solid ${COLOR.border}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    color: COLOR.muted,
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: 0.5,
                    width: 22,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {entry.rank}
                </span>
                <span
                  style={{
                    color: COLOR.white,
                    fontSize: 14,
                    fontWeight: 600,
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  {entry.name}
                </span>
                <span
                  style={{
                    color: COLOR.green,
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {entry.totalPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
