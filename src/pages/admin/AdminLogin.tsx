import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function PistachioMark() {
  return (
    <svg width="42" height="50" viewBox="0 0 42 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21 2C13.5 2 7 11.5 7 25C7 38.5 13.5 48 21 48C28.5 48 35 38.5 35 25C35 11.5 28.5 2 21 2Z"
        stroke="#3A4D2C"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M21 9C21 9 18 17 18 25C18 33 21 41 21 41"
        stroke="#3A4D2C"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M10 19C14 15 18 13.5 21 13.5C24 13.5 28 15 32 19"
        stroke="#3A4D2C"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[17px] w-[17px] shrink-0 text-[#B9B0A5]">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[17px] w-[17px] shrink-0 text-[#B9B0A5]">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[17px] w-[17px]">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[17px] w-[17px]">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/admin";

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error && err.message
        ? "E-mail ou senha incorretos."
        : "Não foi possível realizar o acesso. Tente novamente.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "flex items-center gap-3 h-[50px] px-4 border border-[#E8E2D6] rounded-[10px] bg-[#FDFCFA] transition-colors focus-within:border-[#3A4D2C]";

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5 py-12">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8 select-none">
        <div className="scale-[1.18] origin-center">
          <PistachioMark />
        </div>
        <p
          className="mt-5 text-[14px] tracking-[0.3em] uppercase text-charcoal font-medium"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          La Pistaccheria
        </p>
        <div className="w-9 h-px bg-charcoal/20 mt-3" />
      </div>

      {/* Card */}
      <div className="w-full max-w-[468px] bg-white rounded-[20px] shadow-[0_4px_6px_rgba(28,28,26,0.04),0_12px_40px_rgba(28,28,26,0.09)] px-10 py-11">
        <p className="text-[10px] tracking-[0.22em] uppercase text-gold font-semibold mb-4">
          Área Administrativa
        </p>
        <h1
          className="text-[2.15rem] font-light text-charcoal leading-[1.1] mb-2.5"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Entrar
        </h1>
        <p className="text-[14px] text-warm-gray leading-relaxed mb-8">
          Gerencie produtos, categorias e conteúdos da La Pistaccheria.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-[10px] tracking-[0.16em] uppercase text-warm-gray mb-2">
              E-mail
            </label>
            <div className={inputClass}>
              <IconMail />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="flex-1 bg-transparent text-[14px] text-charcoal placeholder-[#C8C0B5] outline-none"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-[10px] tracking-[0.16em] uppercase text-warm-gray mb-2">
              Senha
            </label>
            <div className={inputClass}>
              <IconLock />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="flex-1 bg-transparent text-[14px] text-charcoal placeholder-[#C8C0B5] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#B9B0A5] hover:text-warm-gray transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <IconEye open={showPassword} />
              </button>
            </div>
          </div>

          {/* Lembrar-me */}
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-[16px] w-[16px] rounded-[4px] border-[#C8C0B5] cursor-pointer accent-[#3A4D2C]"
            />
            <span className="text-[14px] text-warm-gray">Lembrar-me</span>
          </label>

          {/* Erro */}
          {error && (
            <p className="text-[12px] text-[#8A3A3A] leading-relaxed bg-[#FBF2F2] border border-[#E8CACA] rounded-[8px] px-4 py-3">
              {error}
            </p>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[52px] bg-[#2A3D20] hover:bg-[#223218] text-white text-[11px] tracking-[0.18em] uppercase font-medium rounded-[10px] flex items-center justify-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Rodapé */}
        <div className="mt-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#EDE7DD]" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-[15px] w-[15px] text-[#CCC5BB] shrink-0">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <div className="flex-1 h-px bg-[#EDE7DD]" />
        </div>
        <p className="mt-3 text-center text-[12px] text-[#BDB5AB]">
          Acesso restrito à equipe autorizada.
        </p>
      </div>
    </div>
  );
}
