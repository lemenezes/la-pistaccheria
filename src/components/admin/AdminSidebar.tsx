interface AdminSidebarProps {
  userEmail?: string;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
}

type NavItem = { label: string; icon: string; active?: boolean; disabled?: boolean };

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Produtos", icon: "◫", active: true },
  { label: "Categorias", icon: "⊟", disabled: true },
  { label: "Pedidos", icon: "☰", disabled: true },
  { label: "Depoimentos", icon: "◻", disabled: true },
  { label: "Configurações", icon: "⚙", disabled: true },
  { label: "Usuários", icon: "○", disabled: true },
  { label: "Mídia", icon: "▣", disabled: true },
  { label: "Cupons", icon: "◈", disabled: true },
  { label: "Relatórios", icon: "▦", disabled: true },
];

export default function AdminSidebar({
  userEmail,
  isLoggingOut,
  onLogout,
}: AdminSidebarProps) {
  return (
    <div className="h-full flex flex-col py-5">
      <div className="px-5 mb-6">
        <h1
          className="text-[1.4rem] font-normal text-white leading-[1.1]"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          La Pistaccheria
        </h1>
        <p className="text-[9px] tracking-[0.18em] uppercase text-white/45 mt-0.5">
          Confeitaria Italiana
        </p>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-0.5 px-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled && !item.active}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 text-[11px] tracking-[0.12em] transition-colors rounded-[3px] ${
              item.active
                ? "bg-white/15 text-white"
                : item.disabled
                  ? "text-white/30 cursor-default"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-[14px] w-4 text-center opacity-70">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-2 pt-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] text-white/45 truncate">{userEmail}</p>
          <p className="text-[9px] text-white/30 tracking-[0.1em] uppercase mt-0.5">Administrador</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] tracking-[0.12em] text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors rounded-[3px]"
        >
          <span className="text-[14px] w-4 text-center opacity-70">↑</span>
          {isLoggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </div>
  );
}
