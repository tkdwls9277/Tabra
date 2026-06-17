import React from "react";
import { FavoriteModal } from "./modals/FavoriteModal";
import { OptionsModal } from "./modals/OptionsModal";
import { TimeEditModal } from "./modals/TimeEditModal";

interface ModalContainerProps {
  // Favorite Modal
  isFavModalOpen: boolean;
  isEditingFavorite: boolean;
  favLabel: string;
  favUrl: string;
  favIcon: string;
  onFavClose: () => void;
  onFavSubmit: () => void;
  onFavLabelChange: (value: string) => void;
  onFavUrlChange: (value: string) => void;
  onFavIconChange: (value: string) => void;

  // TimeEdit Modal
  isTimeEditModalOpen: boolean;
  editingDate: string;
  editingCheckIn: string;
  editingCheckOut: string;
  editingIsVacation: boolean;
  editingLeaveType?: "none" | "annual" | "half";
  editingExcludeLunch?: boolean;
  onTimeEditClose: () => void;
  onTimeEditSave: () => void;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onIsVacationChange: (value: boolean) => void;
  onLeaveTypeChange?: (value: "none" | "annual" | "half") => void;
  onExcludeLunchChange?: (value: boolean) => void;

  // Options Modal
  isOptionsModalOpen: boolean;
  optionsUserName: string;
  optionsShowFavorites: boolean;
  optionsShowTodos: boolean;
  optionsShowWork: boolean;
  optionsShowNotifications: boolean;
  optionsShowFocus: boolean;
  weatherApiKey: string;
  showWeeklyForecast: boolean;
  showHourlyForecast: boolean;
  weatherDraggable: boolean;
  showWeatherPanel: boolean;
  onOptionsClose: () => void;
  onUserNameChange: (value: string) => void;
  onShowFavoritesChange: (value: boolean) => void;
  onShowTodosChange: (value: boolean) => void;
  onShowWorkChange: (value: boolean) => void;
  onShowNotificationsChange: (value: boolean) => void;
  onShowFocusChange: (value: boolean) => void;
  onWeatherApiKeyChange: (value: string) => void;
  onShowWeeklyForecastChange: (value: boolean) => void;
  onShowHourlyForecastChange: (value: boolean) => void;
  onWeatherDraggableChange: (value: boolean) => void;
  onShowWeatherPanelChange: (value: boolean) => void;
}

/**
 * 모든 모달을 관리하는 컨테이너 컴포넌트
 */
export const ModalContainer: React.FC<ModalContainerProps> = ({
  // Favorite Modal
  isFavModalOpen,
  isEditingFavorite,
  favLabel,
  favUrl,
  favIcon,
  onFavClose,
  onFavSubmit,
  onFavLabelChange,
  onFavUrlChange,
  onFavIconChange,

  // TimeEdit Modal
  isTimeEditModalOpen,
  editingDate,
  editingCheckIn,
  editingCheckOut,
  editingIsVacation,
  editingLeaveType,
  editingExcludeLunch,
  onTimeEditClose,
  onTimeEditSave,
  onCheckInChange,
  onCheckOutChange,
  onIsVacationChange,
  onLeaveTypeChange,
  onExcludeLunchChange,

  // Options Modal
  isOptionsModalOpen,
  optionsUserName,
  optionsShowFavorites,
  optionsShowTodos,
  optionsShowWork,
  optionsShowNotifications,
  optionsShowFocus,
  weatherApiKey,
  showWeeklyForecast,
  showHourlyForecast,
  weatherDraggable,
  showWeatherPanel,
  onOptionsClose,
  onUserNameChange,
  onShowFavoritesChange,
  onShowTodosChange,
  onShowWorkChange,
  onShowNotificationsChange,
  onShowFocusChange,
  onWeatherApiKeyChange,
  onShowWeeklyForecastChange,
  onShowHourlyForecastChange,
  onWeatherDraggableChange,
  onShowWeatherPanelChange,
}) => {
  return (
    <>
      <FavoriteModal
        isOpen={isFavModalOpen}
        isEditing={isEditingFavorite}
        label={favLabel}
        url={favUrl}
        icon={favIcon}
        onClose={onFavClose}
        onSubmit={onFavSubmit}
        onLabelChange={onFavLabelChange}
        onUrlChange={onFavUrlChange}
        onIconChange={onFavIconChange}
      />

      <TimeEditModal
        isOpen={isTimeEditModalOpen}
        date={editingDate}
        checkIn={editingCheckIn}
        checkOut={editingCheckOut}
        isVacation={editingIsVacation}
        leaveType={editingLeaveType}
        onClose={onTimeEditClose}
        onSave={onTimeEditSave}
        onCheckInChange={onCheckInChange}
        onCheckOutChange={onCheckOutChange}
        onIsVacationChange={onIsVacationChange}
        onLeaveTypeChange={onLeaveTypeChange}
        excludeLunch={editingExcludeLunch}
        onExcludeLunchChange={onExcludeLunchChange}
      />

      <OptionsModal
        isOpen={isOptionsModalOpen}
        userName={optionsUserName}
        showFavorites={optionsShowFavorites}
        showTodos={optionsShowTodos}
        showWork={optionsShowWork}
        showNotifications={optionsShowNotifications}
        showFocus={optionsShowFocus}
        weatherApiKey={weatherApiKey}
        showWeeklyForecast={showWeeklyForecast}
        showHourlyForecast={showHourlyForecast}
        weatherDraggable={weatherDraggable}
        showWeatherPanel={showWeatherPanel}
        onClose={onOptionsClose}
        onUserNameChange={onUserNameChange}
        onShowFavoritesChange={onShowFavoritesChange}
        onShowTodosChange={onShowTodosChange}
        onShowWorkChange={onShowWorkChange}
        onShowNotificationsChange={onShowNotificationsChange}
        onShowFocusChange={onShowFocusChange}
        onWeatherApiKeyChange={onWeatherApiKeyChange}
        onShowWeeklyForecastChange={onShowWeeklyForecastChange}
        onShowHourlyForecastChange={onShowHourlyForecastChange}
        onWeatherDraggableChange={onWeatherDraggableChange}
        onShowWeatherPanelChange={onShowWeatherPanelChange}
      />
    </>
  );
};
