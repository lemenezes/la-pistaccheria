import type { ReactNode } from "react";

interface AdminShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  panel: ReactNode;
}

export default function AdminShell({ sidebar, main, panel }: AdminShellProps) {
  return (
    <div className="min-h-screen flex bg-[#F4F2EE]">
      <aside
        className="w-[200px] shrink-0 h-screen sticky top-0 flex flex-col"
        style={{ background: "#2A3D20" }}
      >
        {sidebar}
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">{main}</main>

      <aside
        className="w-[380px] shrink-0 h-screen sticky top-0 flex flex-col border-l border-[#E5E0D8] bg-[#FAF7F2]"
      >
        {panel}
      </aside>
    </div>
  );
}
