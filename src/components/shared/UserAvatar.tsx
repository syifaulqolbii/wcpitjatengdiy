import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
  textClassName?: string;
};

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function UserAvatar({ name, image, className, textClassName }: UserAvatarProps) {
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full", className)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name || "User avatar"} className="h-full w-full object-cover" />
      ) : (
        <span className={cn("font-display font-bold uppercase", textClassName)}>{getInitials(name)}</span>
      )}
    </div>
  );
}
