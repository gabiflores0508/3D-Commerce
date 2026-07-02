import { api } from './api';
import type { ApiCart } from './types';

export const cartService = {
  get() {
    return api.get<{ cart: ApiCart }>('/api/cart');
  },
  addItem(productId: string, quantity = 1) {
    return api.post<{ cart: ApiCart }>('/api/cart/items', { productId, quantity });
  },
  updateItem(itemId: string, quantity: number) {
    return api.put<{ cart: ApiCart }>(`/api/cart/items/${itemId}`, { quantity });
  },
  removeItem(itemId: string) {
    return api.del<{ cart: ApiCart }>(`/api/cart/items/${itemId}`);
  },
  clear() {
    return api.del<{ cart: ApiCart }>('/api/cart');
  },
};
