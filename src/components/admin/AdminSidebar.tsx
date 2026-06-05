interface AdminSidebarProps {
  userEmail?: string;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
  onClose?: () => void;
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
  onClose,
}: AdminSidebarProps) {
  return (
    <div className="h-full flex flex-col py-5">
      <div className="px-5 mb-6 flex items-start justify-between">
        <div>
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
        {/* Botão fechar (mobile/tablet) */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center text-white/50 hover:text-white text-[20px] leading-none -mt-0.5 -mr-1"
            aria-label="Fechar menu"
          >
            ×
          </button>
        )}
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

      <div className="px-3 pt-3 pb-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-[4px] hover:bg-white/5 transition-colors mb-1">
          {/* Avatar com inicial */}
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold uppercase"
            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
          >
            {userEmail ? userEmail[0].toUpperCase() : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-white/80 truncate leading-tight">
              {userEmail ? userEmail.split("@")[0] : "Admin"}
            </p>
            <p className="text-[9px] text-white/35 tracking-[0.08em] uppercase mt-0.5">Administrador</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] tracking-[0.1em] text-white/45 hover:text-white/80 hover:bg-white/8 disabled:opacity-40 transition-colors rounded-[3px]"
        >
          <span className="text-[13px] w-4 text-center">→</span>
          {isLoggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>
    </div>
  );
}
