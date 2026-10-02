import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بيان إمكانية الوصول – النادي الأرثوذكسي لكرة السلة",
  alternates: { canonical: "/accessibility" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
