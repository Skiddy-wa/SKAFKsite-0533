import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// Criamos uma resposta mockada idêntica à que o Runable esperava receber da API externa
const mockData = {
  deals: {
    list: async () => [
      { id: "1", title: "Counter-Strike 2", price: "Gratuito", savings: "100%", thumb: "https://steamstatic.com" },
      { id: "2", title: "Cyberpunk 2077", price: "R$ 99,90", savings: "50%", thumb: "https://steamstatic.com" },
      { id: "3", title: "GTA V", price: "R$ 39,90", savings: "67%", thumb: "https://steamstatic.com" },
      { id: "4", title: "The Witcher 3: Wild Hunt", price: "R$ 25,99", savings: "80%", thumb: "https://steamstatic.com" },
      { id: "5", title: "Elden Ring", price: "R$ 139,30", savings: "30%", thumb: "https://steamstatic.com" },
      { id: "6", title: "Resident Evil 4", price: "R$ 84,50", savings: "50%", thumb: "https://steamstatic.com" }
    ],
    featured: async () => [
      { id: "2", title: "Cyberpunk 2077", price: "R$ 99,90", savings: "50%", thumb: "https://steamstatic.com" }
    ]
  },
  games: {
    search: async () => [],
    detail: async () => ({ id: "1", title: "Counter-Strike 2", price: "Gratuito" })
  },
  stores: async () => []
};

// Fazemos o cliente do site apontar para os dados fixos ao invés de buscar na rede
export const client = mockData as any;

// Mantém as utilidades do TanStack Query funcionando para renderizar a interface
export const orpc = {
  deals: {
    list: {
      queryOptions: (input: any) => ({
        queryKey: ['deals.list', input],
        queryFn: () => mockData.deals.list()
      })
    },
    featured: {
      queryOptions: (input: any) => ({
        queryKey: ['deals.featured', input],
        queryFn: () => mockData.deals.featured()
      })
    }
  }
} as any;
