import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام – النادي الأرثوذكسي لكرة السلة",
  alternates: { canonical: "/terms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
