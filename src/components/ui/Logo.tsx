import { cn } from "@/lib/cn";

// OYC Nazareth crest. Committed brand asset at /public/logo.png (not the
// admin-uploaded /uploads folder, which is git-ignored and wouldn't deploy).
// Sized by the height class passed in (h-11, h-16, h-24…) with width auto so it
// keeps its aspect ratio.
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="OYC Nazareth"
      className={cn("h-16 w-auto select-none object-contain", className)}
    />
  );
}
