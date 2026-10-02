import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة ملفات تعريف الارتباط – النادي الأرثوذكسي لكرة السلة",
  alternates: { canonical: "/cookies" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
