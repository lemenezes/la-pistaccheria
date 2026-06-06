import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminShell from "../../components/admin/AdminShell";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { deleteMediaAsset, getMediaAssets, type MediaAsset } from "../../services/mediaService";

type MediaUiState = {
  isLoading: boolean;
  error: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFileName(asset: MediaAsset) {
  return asset.file_name?.trim() || "Arquivo sem nome";
}

function MediaThumbnail({ asset }: { asset: MediaAsset }) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[12px] border border-[#E5E0D8] bg-[#F7F3ED]">
      {asset.public_url && !hasImageError ? (
        <img
          src={asset.public_url}
          alt={formatFileName(asset)}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[linear-gradient(180deg,#F7F3ED,#ECE5DB)] text-[#8B8277]">
          <span className="text-[10px] uppercase tracking-[0.14em]">Imagem</span>
          <span className="text-[11px] font-medium">indisponível</span>
        </div>
      )}
    </div>
  );
}

export default function AdminMedia() {
  const { user, logout } = useAuth();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [ui, setUi] = useState<MediaUiState>({ isLoading: true, error: null });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadMediaAssets = useCallback(async () => {
    setUi({ isLoading: true, error: null });

    const { data, error } = await getMediaAssets();

    if (error) {
      const message = error.message || "Erro ao carregar a biblioteca de mídia.";
      setMediaAssets([]);
      setUi({ isLoading: false, error: message });
      toast.error(message);
      return;
    }

    setMediaAssets((data ?? []) as MediaAsset[]);
    setUi({ isLoading: false, error: null });
  }, []);

  useEffect(() => {
    void loadMediaAssets();
  }, [loadMediaAssets]);

  const handleCopyUrl = useCallback(async (asset: MediaAsset) => {
    try {
      if (!asset.public_url) {
        throw new Error("Este registro não possui public_url.");
      }

      await navigator.clipboard.writeText(asset.public_url);
      toast.success("URL copiada para a área de transferência.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao copiar URL.");
    }
  }, []);

  const handleDelete = useCallback(async (asset: MediaAsset) => {
    const shouldDelete = window.confirm(
      `Excluir "${formatFileName(asset)}"? Esta ação não pode ser desfeita.`
    );

    if (!shouldDelete) {
      return;
    }

    const { error } = await deleteMediaAsset(asset.id);

    if (error) {
      toast.error(error.message || "Erro ao excluir mídia.");
      return;
    }

    setMediaAssets((currentAssets) => currentAssets.filter((item) => item.id !== asset.id));
    toast.success("Mídia excluída com sucesso.");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao sair.");
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

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
            <div className="mx-auto flex w-full max-w-[1260px] flex-col gap-6">
              <div className="lg:hidden overflow-hidden rounded-[16px] border border-[#E6DFD6] bg-white shadow-[0_2px_12px_rgba(95,87,81,0.06)]">
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[#EEE8DF]">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen((value) => !value)}
                    className="flex flex-col gap-[5px] p-1.5 text-[#5F5751] hover:text-[#1C1C1A] shrink-0"
                    aria-label="Abrir menu"
                  >
                    <span className="block w-5 h-[2px] bg-current rounded" />
                    <span className="block w-5 h-[2px] bg-current rounded" />
                    <span className="block w-5 h-[2px] bg-current rounded" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-[1.3rem] font-semibold text-[#1C1C1A] leading-tight">
                      Biblioteca de Mídia
                    </h1>
                    <p className="text-[12px] text-[#9A9189] mt-0.5">
                      {ui.isLoading
                        ? "Carregando..."
                        : `${mediaAssets.length} registro${mediaAssets.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                {ui.error ? (
                  <div className="px-4 py-2.5 bg-[#FBF2F2] border-b border-[#E0C8C8] text-[12px] text-[#8A3A3A]">
                    {ui.error}
                  </div>
                ) : null}
              </div>

              <section className="hidden lg:block rounded-[28px] border border-[#E5DED4] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,243,235,0.94))] px-5 py-6 shadow-[0_30px_90px_rgba(42,61,32,0.08)] md:px-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#9A9189]">CMS</p>
                    <h1
                      className="text-[2.4rem] leading-[0.94] text-[#1C1C1A] md:text-[3rem]"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      Biblioteca de Mídia
                    </h1>
                    <p className="mt-3 max-w-[600px] text-[14px] leading-relaxed text-[#6F665E] md:text-[15px]">
                      Registros manuais de mídia com URL pública para o catálogo.
                    </p>
                    <p className="mt-3 text-[13px] text-[#9A9189]">
                      {ui.isLoading
                        ? "Carregando..."
                        : `${mediaAssets.length} registro${mediaAssets.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                {ui.error ? (
                  <div className="mt-5 rounded-[12px] border border-[#E0C8C8] bg-[#FBF2F2] px-4 py-3 text-[13px] text-[#8A3A3A]">
                    {ui.error}
                  </div>
                ) : null}
              </section>

              <section className="overflow-hidden rounded-[26px] border border-[#E6DFD6] bg-white/90 shadow-[0_24px_70px_rgba(95,87,81,0.07)] backdrop-blur-sm">
                <div className="border-b border-[#EEE8DF] px-5 py-3 md:px-6 md:py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2
                        className="text-[1.7rem] leading-none text-[#1C1C1A]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      >
                        Registros de mídia
                      </h2>
                      <p className="mt-2 text-[13px] text-[#7A716A]">
                        {ui.isLoading
                          ? "Carregando registros..."
                          : `${mediaAssets.length} item${mediaAssets.length !== 1 ? "s" : ""} encontrado${mediaAssets.length !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#EEE8DF]">
                  {ui.isLoading ? (
                    <div className="px-5 py-10 md:px-6">
                      <div className="flex items-center gap-3 text-[#7A716A]">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D6CEC2] border-t-[#2A3D20]" />
                        <span className="text-[14px]">Carregando mídia...</span>
                      </div>
                    </div>
                  ) : mediaAssets.length === 0 ? (
                    <div className="px-5 py-12 md:px-6">
                      <div className="rounded-[18px] border border-dashed border-[#DCCFBD] bg-[#FBF9F6] px-5 py-10 text-center">
                        <p className="text-[16px] text-[#1C1C1A]">Nenhum registro encontrado.</p>
                        <p className="mt-2 text-[13px] text-[#7A716A]">
                          Cadastre registros na tabela <span className="font-medium">media_assets</span> para visualizar a biblioteca.
                        </p>
                      </div>
                    </div>
                  ) : (
                    mediaAssets.map((asset) => (
                      <article
                        key={asset.id}
                        className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:gap-5 md:px-6"
                      >
                        <MediaThumbnail asset={asset} />

                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-medium text-[#1C1C1A] truncate">
                            {formatFileName(asset)}
                          </p>
                          <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-[#9A9189]">
                            {asset.bucket_area?.trim() || "bucket_area não informado"}
                          </p>
                          <p className="mt-1 break-all text-[12px] leading-relaxed text-[#7A716A]">
                            {asset.public_url}
                          </p>
                          <p className="mt-1 text-[12px] text-[#9A9189]">
                            Criado em {formatDate(asset.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <button
                            type="button"
                            onClick={() => void handleCopyUrl(asset)}
                            className="inline-flex h-10 items-center justify-center rounded-full border border-[#D7D0C4] bg-white px-4 text-[12px] font-medium text-[#2A3D20] transition-colors hover:bg-[#F5F1EA]"
                          >
                            Copiar URL
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(asset)}
                            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E0C8C8] bg-[#FBF2F2] px-4 text-[12px] font-medium text-[#8A3A3A] transition-colors hover:bg-[#F8E7E7]"
                          >
                            Excluir
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      }
    />
  );
}