import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterInView, setIsFooterInView] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 500);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>('footer[role="contentinfo"]');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterInView(entry.isIntersecting);
      },
      {
        threshold: 0.08
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: 1,
            y: 0,
            bottom: isFooterInView ? "5.75rem" : "1rem"
          }}
          whileHover={{ y: -2 }}
          exit={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleClick}
          aria-label="Voltar ao topo"
          className="fixed right-4 z-[126] flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/10 bg-[#3f5d2c] text-cream shadow-[0_10px_24px_rgba(28,28,26,0.18)] backdrop-blur-sm transition-colors duration-200 hover:bg-[#4a6d35]"
          style={{ bottom: "1rem" }}
        >
          <ChevronUp size={18} strokeWidth={2} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
