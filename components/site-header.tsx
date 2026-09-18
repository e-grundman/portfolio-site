import { HeaderName } from "./header-name";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="mb-6 flex flex-col gap-3 border-b-2 border-line py-5 sm:flex-row sm:items-center sm:justify-between">
      <HeaderName />
      {/* Pushed right on its own, so the nav stays put when the name is absent. */}
      <div className="sm:ml-auto">
        <SiteNav />
      </div>
    </header>
  );
}
