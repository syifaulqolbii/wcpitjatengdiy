import logo from "@/components/img/it_jaya_putih.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center", className)} aria-label="IT-JAYA">
      <img
        src={logo.src}
        alt="IT-JAYA - IT Operation Jateng & DIY"
        className={cn(
          "h-auto w-full object-contain",
          compact ? "max-w-[180px]" : "max-w-[420px]"
        )}
      />
    </div>
  );
}
