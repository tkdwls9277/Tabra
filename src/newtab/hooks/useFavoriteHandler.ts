import { useState } from "react";
import { FavoriteService } from "../services/favoriteService";
import type { Favorite } from "../types/index";

interface UseFavoriteHandlerProps {
  favorites: Favorite[];
  setFavorites: (favorites: Favorite[]) => void;
}

/**
 * Favorite 관련 로직을 관리하는 커스텀 훅
 */
export function useFavoriteHandler(props: UseFavoriteHandlerProps) {
  const { favorites, setFavorites } = props;

  const [isFavModalOpen, setIsFavModalOpen] = useState(false);
  const [favLabel, setFavLabel] = useState("");
  const [favUrl, setFavUrl] = useState("");
  const [favIcon, setFavIcon] = useState("");
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);

  const handleSaveFavorites = (next: Favorite[]) => {
    setFavorites(next);
    FavoriteService.saveFavorites(next);
  };

  const openAddModal = () => {
    setEditingFavoriteId(null);
    setFavLabel("");
    setFavUrl("");
    setFavIcon("");
    setIsFavModalOpen(true);
  };

  const openEditModal = (fav: Favorite) => {
    setEditingFavoriteId(fav.id);
    setFavLabel(fav.label);
    setFavUrl(fav.url);
    setFavIcon(fav.icon || "");
    setIsFavModalOpen(true);
  };

  const closeModal = () => {
    setIsFavModalOpen(false);
    setEditingFavoriteId(null);
    setFavLabel("");
    setFavUrl("");
    setFavIcon("");
  };

  const handleSubmitFavorite = () => {
    if (!favLabel.trim() || !favUrl.trim()) {
      alert("제목과 URL을 모두 입력해주세요.");
      return;
    }

    if (editingFavoriteId) {
      const next = FavoriteService.updateFavorite(favorites, editingFavoriteId, favLabel, favUrl, favIcon);
      handleSaveFavorites(next);
    } else {
      const next = FavoriteService.addFavorite(favorites, favLabel, favUrl, favIcon);
      handleSaveFavorites(next);
    }
    closeModal();
  };

  const handleDeleteFavorite = (id: string) => {
    const next = FavoriteService.deleteFavorite(favorites, id);
    handleSaveFavorites(next);
  };

  const handleOpenFavorite = (fav: Favorite) => {
    window.location.href = fav.url;
  };

  const handleReorderFavorites = (reorderedFavorites: Favorite[]) => {
    handleSaveFavorites(reorderedFavorites);
  };

  return {
    // Modal state
    isFavModalOpen,
    favLabel,
    setFavLabel,
    favUrl,
    setFavUrl,
    favIcon,
    setFavIcon,

    // Handlers
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitFavorite,
    handleDeleteFavorite,
    handleOpenFavorite,
    handleReorderFavorites,
  };
}
