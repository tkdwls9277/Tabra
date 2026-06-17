import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { FavoritesPanel } from "./components/FavoritesPanel";
import { ModalContainer } from "./components/ModalContainer";
import { NotificationPanel } from "./components/NotificationPanel";
import { TodoPanel } from "./components/TodoPanel";
import { WeatherPanel } from "./components/WeatherPanel";
import { WorkPanel } from "./components/WorkPanel";
import { GRADIENTS } from "./constants/index";
import { useAppState } from "./hooks/useAppState";
import { useComputedValues } from "./hooks/useComputedValues";
import { useFavoriteHandler } from "./hooks/useFavoriteHandler";
import { useFocusHandler } from "./hooks/useFocusHandler";
import { useOptionsModal } from "./hooks/useOptionsModal";
import { usePanelToggle } from "./hooks/usePanelToggle";
import { useStorage } from "./hooks/useStorage";
import { useStorageSync } from "./hooks/useStorageSync";
import { useTodoHandler } from "./hooks/useTodoHandler";
import { useTranslation } from "./hooks/useTranslation";
import { useWorkHandler } from "./hooks/useWorkHandler";
import { UnsplashService } from "./services/unsplashService";
import type { WeatherData } from "./types";
import { formatDate } from "./utils/date";
import { getGreeting, getTimeString } from "./utils/index";

