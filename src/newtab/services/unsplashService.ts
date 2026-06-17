/**
 * Unsplash 이미지 서비스
 * URL 직접 접근으로 API 제한 없이 고화질 자연 사진 제공
 * 최근 3개를 제외한 랜덤 선택으로 다양성 보장
 */

export class UnsplashService {
  // 모든 고화질 자연 사진 목록
  private static readonly PHOTOS = [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80", // 별이 빛나는 밤하늘
    "https://images.unsplash.com/photo-1465188162913-8fb5709d6d57?w=1920&q=80", // 고요한 호수
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80", // 설산
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80", // 눈 덮인 산
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80", // 새벽 안개
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80", // 일출
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80", // 아침 산악
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80", // 숲속 길
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80", // 푸른 자연
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80", // 밝은 숲
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80", // 화창한 들판
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80", // 꽃밭
    "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1920&q=80", // 맑은 호수
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80", // 푸른 바다
    "https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1920&q=80", // 해변
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80", // 호수와 산
    "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=1920&q=80", // 석양
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=80", // 황금빛 들판
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80", // 저녁 노을
    "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1920&q=80", // 밤 하늘
    "https://images.unsplash.com/photo-1484910292437-025e5d13ce87?w=1920&q=80", // 밤 산
    "https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1920&q=80", // 밤 별
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80", // 푸른 하늘과 산
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", // 열대 해변
  ];

  /**
   * 최근 3개를 제외한 랜덤 사진 가져오기
   */
  static async getRandomNaturePhoto(): Promise<string> {
    const recentPhotos = this.getRecentPhotos();
    const availablePhotos = this.PHOTOS.filter((photo) => !recentPhotos.includes(photo));

    // 사용 가능한 사진이 없으면 (거의 불가능하지만) 전체에서 선택
    if (availablePhotos.length === 0) {
      const randomIndex = Math.floor(Math.random() * this.PHOTOS.length);
      return this.PHOTOS[randomIndex];
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * availablePhotos.length);
    const selectedPhoto = availablePhotos[randomIndex];

    // 최근 사진 목록에 추가
    this.addToRecentPhotos(selectedPhoto);

    return selectedPhoto;
  }

  /**
   * 최근 사용한 3개 사진 가져오기
   */
  private static getRecentPhotos(): string[] {
    try {
      const recent = localStorage.getItem("recent_photos");
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }

  /**
   * 최근 사진 목록에 추가 (최대 3개 유지)
   */
  private static addToRecentPhotos(photo: string): void {
    try {
      const recent = this.getRecentPhotos();
      // 새 사진을 맨 앞에 추가
      recent.unshift(photo);
      // 최대 3개까지만 유지
      const updated = recent.slice(0, 3);
      localStorage.setItem("recent_photos", JSON.stringify(updated));
    } catch (error) {
      console.error("최근 사진 저장 실패:", error);
    }
  }

  /**
   * 캐시된 이미지 확인 (1시간 동안 같은 이미지 유지)
   */
  static getCachedPhotoUrl(): string | null {
    const cached = localStorage.getItem("unsplash_photo_cache");
    if (!cached) return null;

    try {
      const { url, timestamp } = JSON.parse(cached);
      const oneHour = 60 * 60 * 1000;

      // 1시간이 지나지 않았으면 캐시된 이미지 사용
      if (Date.now() - timestamp < oneHour) {
        return url;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 이미지 URL을 타임스탬프와 함께 캐시
   */
  static cachePhotoUrl(url: string): void {
    const cache = {
      url,
      timestamp: Date.now(),
    };
    localStorage.setItem("unsplash_photo_cache", JSON.stringify(cache));
  }
}
