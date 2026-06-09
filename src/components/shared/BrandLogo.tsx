import logo from "@/components/img/it_jaya_putih.png";
import operaLogo from "@/components/img/opera.png";
import aocLogo from "@/components/img/aoc.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 md:gap-3", className)} aria-label="Brand Logos">
      <img
        src={logo.src}
        alt="IT-JAYA"
        className={cn(
          "h-auto object-contain",
          compact ? "max-h-[24px]" : "max-h-[40px] md:max-h-[56px]"
        )}
      />
      <img
        src={operaLogo.src}
        alt="IT Opera"
        className={cn(
          "h-auto object-contain",
          compact ? "max-h-[24px]" : "max-h-[40px] md:max-h-[56px]"
        )}
      />
      <img
        src={aocLogo.src}
        alt="AOC"
        className={cn(
          "h-auto object-contain",
          compact ? "max-h-[24px]" : "max-h-[40px] md:max-h-[56px]"
        )}
      />
    </div>
  );
}
