import { useEffect, useState } from "react";
import { StorageService } from "../services/storageService";
import type { StorageData } from "../types/index";

/**
 * Chrome Storage 데이터를 로드하는 커스텀 훅
 */
export function useStorage() {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await StorageService.loadFromStorage();
      setData(result);
      setLoading(false);
    };

    loadData();
  }, []);

  return { data, loading };
}
