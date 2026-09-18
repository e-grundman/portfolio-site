import { site } from "@/lib/site";
import { Barcode } from "./barcode";
import { ProfileLinks } from "./profile-links";

export function SiteFooter() {
  return (
    <footer className="mt-20 flex flex-col gap-6 border-t-2 border-line py-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-56">
        <Barcode value={`${site.name} ${new Date().getFullYear()}`} height={32} />
        <p className="mt-2 field-label text-xs text-muted">
          {site.name} · {new Date().getFullYear()}
        </p>
      </div>
      <ProfileLinks withEmail />
    </footer>
  );
}
