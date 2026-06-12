import { Fragment } from "react";
import { promises as fs } from "fs";
import path from "path";
import { getContent, getHighlights, getPlayers, getTeams } from "@/lib/db";
import { Navbar } from "@/components/site/Navbar";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Hero } from "@/components/site/Hero";
import { Teams } from "@/components/site/Teams";
import { Highlights } from "@/components/site/Highlights";
import { Gallery } from "@/components/site/Gallery";
import { Register } from "@/components/site/Register";
import { Footer } from "@/components/site/Footer";
import { BlocksLive } from "@/components/site/Blocks";
import type { BlocksPosition } from "@/lib/types";

// Always render fresh so admin edits to content show immediately.
export const dynamic = "force-dynamic";

// Returns `/<name>` if that file exists under /public, else undefined. Lets you
// drop in a default background image without going through the admin uploader.
async function fileBg(name: string): Promise<string | undefined> {
  try {
    await fs.access(path.join(process.cwd(), "public", name));
    return `/${name}`;
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const [content, teams, players, highlights] = await Promise.all([
    getContent(),
    getTeams(),
    getPlayers(),
    getHighlights(),
  ]);
  const enabledTeams = teams.filter((t) => t.enabled).sort((a, b) => a.order - b.order);

  const position: BlocksPosition = content.blocksPosition ?? "afterTeams";
  const bg = (id: string) => content.backgrounds?.[id];

  // "Home" is the hero section. Use the admin-uploaded background if set,
  // otherwise fall back to public/home.jpg if you've dropped one in.
  const homeBg = bg("home") ?? (await fileBg("home.jpg"));

  // Every section can be reordered / hidden from the admin (Sections page).
  const sectionEls: Record<string, React.ReactNode> = {
    home: <Hero key="home" hero={content.hero} styles={content.styles} bg={homeBg} />,
    teams: <Teams key="teams" teams={enabledTeams} players={players} bg={bg("teams")} />,
    highlights: <Highlights key="highlights" highlights={highlights} bg={bg("highlights")} />,
    gallery: <Gallery key="gallery" gallery={content.gallery ?? []} bg={bg("gallery")} styles={content.styles} />,
    register: <Register key="register" bg={bg("register")} />,
    contact: <Footer key="contact" footer={content.footer} styles={content.styles} />,
  };
  const DEFAULT_ORDER = ["home", "teams", "highlights", "gallery", "register", "contact"];
  const order = (content.sectionOrder ?? DEFAULT_ORDER).filter((id) => id in sectionEls);
  for (const id of DEFAULT_ORDER) if (!order.includes(id)) order.push(id);
  const hidden = new Set(content.hiddenSections ?? []);
  const visibleOrder = order.filter((id) => !hidden.has(id));

  // Custom blocks (if any) anchor relative to certain sections.
  const blocksBefore: Record<string, BlocksPosition> = { register: "beforeRegister", contact: "beforeFooter" };
  const blocksAfter: Record<string, BlocksPosition> = { home: "afterHero", teams: "afterTeams" };
  const blocks = (at: BlocksPosition | undefined) =>
    at && position === at ? <BlocksLive blocks={content.blocks} /> : null;

  return (
    <>
      <ScrollProgress />
      <Navbar sections={visibleOrder} />
      <main>
        {visibleOrder.map((id) => (
          <Fragment key={id}>
            {blocks(blocksBefore[id])}
            {sectionEls[id]}
            {blocks(blocksAfter[id])}
          </Fragment>
        ))}
      </main>
    </>
  );
}
