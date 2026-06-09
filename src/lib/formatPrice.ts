/**
 * Formata um valor numérico como moeda BRL.
 * Ex: 128 → "R$ 128" | 128.5 → "R$ 129"
 *
 * No futuro: aceitar locale/currency como parâmetros para internacionalização.
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
