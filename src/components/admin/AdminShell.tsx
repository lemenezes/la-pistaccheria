import type { ReactNode } from "react";

interface AdminShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  panel?: ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export default function AdminShell({
  sidebar,
  main,
  panel,
  isSidebarOpen,
  onCloseSidebar,
}: AdminShellProps) {
  return (
    <div className="min-h-screen flex bg-[#F4F2EE]">
      {/* Overlay backdrop (mobile/tablet) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed drawer no mobile/tablet, sticky no desktop */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col
          w-[240px] lg:w-[200px] shrink-0
          transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "#2A3D20" }}
      >
        {sidebar}
      </aside>

      {/* Área principal */}
      <main className="flex-1 min-w-0 overflow-auto bg-[#F4F2EE]">{main}</main>

      {/* Painel direito: hidden no mobile, visível no md+ */}
      {panel ? (
        <aside className="hidden md:flex md:w-[300px] lg:w-[380px] shrink-0 h-screen sticky top-0 flex-col border-l border-[#E5E0D8] bg-[#FAF7F2]">
          {panel}
        </aside>
      ) : null}
    </div>
  );
}