export const App: React.FC = () => {
  const { t } = useTranslation();
  const todoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // ===== 날씨 데이터 상태 =====
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // ===== 상태 관리 =====
  const state = useAppState();

  // ===== Storage 로드 =====
  const { data: storageData } = useStorage();

  useEffect(() => {
    if (!storageData) return;

    if (storageData.userName) state.setUserName(storageData.userName);
    if (storageData.todayFocus) {
      state.setFocus(storageData.todayFocus);
      state.setFocusInputValue("");
    }
    if (Array.isArray(storageData.todos)) state.setTodos(storageData.todos);
    if (Array.isArray(storageData.favorites)) state.setFavorites(storageData.favorites);
    if (typeof storageData.favoritesOpen === "boolean") state.setFavoritesOpen(storageData.favoritesOpen);
    if (typeof storageData.todosOpen === "boolean") state.setTodosOpen(storageData.todosOpen);
    if (Array.isArray(storageData.workRecords)) state.setWorkRecords(storageData.workRecords);
    if (typeof storageData.workPanelOpen === "boolean") state.setWorkPanelOpen(storageData.workPanelOpen);
    if (typeof storageData.notificationPanelOpen === "boolean")
      state.setNotificationPanelOpen(storageData.notificationPanelOpen);
    if (typeof storageData.weatherPanelOpen === "boolean") state.setWeatherPanelOpen(storageData.weatherPanelOpen);
    if (typeof storageData.showFavoritesPanel === "boolean")
      state.setShowFavoritesPanel(storageData.showFavoritesPanel);
    if (typeof storageData.showTodosPanel === "boolean") state.setShowTodosPanel(storageData.showTodosPanel);
    if (typeof storageData.showWorkPanel === "boolean") state.setShowWorkPanel(storageData.showWorkPanel);
    if (typeof storageData.showNotificationPanel === "boolean")
      state.setShowNotificationPanel(storageData.showNotificationPanel);
    if (typeof storageData.showFocusSection === "boolean") state.setShowFocusSection(storageData.showFocusSection);
    if (typeof storageData.weatherApiKey === "string") state.setWeatherApiKey(storageData.weatherApiKey);
    if (typeof storageData.showWeeklyForecast === "boolean")
      state.setShowWeeklyForecast(storageData.showWeeklyForecast);
    if (typeof storageData.showHourlyForecast === "boolean")
      state.setShowHourlyForecast(storageData.showHourlyForecast);
    if (typeof storageData.weatherDraggable === "boolean") state.setWeatherDraggable(storageData.weatherDraggable);
    if (typeof storageData.showWeatherPanel === "boolean") state.setShowWeatherPanel(storageData.showWeatherPanel);
    if (storageData.weatherUnit === "C" || storageData.weatherUnit === "F") state.setWeatherUnit(storageData.weatherUnit);
  }, [storageData]);

  // ===== Storage 동기화 (다른 탭) =====
  useStorageSync({
    setUserName: state.setUserName,
    setFocus: state.setFocus,
    setFocusInputValue: state.setFocusInputValue,
    setTodos: state.setTodos,
    setFavorites: state.setFavorites,
    setWorkRecords: state.setWorkRecords,
    setFavoritesOpen: state.setFavoritesOpen,
    setTodosOpen: state.setTodosOpen,
    setWorkPanelOpen: state.setWorkPanelOpen,
    setNotificationPanelOpen: state.setNotificationPanelOpen,
    setWeatherPanelOpen: state.setWeatherPanelOpen,
    setShowFavoritesPanel: state.setShowFavoritesPanel,
    setShowTodosPanel: state.setShowTodosPanel,
    setShowWorkPanel: state.setShowWorkPanel,
    setShowNotificationPanel: state.setShowNotificationPanel,
    setShowFocusSection: state.setShowFocusSection,
    setCurrentDate: state.setCurrentDate,
    setWeatherApiKey: state.setWeatherApiKey,
    setShowWeeklyForecast: state.setShowWeeklyForecast,
    setShowHourlyForecast: state.setShowHourlyForecast,
    setWeatherDraggable: state.setWeatherDraggable,
    setShowWeatherPanel: state.setShowWeatherPanel,
    setWeatherUnit: state.setWeatherUnit,
  });

  // ===== 시간 & 인사 업데이트 =====
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      state.setTime(getTimeString());
      state.setGreeting(getGreeting(state.userName));
    };

    updateTimeAndGreeting();
    const timer = setInterval(updateTimeAndGreeting, 1000 * 30);
    return () => clearInterval(timer);
  }, [state.userName]);

  // ===== 날짜가 변경되면 시간과 인사말도 즉시 업데이트 =====
  useEffect(() => {
    if (state.currentDate) {
      state.setTime(getTimeString());
      state.setGreeting(getGreeting(state.userName));
    }
  }, [state.currentDate, state.userName]);

  // ===== 배경 이미지 로드 =====
  useEffect(() => {
    const loadBackground = async () => {
      const cached = UnsplashService.getCachedPhotoUrl();
      if (cached) {
        state.setBackgroundImage(cached);
        return;
      }

      const url = await UnsplashService.getRandomNaturePhoto();
      state.setBackgroundImage(url);
      UnsplashService.cachePhotoUrl(url);
    };

    loadBackground();
  }, []);

  const fallbackBackground = useMemo(() => {
    const idx = Math.floor(Math.random() * GRADIENTS.length);
    return GRADIENTS[idx];
  }, []);

  // ===== Handlers =====
  const focusHandler = useFocusHandler({
    focus: state.focus,
    setFocus: state.setFocus,
    focusInputValue: state.focusInputValue,
    setFocusInputValue: state.setFocusInputValue,
  });

  const todoHandler = useTodoHandler({
    todos: state.todos,
    setTodos: state.setTodos,
    newTodoText: state.newTodoText,
    setNewTodoText: state.setNewTodoText,
    selectedDate: state.selectedDate,
  });

  const favoriteHandler = useFavoriteHandler({
    favorites: state.favorites,
    setFavorites: state.setFavorites,
  });

  const workHandler = useWorkHandler({
    workRecords: state.workRecords,
    setWorkRecords: state.setWorkRecords,
  });

  const optionsModal = useOptionsModal({
    userName: state.userName,
    showFavoritesPanel: state.showFavoritesPanel,
    showTodosPanel: state.showTodosPanel,
    showWorkPanel: state.showWorkPanel,
    showNotificationPanel: state.showNotificationPanel,
    showFocusSection: state.showFocusSection,
    weatherApiKey: state.weatherApiKey,
    showWeeklyForecast: state.showWeeklyForecast,
    showHourlyForecast: state.showHourlyForecast,
    weatherDraggable: state.weatherDraggable,
    showWeatherPanel: state.showWeatherPanel,
    setUserName: state.setUserName,
    setShowFavoritesPanel: state.setShowFavoritesPanel,
    setShowTodosPanel: state.setShowTodosPanel,
    setShowWorkPanel: state.setShowWorkPanel,
    setShowNotificationPanel: state.setShowNotificationPanel,
    setShowFocusSection: state.setShowFocusSection,
    setWeatherApiKey: state.setWeatherApiKey,
    setShowWeeklyForecast: state.setShowWeeklyForecast,
    setShowHourlyForecast: state.setShowHourlyForecast,
    setWeatherDraggable: state.setWeatherDraggable,
    setShowWeatherPanel: state.setShowWeatherPanel,
  });

  const panelToggle = usePanelToggle({
    favoritesOpen: state.favoritesOpen,
    setFavoritesOpen: state.setFavoritesOpen,
    todosOpen: state.todosOpen,
    setTodosOpen: state.setTodosOpen,
    workPanelOpen: state.workPanelOpen,
    setWorkPanelOpen: state.setWorkPanelOpen,
    notificationPanelOpen: state.notificationPanelOpen,
    setNotificationPanelOpen: state.setNotificationPanelOpen,
    weatherPanelOpen: state.weatherPanelOpen,
    setWeatherPanelOpen: state.setWeatherPanelOpen,
  });

  // ===== 계산된 값들 (메모이제이션) =====
  const computed = useComputedValues({
    todos: state.todos,
    showCompletedTodos: state.showCompletedTodos,
    workRecords: state.workRecords,
    weekOffset: state.weekOffset,
  });

  const scrollToDate = useCallback(
    (date: string) => {
      state.setSelectedDate(date);
      setTimeout(() => {
        const element = todoRefs.current[date];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    },
    [state],
  );

  const todayRecord = useMemo(
    () => state.workRecords.find((r) => r.date === formatDate(new Date())),
    [state.workRecords, state.currentDate], // currentDate가 변경되면 재계산
  );

  // ===== 배경 스타일 =====
  const backgroundStyle = state.backgroundImage
    ? {
        backgroundImage: `url(${state.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { background: fallbackBackground };

  return (
    <div className="app-root">
      <div className="app-bg" style={backgroundStyle} />

      <div className="app-content">
        {/* 좌측 패널 영역 (즐겨찾기 + 날씨) */}
        {state.showFavoritesPanel && (
          <FavoritesPanel
            isOpen={state.favoritesOpen}
            favorites={state.favorites}
            onToggle={panelToggle.toggleFavoritesOpen}
            onAddClick={favoriteHandler.openAddModal}
            onEditClick={favoriteHandler.openEditModal}
            onDeleteClick={favoriteHandler.handleDeleteFavorite}
            onOpenFavorite={favoriteHandler.handleOpenFavorite}
            onReorder={favoriteHandler.handleReorderFavorites}
          />
        )}

        {/* 날씨 패널 */}
        <WeatherPanel
          isCollapsed={!state.weatherPanelOpen}
          weatherApiKey={state.weatherApiKey}
          showWeeklyForecast={state.showWeeklyForecast}
          showHourlyForecast={state.showHourlyForecast}
          weatherDraggable={state.weatherDraggable}
          unit={state.weatherUnit}
          onUnitToggle={() => {
            const next: "C" | "F" = state.weatherUnit === "C" ? "F" : "C";
            state.setWeatherUnit(next);
            chrome.storage.sync.set({ weatherUnit: next });
          }}
          onToggle={panelToggle.toggleWeatherPanelOpen}
          onSettingsClick={optionsModal.openOptionsModal}
          onWeatherDataUpdate={setWeatherData}
        />

        {/* 중앙 메인 영역 */}
        <main className="app-main">
          <AppHeader
            time={state.time}
            greeting={state.greeting}
            focus={state.focus}
            focusInputValue={state.focusInputValue}
            todayRecord={todayRecord}
            showWorkPanel={state.showWorkPanel}
            showNotificationPanel={state.showNotificationPanel}
            showFocusSection={state.showFocusSection}
            showWeatherPanel={state.showWeatherPanel}
            weatherData={weatherData}
            workTranslations={t.work}
            onFocusInputChange={state.setFocusInputValue}
            onFocusKeyDown={focusHandler.handleFocusKeyDown}
            onFocusBlur={focusHandler.handleFocusBlur}
            onWorkSave={workHandler.handleQuickSave}
          />
        </main>

        {/* 하단 패널 영역 (알림 + 할일 + 근무기록) */}
        <div className="bottom-panels">
          {/* 알림 패널 */}
          {state.showNotificationPanel && (
            <NotificationPanel
              isCollapsed={!state.notificationPanelOpen}
              onToggle={panelToggle.toggleNotificationPanelOpen}
            />
          )}

          {/* 할일 + 근무기록 래퍼 */}
          <div className="todo-work-wrapper">
            {/* 우측 투두 패널 */}
            {state.showTodosPanel && (
              <TodoPanel
                isOpen={state.todosOpen}
                todos={state.todos}
                todosByDate={computed.todosByDate}
                remainingCount={computed.remainingCount}
                selectedDate={state.selectedDate}
                newTodoText={state.newTodoText}
                showCompletedTodos={state.showCompletedTodos}
                todoRefs={todoRefs}
                currentDate={state.currentDate}
                onToggle={panelToggle.toggleTodosOpen}
                onAddTodo={todoHandler.handleAddTodo}
                onToggleTodo={todoHandler.handleToggleTodo}
                onDeleteTodo={todoHandler.handleDeleteTodo}
                onNewTodoTextChange={state.setNewTodoText}
                onSelectedDateChange={state.setSelectedDate}
                onShowCompletedTodosToggle={() => state.setShowCompletedTodos(!state.showCompletedTodos)}
              />
            )}

            {/* 주간 근무 기록 패널 */}
            {state.showWorkPanel && (
              <WorkPanel
                isOpen={state.workPanelOpen}
                weekRecords={computed.weekRecords}
                weekOffset={state.weekOffset}
                selectedDate={state.selectedDate}
                weekRangeText={computed.weekRangeText}
                weekTotal={computed.weekTotal}
                weekTarget={computed.weekTarget}
                overtime={computed.overtime}
                currentDate={state.currentDate}
                onToggle={panelToggle.toggleWorkPanelOpen}
                onWeekOffsetChange={state.setWeekOffset}
                onEditClick={workHandler.handleDateEdit}
                onDateClick={scrollToDate}
              />
            )}
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <ModalContainer
        isFavModalOpen={favoriteHandler.isFavModalOpen}
        isEditingFavorite={!!favoriteHandler.favIcon}
        favLabel={favoriteHandler.favLabel}
        favUrl={favoriteHandler.favUrl}
        favIcon={favoriteHandler.favIcon}
        onFavClose={favoriteHandler.closeModal}
        onFavSubmit={favoriteHandler.handleSubmitFavorite}
        onFavLabelChange={favoriteHandler.setFavLabel}
        onFavUrlChange={favoriteHandler.setFavUrl}
        onFavIconChange={favoriteHandler.setFavIcon}
        isTimeEditModalOpen={workHandler.isTimeEditModalOpen}
        editingDate={workHandler.editingDate}
        editingCheckIn={workHandler.editingCheckIn}
        editingCheckOut={workHandler.editingCheckOut}
        editingIsVacation={workHandler.editingIsVacation}
        editingLeaveType={workHandler.editingLeaveType}
        onTimeEditClose={workHandler.closeTimeEditModal}
        onTimeEditSave={workHandler.handleSaveTimeEdit}
        onCheckInChange={workHandler.setEditingCheckIn}
        onCheckOutChange={workHandler.setEditingCheckOut}
        onIsVacationChange={workHandler.setEditingIsVacation}
        onLeaveTypeChange={workHandler.setEditingLeaveType}
        editingExcludeLunch={workHandler.editingExcludeLunch}
        onExcludeLunchChange={workHandler.setEditingExcludeLunch}
        isOptionsModalOpen={optionsModal.isOptionsModalOpen}
        optionsUserName={optionsModal.optionsUserName}
        optionsShowFavorites={optionsModal.optionsShowFavorites}
        optionsShowTodos={optionsModal.optionsShowTodos}
        optionsShowWork={optionsModal.optionsShowWork}
        optionsShowNotifications={optionsModal.optionsShowNotifications}
        optionsShowFocus={optionsModal.optionsShowFocus}
        weatherApiKey={optionsModal.optionsWeatherApiKey}
        showWeeklyForecast={optionsModal.optionsShowWeeklyForecast}
        showHourlyForecast={optionsModal.optionsShowHourlyForecast}
        weatherDraggable={optionsModal.optionsWeatherDraggable}
        showWeatherPanel={optionsModal.optionsShowWeatherPanel}
        onOptionsClose={optionsModal.closeOptionsModal}
        onUserNameChange={optionsModal.handleUserNameChange}
        onShowFavoritesChange={optionsModal.handleShowFavoritesChange}
        onShowTodosChange={optionsModal.handleShowTodosChange}
        onShowWorkChange={optionsModal.handleShowWorkChange}
        onShowNotificationsChange={optionsModal.handleShowNotificationsChange}
        onShowFocusChange={optionsModal.handleShowFocusChange}
        onWeatherApiKeyChange={optionsModal.handleWeatherApiKeyChange}
        onShowWeeklyForecastChange={optionsModal.handleShowWeeklyForecastChange}
        onShowHourlyForecastChange={optionsModal.handleShowHourlyForecastChange}
        onWeatherDraggableChange={optionsModal.handleWeatherDraggableChange}
        onShowWeatherPanelChange={optionsModal.handleShowWeatherPanelChange}
      />


      {/* 설정 버튼 */}
      <button className="settings-btn" onClick={optionsModal.openOptionsModal} aria-label={t.options.settings}>
        ⚙️
      </button>
    </div>
  );
};
