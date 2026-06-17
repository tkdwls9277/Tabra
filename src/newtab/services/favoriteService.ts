import type { Favorite } from "../types";

export class FavoriteService {
  // Favorite 저장 함수
  static saveFavorites(favorites: Favorite[]): void {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ favorites });
    }
  }

  // Favorite 추가
  static addFavorite(favorites: Favorite[], label: string, url: string, icon?: string): Favorite[] {
    const newFavorite: Favorite = {
      id: crypto.randomUUID(),
      label,
      url,
      icon: icon || undefined,
    };
    return [...favorites, newFavorite];
  }

  // Favorite 수정
  static updateFavorite(favorites: Favorite[], id: string, label: string, url: string, icon?: string): Favorite[] {
    return favorites.map((f) => (f.id === id ? { ...f, label, url, icon: icon || undefined } : f));
  }

  // Favorite 삭제
  static deleteFavorite(favorites: Favorite[], id: string): Favorite[] {
    return favorites.filter((f) => f.id !== id);
  }

  // Favorite 열기
  static openFavorite(favorite: Favorite): void {
    window.location.href = favorite.url;
  }
}
