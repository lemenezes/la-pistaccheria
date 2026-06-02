export interface Product {
  id: string
  slug: string
  name: string
  category: string
  shortDescription: string   // para cards da loja
  description: string        // para página de produto
  price: number              // valor numérico em BRL — formatar com formatPrice()
  weight?: string            // ex: "200g", "Caixa com 6 unidades"
  badge?: 'Novo' | 'Destaque' | 'Edição Limitada'
  featured?: boolean
  image?: string
}

export const products: Product[] = [
  {
    id: 'pasta-pistacchio',
    slug: 'pasta-di-pistacchio',
    name: 'Pasta di Pistacchio',
    category: 'Pasta Artesanal',
    shortDescription: 'Pasta pura de pistache de Bronte DOP, aveludada e sem aditivos.',
    description:
      'Pasta pura de pistache siciliano, sem aditivos. Feita com pistaches de Bronte DOP, de sabor intenso e textura aveludada. Perfeita para rechear, cobrir ou saborear pura.',
    price: 89,
    weight: '200g',
    badge: 'Destaque',
    featured: true,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&h=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'cremino',
    slug: 'cremino-al-pistacchio',
    name: 'Cremino al Pistacchio',
    category: 'Bomboneria',
    shortDescription: 'Bombom de camadas com ganache de pistache e chocolate branco belga.',
    description:
      'Bombom de camadas com ganache de pistache e chocolate branco belga. Acabamento em folha de ouro comestível. Embalagem para presente inclusa.',
    price: 128,
    weight: 'Caixa com 4 unidades',
    badge: 'Edição Limitada',
    featured: true,
    image: 'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=900&h=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'torta-pistacchio',
    slug: 'torta-pistacchio-e-limone',
    name: 'Torta Pistacchio e Limone',
    category: 'Confeitaria',
    shortDescription: 'Torta de massa amanteigada com creme de pistache e limão siciliano.',
    description:
      'Torta de massa amanteigada com creme de pistache e limão siciliano. Crosta delicada, recheio cremoso e finalização de pistaches inteiros torrados.',
    price: 215,
    weight: '22cm de diâmetro',
    featured: true,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&h=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'cannolo',
    slug: 'cannolo-al-pistacchio',
    name: 'Cannolo al Pistacchio',
    category: 'Doces Sicilianos',
    shortDescription: 'Cannoli siciliani com creme de ricota e pistache, casquinha crocante.',
    description:
      'Cannoli siciliani com creme de ricota e pistache de Bronte, casquinha crocante frita artesanalmente. Servidos em caixa de 6 unidades.',
    price: 98,
    weight: 'Caixa com 6 unidades',
    badge: 'Novo',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&h=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'tartufo',
    slug: 'tartufo-di-pistacchio',
    name: 'Tartufo di Pistacchio',
    category: 'Bomboneria',
    shortDescription: 'Trufa artesanal com cobertura de chocolate 70% e interior cremoso.',
    description:
      'Trufa artesanal de pistache com cobertura de chocolate amargo 70%. Interior cremoso e intenso, finalizada com granella di pistacchio.',
    price: 68,
    weight: 'Caixa com 6 unidades',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&h=900&q=85&auto=format&fit=crop',
  },
  {
    id: 'granella',
    slug: 'granella-croccante',
    name: 'Granella Croccante',
    category: 'Ingredientes',
    shortDescription: 'Pistache de Bronte torrado e granulado com flor de sal siciliana.',
    description:
      'Pistache de Bronte torrado e granulado, finalizado com flor de sal siciliana. Ideal para finalizar sobremesas, sorvetes e saladas.',
    price: 52,
    weight: '150g',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=900&h=900&q=85&auto=format&fit=crop',
  },
]
