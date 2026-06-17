import { TodoService } from "../services/todoService";
import type { Todo } from "../types/index";

interface UseTodoHandlerProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  newTodoText: string;
  setNewTodoText: (text: string) => void;
  selectedDate: string | null;
}

/**
 * Todo 관련 로직을 관리하는 커스텀 훅
 */
export function useTodoHandler(props: UseTodoHandlerProps) {
  const { todos, setTodos, newTodoText, setNewTodoText, selectedDate } = props;

  const handleSaveTodos = (next: Todo[]) => {
    setTodos(next);
    TodoService.saveTodos(next);
  };

  const handleAddTodo = () => {
    const text = newTodoText.trim();
    if (!text) return;
    const next = TodoService.addTodo(todos, text, selectedDate);
    handleSaveTodos(next);
    setNewTodoText("");
  };

  const handleToggleTodo = (id: string) => {
    const next = TodoService.toggleTodo(todos, id);
    handleSaveTodos(next);
  };

  const handleDeleteTodo = (id: string) => {
    const next = TodoService.deleteTodo(todos, id);
    handleSaveTodos(next);
  };

  return {
    handleSaveTodos,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
  };
}
