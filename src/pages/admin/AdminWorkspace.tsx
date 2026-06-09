import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { getCategories, getProducts } from "../../lib/supabase";
import type { DatabaseCategory, DatabaseProduct } from "../../types/database";

const PERIOD_OPTIONS = [
  { label: "Ultimos 7 dias", value: 7 },
  { label: "Ultimos 30 dias", value: 30 },
  { label: "Ultimos 90 dias", value: 90 },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativePeriod(days: number) {
  return days === 1 ? "ultimo dia" : `ultimos ${days} dias`;
}

function getPeriodStart(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function getPreviousPeriodStart(days: number) {
  const start = getPeriodStart(days);
  start.setDate(start.getDate() - days);
  return start;
}

function getPreviousPeriodEnd(days: number) {
  const end = getPeriodStart(days);
  end.setMilliseconds(-1);
  return end;
}

function formatGrowthLabel(current: number, previous: number, singular: string, plural: string) {
  const diff = current - previous;

  if (diff > 0) {
    return `+${diff} ${diff === 1 ? singular : plural} neste periodo`;
  }

  if (diff < 0) {
    const absoluteDiff = Math.abs(diff);
    return `-${absoluteDiff} ${absoluteDiff === 1 ? singular : plural} vs. periodo anterior`;
  }

  return `Sem variacao neste periodo`;
}

function matchesCategory(product: DatabaseProduct, category: DatabaseCategory) {
  if (product.category_id) {
    return product.category_id === category.id;
  }

  return product.category.trim().toLowerCase() === category.name.trim().toLowerCase();
}

function DashboardIcon({ type }: { type: "products" | "active" | "categories" | "orders" | "arrow" | "plus" }) {
  const commonClassName = "w-5 h-5";

  switch (type) {
    case "products":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={commonClassName}>
          <path d="M6 4h12l2 3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7l2-3z" />
          <path d="M9 9h6" />
        </svg>
      );
    case "active":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={commonClassName}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12 2.2 2.2L15.8 9" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={commonClassName}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={commonClassName}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5c0-1.1-1.1-2-2.5-2s-2.5.9-2.5 2 1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2-2.5-.9-2.5-2" />
          <path d="M12 6.5v11" />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={commonClassName}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "plus":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className={commonClassName}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    default:
      return null;
  }
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  trend,
  accentClassName,
  iconClassName,
  valueClassName,
}: {
  icon: "products" | "active" | "categories" | "orders";
  label: string;
  value: string | number;
  detail: string;
  trend?: string;
  accentClassName: string;
  iconClassName: string;
  valueClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[18px] md:rounded-[24px] border px-3.5 py-3 md:px-5 md:py-6 shadow-[0_22px_60px_rgba(95,87,81,0.08)] md:min-h-[176px] ${accentClassName}`}>
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.72),rgba(255,255,255,0))]" />
      <div className="flex h-full items-start gap-2.5 md:gap-4">
        <div className={`flex h-9 w-9 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-[12px] md:rounded-[18px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] ${iconClassName}`}>
          <DashboardIcon type={icon} />
        </div>
        <div className="min-w-0 self-stretch flex flex-col justify-between">
          <div>
            <p className="text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.08em] text-[#736A62]">{label}</p>
            <p className={`mt-1.5 md:mt-3 leading-none text-[#1C1C1A] ${valueClassName || "text-[2rem] md:text-[3.35rem]"}`}>{value}</p>
          </div>
          <div className="mt-2 md:mt-4 space-y-1">
            <p className="text-[11px] md:text-[12px] leading-relaxed text-[#5E5750]">{detail}</p>
            {trend ? <p className="hidden md:block text-[11px] font-medium uppercase tracking-[0.08em] text-[#82776E]">{trend}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminWorkspace() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [periodDays, setPeriodDays] = useState<(typeof PERIOD_OPTIONS)[number]["value"]>(30);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);

      const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] =
        await Promise.all([getProducts(), getCategories()]);

      if (ignore) return;

      if (productsError || categoriesError) {
        setError(productsError?.message || categoriesError?.message || "Falha ao carregar dashboard.");
        setProducts([]);
        setCategories([]);
      } else {
        setProducts((productsData || []) as DatabaseProduct[]);
        setCategories((categoriesData || []) as DatabaseCategory[]);
      }

      setIsLoading(false);
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  const totalProducts = products.length;
  const activeProducts = useMemo(
    () => products.filter((product) => product.active).length,
    [products]
  );
  const activeCategories = useMemo(
    () => categories.filter((category) => category.active).length,
    [categories]
  );
  const periodStart = useMemo(() => getPeriodStart(periodDays), [periodDays]);
  const previousPeriodStart = useMemo(() => getPreviousPeriodStart(periodDays), [periodDays]);
  const previousPeriodEnd = useMemo(() => getPreviousPeriodEnd(periodDays), [periodDays]);
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const createdAt = new Date(product.created_at);
        return createdAt >= periodStart;
      }),
    [periodStart, products]
  );
  const recentProducts = useMemo(() => filteredProducts.slice(0, 5), [filteredProducts]);
  const newCategoriesInPeriod = useMemo(
    () =>
      categories.filter((category) => {
        const createdAt = new Date(category.created_at);
        return createdAt >= periodStart;
      }).length,
    [categories, periodStart]
  );
  const previousProductsInPeriod = useMemo(
    () =>
      products.filter((product) => {
        const createdAt = new Date(product.created_at);
        return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
      }).length,
    [previousPeriodEnd, previousPeriodStart, products]
  );
  const previousCategoriesInPeriod = useMemo(
    () =>
      categories.filter((category) => {
        const createdAt = new Date(category.created_at);
        return createdAt >= previousPeriodStart && createdAt <= previousPeriodEnd;
      }).length,
    [categories, previousPeriodEnd, previousPeriodStart]
  );
  const activeProductsInPeriod = useMemo(
    () => filteredProducts.filter((product) => product.active).length,
    [filteredProducts]
  );
  const categorySummaries = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        productCount: products.filter((product) => matchesCategory(product, category)).length,
      }))
      .sort((a, b) => {
        if (b.productCount !== a.productCount) {
          return b.productCount - a.productCount;
        }

        return a.category.name.localeCompare(b.category.name, "pt-BR");
      })
      .slice(0, 5);
  }, [categories, products]);
  const productActivationRate = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao sair.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <AdminShell
      isSidebarOpen={mobileSidebarOpen}
      onCloseSidebar={() => setMobileSidebarOpen(false)}
      sidebar={
        <AdminSidebar
          userEmail={user?.email}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onClose={() => setMobileSidebarOpen(false)}
        />
      }
      main={
        <div className="min-h-full bg-[#F4F2EE]">
          <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(205,189,160,0.22),transparent_28%),radial-gradient(circle_at_22%_0%,rgba(78,102,56,0.08),transparent_22%),linear-gradient(180deg,#F7F3ED_0%,#F2EEE8_100%)] px-4 py-5 md:px-6 md:py-6">
            <div className="mx-auto flex w-full max-w-[1260px] flex-col gap-4 md:gap-6">
              {/* Mobile header — card unificado, lg:hidden */}
              <div className="lg:hidden overflow-hidden rounded-[16px] border border-[#E6DFD6] bg-white shadow-[0_2px_12px_rgba(95,87,81,0.06)]">
                {/* Faixa de navegação — hamburguer + nome da marca */}
                <div className="flex items-center gap-2.5 px-4 pt-3 pb-2.5 border-b border-[#F0EAE2]">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen((value) => !value)}
                    className="flex flex-col gap-[5px] p-1.5 -ml-1 text-[#7A716A] hover:text-[#1C1C1A] shrink-0"
                    aria-label="Abrir menu"
                  >
                    <span className="block w-5 h-[2px] bg-current rounded" />
                    <span className="block w-5 h-[2px] bg-current rounded" />
                    <span className="block w-5 h-[2px] bg-current rounded" />
                  </button>
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#B4ACA5]">
                    La Pistaccheria
                  </span>
                </div>
                {/* Conteúdo da página */}
                <div className="px-4 pt-3.5 pb-3 border-b border-[#EEE8DF]">
                  <h1 className="text-[1.3rem] font-semibold text-[#1C1C1A] leading-tight">Dashboard</h1>
                  <p className="text-[12px] text-[#9A9189] mt-1">Produtos, categorias e atividades recentes.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-3">
                  <label className="flex flex-1 items-center gap-2 h-9 rounded-[8px] border border-[#E2DBD1] bg-[#F9F7F4] px-3 text-[#5F5751]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className="h-4 w-4 shrink-0 text-[#9A9189]">
                      <rect x="5" y="4" width="14" height="16" rx="2" />
                      <path d="M8 2v4M16 2v4M8 10h8" />
                    </svg>
                    <select
                      value={periodDays}
                      onChange={(event) => setPeriodDays(Number(event.target.value) as (typeof PERIOD_OPTIONS)[number]["value"])}
                      className="w-full bg-transparent text-[13px] text-[#3E3934] outline-none"
                      aria-label="Filtrar periodo do dashboard"
                    >
                      {PERIOD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {error ? (
                  <div className="px-4 py-2.5 bg-[#FBF2F2] border-t border-[#E0C8C8] text-[12px] text-[#8A3A3A]">
                    {error}
                  </div>
                ) : null}
              </div>

              {/* Desktop header */}
              <section className="hidden lg:block rounded-[28px] border border-[#E5DED4] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,243,235,0.94))] px-5 py-6 shadow-[0_30px_90px_rgba(42,61,32,0.08)] md:px-7">
                <div className="flex items-start justify-between">
                  <div>
                    <h1
                      className="text-[2.4rem] leading-[0.94] text-[#1C1C1A] md:text-[3rem]"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      Dashboard
                    </h1>
                    <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-[#6F665E] md:text-[15px]">
                      Resumo dos produtos, categorias e atividades recentes.
                    </p>
                  </div>
                  <label className="flex min-w-[190px] items-center gap-3 rounded-full border border-[#E2DBD1] bg-white/80 px-4 py-3 text-[#5F5751] shadow-[0_10px_25px_rgba(95,87,81,0.05)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className="h-4 w-4 shrink-0">
                      <rect x="5" y="4" width="14" height="16" rx="2" />
                      <path d="M8 2v4M16 2v4M8 10h8" />
                    </svg>
                    <select
                      value={periodDays}
                      onChange={(event) => setPeriodDays(Number(event.target.value) as (typeof PERIOD_OPTIONS)[number]["value"])}
                      className="w-full bg-transparent text-[13px] font-medium text-[#3E3934] outline-none"
                      aria-label="Filtrar periodo do dashboard"
                    >
                      {PERIOD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {error ? (
                  <div className="mt-5 rounded-[14px] border border-[#E0C8C8] bg-[#FBF2F2] px-4 py-3 text-[13px] text-[#8A3A3A]">
                    {error}
                  </div>
                ) : null}
              </section>

              {/* Summary cards — always visible */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
                <SummaryCard
                  icon="products"
                  label="Total de produtos"
                  value={isLoading ? "..." : totalProducts}
                  detail={isLoading ? "Carregando catalogo" : `${activeProducts} ativos · ${totalProducts - activeProducts} inativos`}
                  trend={isLoading ? undefined : formatGrowthLabel(filteredProducts.length, previousProductsInPeriod, "novo", "novos")}
                  accentClassName="border-[#DCE7D2] bg-[linear-gradient(180deg,rgba(241,247,236,0.98),rgba(252,249,243,0.98))]"
                  iconClassName="border-[#C9D9BB] bg-[#E6F0DE] text-[#315025]"
                />
                <SummaryCard
                  icon="active"
                  label="Produtos ativos"
                  value={isLoading ? "..." : activeProducts}
                  detail={isLoading ? "Carregando operacao" : `${productActivationRate}% do catalogo ativo`}
                  trend={isLoading ? undefined : `${activeProductsInPeriod} ativos criados nos ${formatRelativePeriod(periodDays)}`}
                  accentClassName="border-[#D3DED0] bg-[linear-gradient(180deg,rgba(230,238,226,0.98),rgba(248,245,239,0.98))]"
                  iconClassName="border-[#B8C9B4] bg-[#DCE8D7] text-[#23361C]"
                />
                <SummaryCard
                  icon="categories"
                  label="Categorias ativas"
                  value={isLoading ? "..." : activeCategories}
                  detail={isLoading ? "Carregando categorias" : `De ${categories.length} no total · ${categories.length - activeCategories} inativas`}
                  trend={isLoading ? undefined : formatGrowthLabel(newCategoriesInPeriod, previousCategoriesInPeriod, "nova", "novas")}
                  accentClassName="border-[#E7DEC9] bg-[linear-gradient(180deg,rgba(247,241,225,0.98),rgba(252,249,243,0.98))]"
                  iconClassName="border-[#E0D1AF] bg-[#F3E7C9] text-[#876923]"
                />
                <SummaryCard
                  icon="orders"
                  label="Pedidos"
                  value="Modulo em breve"
                  detail="Integração de pedidos ainda não configurada"
                  accentClassName="border-[#E7DDD2] bg-[linear-gradient(180deg,rgba(247,241,234,0.98),rgba(252,248,243,0.98))]"
                  iconClassName="border-[#DFCFC0] bg-[#F0E3D7] text-[#8B6B4D]"
                  valueClassName="text-[1.45rem] md:text-[1.7rem] leading-tight max-w-[10ch]"
                />
              </div>

              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
                <article className="overflow-hidden rounded-[26px] border border-[#E6DFD6] bg-white/90 shadow-[0_24px_70px_rgba(95,87,81,0.07)] backdrop-blur-sm">
                  <div className="flex flex-col gap-3 border-b border-[#EEE8DF] px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6">
                    <div>
                      <h2 className="text-[1.35rem] md:text-[1.75rem] leading-none text-[#1C1C1A]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        Produtos mais recentes
                      </h2>
                      <p className="mt-2 text-[13px] text-[#7A716A]">
                        {filteredProducts.length === 0 ? `Nenhum produto criado nos ${formatRelativePeriod(periodDays)}.` : `${filteredProducts.length} produto${filteredProducts.length === 1 ? "" : "s"} criado${filteredProducts.length === 1 ? "" : "s"} nos ${formatRelativePeriod(periodDays)}.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/produtos")}
                      className="inline-flex items-center gap-2 self-start rounded-full border border-[#DED5C9] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#4A453F] transition-colors hover:border-[#B9ADA0] hover:text-[#1C1C1A]"
                    >
                      Ver todos os produtos
                      <DashboardIcon type="arrow" />
                    </button>
                  </div>

                  <div className="px-5 py-4 md:px-6">
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="h-20 animate-pulse rounded-[18px] bg-[#F3EEE7]" />
                        ))}
                      </div>
                    ) : recentProducts.length === 0 ? (
                      <div className="rounded-[18px] border border-dashed border-[#DDD3C7] bg-[#FCFAF7] px-5 py-10 text-center text-[13px] text-[#7A716A]">
                        Nenhum produto foi criado nos {formatRelativePeriod(periodDays)}.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {recentProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => navigate(`/admin/produtos/${product.id}`)}
                            className="grid w-full grid-cols-[44px_minmax(0,1fr)_auto] md:grid-cols-[72px_minmax(0,1.35fr)_minmax(110px,0.8fr)_minmax(90px,0.6fr)_minmax(100px,0.7fr)] items-start md:items-center gap-3 rounded-[18px] border border-transparent bg-[#FCFAF7] px-3 py-3 text-left transition-all hover:border-[#E2D9CE] hover:bg-white"
                          >
                            <div className="h-[44px] w-[44px] md:h-[58px] md:w-[58px] overflow-hidden rounded-[12px] md:rounded-[14px] border border-[#E3DBD0] bg-[#EEE7DD]">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#A79C90]">
                                  <DashboardIcon type="products" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="line-clamp-2 md:truncate text-[14px] md:text-[15px] font-semibold text-[#1F1C18] leading-snug">{product.name}</p>
                              <p className="mt-1 truncate text-[11px] md:text-[12px] text-[#8A8179]">{product.category}</p>
                            </div>
                            <p className="hidden md:block truncate text-[12px] text-[#6E655D]">{product.category}</p>
                            <div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${product.active ? "bg-[#ECF2E7] text-[#355029]" : "bg-[#F1E8E8] text-[#8A3A3A]"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${product.active ? "bg-[#355029]" : "bg-[#8A3A3A]"}`} />
                                {product.active ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                            <p className="hidden md:block text-right text-[12px] text-[#7A716A]">{formatDate(product.created_at)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#EEE8DF] px-5 py-4 md:px-6">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/produtos")}
                      className="flex w-full items-center justify-between rounded-[16px] border border-[#E5DCD0] bg-white px-4 py-3 text-[13px] font-medium text-[#2E2B27] transition-colors hover:border-[#CEC2B4]"
                    >
                      <span>Ver todos os produtos</span>
                      <DashboardIcon type="arrow" />
                    </button>
                  </div>
                </article>

                <article className="overflow-hidden rounded-[26px] border border-[#E6DFD6] bg-white/90 shadow-[0_24px_70px_rgba(95,87,81,0.07)] backdrop-blur-sm">
                  <div className="flex flex-col gap-3 border-b border-[#EEE8DF] px-5 py-5 md:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-[1.35rem] md:text-[1.75rem] leading-none text-[#1C1C1A]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                          Categorias
                        </h2>
                        <p className="mt-2 text-[13px] text-[#7A716A]">
                          Distribuicao atual do catalogo por categoria.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/categorias")}
                        className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#4F6436] transition-colors hover:text-[#2A3D20]"
                      >
                        Gerenciar categorias
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 md:px-6">
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="h-16 animate-pulse rounded-[18px] bg-[#F3EEE7]" />
                        ))}
                      </div>
                    ) : categorySummaries.length === 0 ? (
                      <div className="rounded-[18px] border border-dashed border-[#DDD3C7] bg-[#FCFAF7] px-5 py-10 text-center text-[13px] text-[#7A716A]">
                        Nenhuma categoria encontrada.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {categorySummaries.map(({ category, productCount }) => (
                          <div
                            key={category.id}
                            className="flex items-center gap-3 rounded-[18px] bg-[#FCFAF7] px-3 py-3"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7DED1] bg-[#F6F1E7] text-[#AA9258]">
                              <DashboardIcon type="categories" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-semibold text-[#1F1C18]">{category.name}</p>
                              <p className="mt-1 text-[12px] text-[#8A8179]">
                                {productCount} produto{productCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${category.active ? "bg-[#ECF2E7] text-[#355029]" : "bg-[#EFE9E0] text-[#8B7760]"}`}>
                              {category.active ? "Ativa" : "Inativa"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#EEE8DF] px-5 py-4 md:px-6">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/categorias")}
                      className="flex w-full items-center justify-between rounded-[16px] border border-[#E5DCD0] bg-white px-4 py-3 text-[13px] font-medium text-[#2E2B27] transition-colors hover:border-[#CEC2B4]"
                    >
                      <span>Gerenciar categorias</span>
                      <DashboardIcon type="arrow" />
                    </button>
                  </div>
                </article>
              </section>

              <section className="rounded-[26px] border border-[#E6DFD6] bg-white/90 px-4 py-4 shadow-[0_24px_70px_rgba(95,87,81,0.07)] md:px-6 md:py-5">
                <div className="mb-3 md:mb-4">
                  <h2 className="text-[1.35rem] md:text-[1.7rem] leading-none text-[#1C1C1A]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    Atalhos rapidos
                  </h2>
                  <p className="mt-2 text-[13px] text-[#7A716A]">
                    Acesso direto aos fluxos mais usados da operacao.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {[
                    {
                      label: "Novo produto",
                      description: "Cadastrar um novo produto",
                      icon: "plus" as const,
                      onClick: () => navigate("/admin/produtos/novo"),
                    },
                    {
                      label: "Gerenciar produtos",
                      description: "Ver e editar produtos",
                      icon: "products" as const,
                      onClick: () => navigate("/admin/produtos"),
                    },
                    {
                      label: "Nova categoria",
                      description: "Criar uma nova categoria",
                      icon: "plus" as const,
                      onClick: () => navigate("/admin/categorias"),
                    },
                    {
                      label: "Gerenciar categorias",
                      description: "Ver e editar categorias",
                      icon: "categories" as const,
                      onClick: () => navigate("/admin/categorias"),
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className="group flex items-start gap-3 rounded-[18px] border border-[#E6DDD1] bg-[#FCFAF7] px-4 py-4 text-left text-[#26231F] transition-all hover:-translate-y-0.5 hover:border-[#D2C7B8] hover:bg-white"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6DDD1] bg-[#F6F0E6] text-[#2A3D20]">
                        <DashboardIcon type={action.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold">{action.label}</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-inherit opacity-75">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      }
    />
  );
}
