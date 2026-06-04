import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/admin/produtos";

  if (user) {
    return <Navigate to="/admin/produtos" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md border border-cream-deep bg-cream/95 p-7 md:p-9 shadow-[0_16px_45px_rgba(28,28,26,0.08)]">
        <p className="text-[9px] tracking-[0.28em] uppercase text-gold font-normal mb-3">
          Admin
        </p>
        <h1
          className="text-[2rem] font-light text-charcoal leading-[1.05] mb-7"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Entrar no CMS
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] tracking-[0.16em] uppercase text-warm-gray mb-2"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full h-11 px-3 border border-cream-deep bg-cream text-charcoal outline-none focus:border-pistachio"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] tracking-[0.16em] uppercase text-warm-gray mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full h-11 px-3 border border-cream-deep bg-cream text-charcoal outline-none focus:border-pistachio"
            />
          </div>

          {error && (
            <p className="text-[12px] text-[#8A3A3A] font-light leading-relaxed">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-pistachio text-cream text-[10px] tracking-[0.16em] uppercase hover:bg-pistachio-mid transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link
          to="/"
          className="inline-block mt-6 text-[10px] tracking-[0.16em] uppercase text-warm-gray border-b border-warm-gray/45 hover:text-charcoal hover:border-charcoal/50"
        >
          Voltar para o site
        </Link>
      </div>
    </div>
  );
}
