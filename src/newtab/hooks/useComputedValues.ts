import { useMemo } from "react";
import { TodoService } from "../services/todoService";
import { WorkService } from "../services/workService";
import type { Todo, WorkRecord } from "../types/index";

interface UseComputedValuesProps {
  todos: Todo[];
  showCompletedTodos: boolean;
  workRecords: WorkRecord[];
  weekOffset: number;
}

/**
 * 비용이 큰 계산을 메모이제이션하는 커스텀 훅
 */
export function useComputedValues(props: UseComputedValuesProps) {
  const { todos, showCompletedTodos, workRecords, weekOffset } = props;

  // Todo 관련 계산 (메모이제이션)
  const todosByDate = useMemo(() => TodoService.getTodosByDate(todos, showCompletedTodos), [todos, showCompletedTodos]);

  const remainingCount = useMemo(() => TodoService.getRemainingTodoCount(todos), [todos]);

  // Work 관련 계산 (메모이제이션)
  const weekRecords = useMemo(() => WorkService.getWeekRecords(workRecords, weekOffset), [workRecords, weekOffset]);

  const weekTotal = useMemo(() => WorkService.calculateWeekTotal(weekRecords), [weekRecords]);

  const weekTarget = useMemo(() => WorkService.calculateWeekTarget(weekRecords), [weekRecords]);

  const overtime = useMemo(() => WorkService.calculateOvertime(weekRecords, weekOffset), [weekRecords, weekOffset]);

  const weekRangeText = useMemo(() => WorkService.getWeekRangeText(weekRecords), [weekRecords]);

  return {
    todosByDate,
    remainingCount,
    weekRecords,
    weekTotal,
    weekTarget,
    overtime,
    weekRangeText,
  };
}
