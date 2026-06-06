import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  userEmail?: string;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
  onClose?: () => void;
}

type NavItem = {
  label: string;
  iconType: string;
  path?: string;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", iconType: "home", path: "/admin" },
  { label: "Produtos", iconType: "box", path: "/admin/produtos" },
  { label: "Categorias", iconType: "grid", path: "/admin/categorias" },
  { label: "Pedidos", iconType: "clipboard", disabled: true },
  { label: "Depoimentos", iconType: "message", disabled: true },
  { label: "Configurações", iconType: "settings", disabled: true },
  { label: "Usuários", iconType: "users", disabled: true },
  { label: "Mídia", iconType: "image", disabled: true },
  { label: "Cupons", iconType: "ticket", disabled: true },
  { label: "Relatórios", iconType: "chart", disabled: true },
];

// Ícones SVG premium com stroke 1.5-2px
function IconSVG({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 21v-8h6v8" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M6 4h12l2 3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-3z" />
          <path d="M14 8l-4-3M6 7l6 5 6-5" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "clipboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M9 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
          <path d="M9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          <path d="M9 11h6M9 15h6" />
        </svg>
      );
    case "message":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "image":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case "ticket":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <circle cx="12" cy="12" r="1" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M3 3v18a2 2 0 0 0 2 2h16" />
          <path d="M7 16v-5m5 5v-8m5 8v-3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
          <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 21v-8h6v8" />
        </svg>
      );
  }
}

export default function AdminSidebar({
  userEmail,
  isLoggingOut,
  onLogout,
  onClose,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    userEmail?.split("@")[0] ||
    "Administrador";
  
  const avatarInitial =
    (user?.user_metadata?.display_name || user?.user_metadata?.name || user?.user_metadata?.full_name || userEmail || "A")[0].toUpperCase();

  function getItemClassName(item: NavItem) {
    const isActive = isItemActive(item);
    const isDashboard = item.path === "/admin";

    if (isActive && isDashboard) {
      return "bg-[linear-gradient(90deg,rgba(255,255,255,0.24),rgba(233,242,223,0.18))] text-white border border-[#D5E1C7]/35 shadow-[inset_0_1px_4px_rgba(255,255,255,0.22),0_8px_22px_rgba(15,24,9,0.18)]";
    }

    if (isActive) {
      return "bg-gradient-to-r from-white/20 to-white/10 text-white shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)] border border-white/15";
    }

    if (item.disabled) {
      return "text-white/45 cursor-default";
    }

    return "text-white/80 hover:text-white hover:bg-white/10";
  }

  function isItemActive(item: NavItem) {
    if (!item.path) return false;
    if (item.path === "/admin") {
      return location.pathname === "/admin";
    }
    if (item.path === "/admin/produtos") {
      return location.pathname.startsWith("/admin/produtos");
    }

    return location.pathname.startsWith(item.path);
  }

  return (
    <div className="h-full flex flex-col py-5">
      <div className="px-5 mb-12 flex items-start justify-between">
        <div>
          <h1
            className="text-[1.65rem] font-normal text-white leading-[1.02]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            La Pistaccheria
          </h1>
          <p className="text-[8.5px] tracking-[0.18em] uppercase text-white/50 mt-1.5">
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

      <nav aria-label="Admin navigation" className="flex-1 space-y-1.5 px-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (!item.path || item.disabled) return;
              navigate(item.path);
              onClose?.();
            }}
            className={`w-full text-left flex items-center gap-3 px-3.5 py-3 text-sm tracking-[0.02em] transition-all duration-200 rounded-md ${getItemClassName(item)}`}
          >
            <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${isItemActive(item) ? "text-white" : "text-white/90"}`}>
              <IconSVG type={item.iconType} className="w-full h-full" />
            </div>
            <span className={`font-medium ${item.path === "/admin" && isItemActive(item) ? "tracking-[0.03em]" : ""}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 pb-5 border-t border-white/15">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/8 transition-colors mb-2">
          {/* Avatar com inicial - aumentado */}
          <div
            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}
          >
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-snug">
              {displayName}
            </p>
            <p className="text-[8px] text-white/60 tracking-[0.05em] uppercase mt-0.5 font-medium">Administrador</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm tracking-[0.02em] text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors rounded-md"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span className="font-medium">{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </button>
      </div>
    </div>
  );
}
