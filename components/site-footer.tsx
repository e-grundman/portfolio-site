import { site } from "@/lib/site";
import { ProfileLinks } from "./profile-links";

export function SiteFooter() {
  return (
    <footer className="mt-24 flex flex-col gap-4 border-t border-rule py-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {site.name} · {new Date().getFullYear()}
      </p>
      <ProfileLinks withEmail />
    </footer>
  );
}
