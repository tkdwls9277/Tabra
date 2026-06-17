import type { Todo, TodoGroup } from "../types";
import { formatDate } from "../utils/date";

export class TodoService {
  // Todo 저장 함수
  static saveTodos(todos: Todo[]): void {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ todos });
    }
  }

  // Todo 추가
  static addTodo(todos: Todo[], text: string, selectedDate: string | null): Todo[] {
    const targetDate = selectedDate || formatDate(new Date());
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      done: false,
      date: targetDate,
    };
    return [...todos, newTodo];
  }

  // Todo 토글
  static toggleTodo(todos: Todo[], id: string): Todo[] {
    return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  // Todo 삭제
  static deleteTodo(todos: Todo[], id: string): Todo[] {
    return todos.filter((t) => t.id !== id);
  }

  // 날짜별로 Todo 그룹화 및 필터링
  static getTodosByDate(todos: Todo[], showCompletedTodos: boolean): TodoGroup[] {
    const grouped: { [key: string]: Todo[] } = {};

    todos.forEach((todo) => {
      if (!grouped[todo.date]) {
        grouped[todo.date] = [];
      }
      grouped[todo.date].push(todo);
    });

    // 날짜순으로 정렬 (최신순)
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return sortedDates
      .map((date) => ({
        date,
        todos: grouped[date],
        hasIncomplete: grouped[date].some((t) => !t.done),
      }))
      .filter((group) => {
        // 완료된 Todo 표시가 켜져있으면 모든 그룹 표시
        if (showCompletedTodos) return true;
        // 아니면 미완료 항목이 있는 그룹만 표시
        return group.hasIncomplete;
      });
  }

  // 남은 Todo 개수 계산
  static getRemainingTodoCount(todos: Todo[]): number {
    return todos.filter((t) => !t.done).length;
  }
}
