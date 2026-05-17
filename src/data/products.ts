export interface Product {
  id: string
  name: string
  category: string
  description: string
  price: string
  badge?: 'Novo' | 'Destaque' | 'Edição Limitada'
  featured?: boolean
}

export const products: Product[] = [
  {
    id: 'pasta-pistacchio',
    name: 'Pasta di Pistacchio',
    category: 'Pasta Artesanal',
    description:
      'Pasta pura de pistache siciliano, sem aditivos. Feita com pistaches de Bronte DOP, de sabor intenso e textura aveludada. Perfeita para rechear, cobrir ou saborear pura.',
    price: 'R$ 89',
    badge: 'Destaque',
    featured: true,
  },
  {
    id: 'cremino',
    name: 'Cremino al Pistacchio',
    category: 'Bomboneria',
    description:
      'Bombom de camadas com ganache de pistache e chocolate branco belga. Acabamento em folha de ouro comestível. Embalagem para presente inclusa.',
    price: 'R$ 128',
    badge: 'Edição Limitada',
    featured: true,
  },
  {
    id: 'torta-pistacchio',
    name: 'Torta Pistacchio e Limone',
    category: 'Confeitaria',
    description:
      'Torta de massa amanteigada com creme de pistache e limão siciliano. Crosta delicada, recheio cremoso e finalização de pistaches inteiros torrados.',
    price: 'R$ 215',
    featured: true,
  },
  {
    id: 'cannolo',
    name: 'Cannolo al Pistacchio',
    category: 'Doces Sicilianos',
    description:
      'Cannoli siciliani com creme de ricota e pistache de Bronte, casquinha crocante frita artesanalmente. Servidos em caixa de 6 unidades.',
    price: 'R$ 98',
    badge: 'Novo',
  },
  {
    id: 'tartufo',
    name: 'Tartufo di Pistacchio',
    category: 'Bomboneria',
    description:
      'Trufa artesanal de pistache com cobertura de chocolate amargo 70%. Interior cremoso e intenso, finalizada com granella di pistacchio.',
    price: 'R$ 68',
  },
  {
    id: 'granella',
    name: 'Granella Croccante',
    category: 'Ingredientes',
    description:
      'Pistache de Bronte torrado e granulado, finalizado com flor de sal siciliana. Ideal para finalizar sobremesas, sorvetes e saladas.',
    price: 'R$ 52',
  },
]
