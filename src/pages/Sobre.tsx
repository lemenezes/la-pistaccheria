import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import founderAnneImg from "../assets/images/founders/anne e fz_1.png";
import founderFzImg from "../assets/images/founders/anne e fz_2.png";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: {
    duration: 0.85,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
  }
};

export default function Sobre() {
  return (
    <section className="bg-cream min-h-screen pt-28 md:pt-36 pb-20 md:pb-28">
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <motion.div {...fadeUp} className="mb-12 md:mb-16">
          <p className="text-[10px] tracking-[0.34em] uppercase text-gold font-normal mb-4">
            Nossa História
          </p>
          <h1
            className="text-[2.5rem] md:text-[3.4rem] lg:text-[4rem] font-light text-charcoal leading-[1.06] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Nossa História
          </h1>
          <p
            className="text-[1.25rem] md:text-[1.55rem] font-light italic text-pistachio leading-[1.45]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Uma história construída a dois
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] gap-12 md:gap-16 lg:gap-20 items-start">
          <motion.div {...fadeUp} className="max-w-2xl lg:pt-8">
            <div className="space-y-5 text-[15px] md:text-[17px] font-light text-warm-gray leading-[1.9]">
              <p>
                Tudo começou com uma simples ideia compartilhada entre duas
                pessoas apaixonadas por criar momentos especiais.
              </p>
              <p>Somos Anne e Fabrizzio.</p>
              <p>
                A marca nasceu da vontade de transformar uma paixão pela
                confeitaria em algo que pudesse ser compartilhado com outras
                pessoas.
              </p>
              <p>
                Tudo começou de forma simples: receitas, testes, aprendizados e
                muitas conversas sobre como criar produtos que unissem qualidade,
                beleza e sabor.
              </p>
              <p>
                Hoje seguimos construindo esse sonho juntos, buscando inspiração
                na tradição italiana, no pistache siciliano e no cuidado
                artesanal presente em cada detalhe.
              </p>
            </div>

            <p
              className="mt-8 text-[1.35rem] md:text-[1.55rem] font-light italic text-pistachio leading-[1.4]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Obrigado por fazer parte dessa jornada.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[460px] sm:h-[540px] lg:h-[680px]">
            <figure className="absolute right-0 top-0 overflow-hidden bg-cream-deep w-[76%] h-[82%] lg:w-[74%] lg:h-[86%] shadow-[0_20px_50px_rgba(28,28,26,0.12)]">
              <img
                src={founderAnneImg}
                alt="Anne, cofundadora da La Pistaccheria"
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "sepia(0.04) saturate(0.9) brightness(1.02)" }}
              />
              <figcaption className="absolute left-4 bottom-4 text-[8px] tracking-[0.24em] uppercase text-cream/92 font-normal">
                Anne
              </figcaption>
            </figure>

            <figure className="absolute left-0 bottom-0 overflow-hidden bg-cream-deep w-[56%] h-[54%] lg:w-[48%] lg:h-[56%] ring-8 ring-cream shadow-[0_16px_42px_rgba(28,28,26,0.14)]">
              <img
                src={founderFzImg}
                alt="Fz, cofundador da La Pistaccheria"
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "sepia(0.04) saturate(0.9) brightness(1.02)" }}
              />
              <figcaption className="absolute left-4 bottom-4 text-[8px] tracking-[0.24em] uppercase text-cream/92 font-normal">
                Fz
              </figcaption>
            </figure>
          </motion.div>
        </div>

        <motion.div
          {...fadeUp}
          className="mt-18 md:mt-24 pt-14 md:pt-16 border-t border-charcoal/10">
          <p className="text-[9px] tracking-[0.32em] uppercase text-gold font-normal mb-4">
            Como tudo começou
          </p>
          <h2
            className="text-[2rem] md:text-[2.6rem] font-light text-charcoal leading-[1.12] mb-8"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Entre receitas, conversas e coragem para começar
          </h2>

          <figure className="relative overflow-hidden aspect-[16/9] md:aspect-[2.45/1] bg-cream-deep mb-8 md:mb-10">
            <img
              src={founderAnneImg}
              alt="Anne e Fz em momento de criação da La Pistaccheria"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: "center 28%",
                filter: "sepia(0.04) saturate(0.88) brightness(1.02)"
              }}
            />
          </figure>

          <p className="max-w-4xl text-[13px] md:text-[13.5px] font-light text-warm-gray leading-[1.95]">
            Entre receitas testadas em casa, conversas no fim do dia e muita
            vontade de construir algo próprio, nasceu o projeto que hoje se
            transforma em cada encomenda preparada com carinho.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="mt-16 md:mt-20 bg-pistachio-pale px-8 md:px-12 py-12 md:py-14 text-center">
          <p className="text-[9px] tracking-[0.3em] uppercase text-gold font-normal mb-4">
            Pronto para experimentar?
          </p>
          <h3
            className="text-[2rem] md:text-[2.5rem] font-light text-charcoal leading-[1.15] mb-8"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Conheça nossa coleção
          </h3>
          <Link
            to="/loja"
            className="inline-flex items-center justify-center px-9 py-4 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300">
            Ver produtos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
