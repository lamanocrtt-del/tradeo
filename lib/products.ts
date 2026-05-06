export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  gems?: number
  type: "premium" | "gems" | "hearts" | "streak-freeze"
}

export const PRODUCTS: Product[] = [
  {
    id: "premium-monthly",
    name: "Tradeo Premium - Mensuel",
    description: "Accès illimité, cœurs infinis",
    priceInCents: 999, // 9.99€
    type: "premium",
  },
  {
    id: "premium-annual",
    name: "Tradeo Premium - Annuel",
    description: "Accès illimité, cœurs infinis (économisez 40%)",
    priceInCents: 7199, // 71.99€
    type: "premium",
  },
  {
    id: "premium-family",
    name: "Tradeo Premium - Famille",
    description: "Coeurs illimites, lecons avancees + partage avec 3 proches",
    priceInCents: 1499, // 14.99€/mois
    type: "premium",
  },
  {
    id: "premium-lifetime",
    name: "Tradeo Premium - A Vie",
    description: "Acces a vie, mises a jour gratuites, coaching VIP exclusif",
    priceInCents: 19900, // 199€
    type: "premium",
  },
  {
    id: "gems-100",
    name: "100 Gemmes",
    description: "Achetez des gemmes pour débloquer des bonus",
    priceInCents: 199, // 1.99€
    gems: 100,
    type: "gems",
  },
  {
    id: "gems-500",
    name: "500 Gemmes",
    description: "Meilleure valeur ! Plus de gemmes pour moins cher",
    priceInCents: 799, // 7.99€
    gems: 500,
    type: "gems",
  },
  {
    id: "gems-1200",
    name: "1200 Gemmes",
    description: "Pack populaire de gemmes",
    priceInCents: 1499, // 14.99€
    gems: 1200,
    type: "gems",
  },
  {
    id: "gems-3000",
    name: "3000 Gemmes",
    description: "Meilleure offre ! Maximum de gemmes",
    priceInCents: 2999, // 29.99€
    gems: 3000,
    type: "gems",
  },
  {
    id: "heart-refill",
    name: "Recharge de cœurs",
    description: "Rechargez instantanément vos 5 cœurs",
    priceInCents: 99, // 0.99€
    type: "hearts",
  },
  {
    id: "streak-freeze",
    name: "Gel de série",
    description: "Protégez votre série pendant 1 jour",
    priceInCents: 199, // 1.99€
    type: "streak-freeze",
  },
]
