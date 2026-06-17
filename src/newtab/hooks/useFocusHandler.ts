import { StorageService } from "../services/storageService";

interface UseFocusHandlerProps {
  focus: string;
  setFocus: (value: string) => void;
  focusInputValue: string;
  setFocusInputValue: (value: string) => void;
}

/**
 * Focus(오늘의 핵심 목표) 관련 로직을 관리하는 커스텀 훅
 */
export function useFocusHandler(props: UseFocusHandlerProps) {
  const { focus, setFocus, focusInputValue, setFocusInputValue } = props;

  const handleFocusKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      const value = focusInputValue.trim();
      if (!value) return;
      setFocus(value);
      setFocusInputValue("");
      StorageService.saveTodayFocus(value);
    }
  };

  const handleFocusBlur = () => {
    const value = focusInputValue.trim();
    if (value !== focus) {
      setFocus(value);
      StorageService.saveTodayFocus(value);
    }
    setFocusInputValue("");
  };

  const handleFocusDelete = () => {
    setFocus("");
    setFocusInputValue("");
    StorageService.saveTodayFocus("");
  };

  return {
    handleFocusKeyDown,
    handleFocusBlur,
    handleFocusDelete,
  };
}
