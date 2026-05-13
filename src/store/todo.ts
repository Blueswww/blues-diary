import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTodosByDate, createTodo, toggleTodo, deleteTodo, type TodoRecord } from '@/api/todo'
import { getToday } from '@/utils/dayjs'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<TodoRecord[]>([])
  const todayTodos = ref<TodoRecord[]>([])
  const loading = ref(false)

  async function loadTodosByDate(date: string) {
    loading.value = true
    const res = await getTodosByDate(date)
    if (res.success && res.data) {
      if (date === getToday()) {
        todayTodos.value = res.data
      }
      todos.value = res.data
    }
    loading.value = false
  }

  async function addTodo(date: string, content: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    const res = await createTodo(date, content, priority)
    if (res.success && res.data) {
      todos.value.push(res.data)
      if (date === getToday()) {
        todayTodos.value.push(res.data)
      }
      return true
    }
    return false
  }

  async function toggleDone(id: string, isDone: boolean) {
    const res = await toggleTodo(id, isDone)
    if (res.success) {
      const todo = todos.value.find(t => t._id === id)
      if (todo) todo.isDone = isDone
      const todayTodo = todayTodos.value.find(t => t._id === id)
      if (todayTodo) todayTodo.isDone = isDone
      return true
    }
    return false
  }

  async function removeTodo(id: string) {
    const res = await deleteTodo(id)
    if (res.success) {
      todos.value = todos.value.filter(t => t._id !== id)
      todayTodos.value = todayTodos.value.filter(t => t._id !== id)
      return true
    }
    return false
  }

  /** 今日待办完成率 */
  function todayProgress(): { done: number; total: number; percent: number } {
    const done = todayTodos.value.filter(t => t.isDone).length
    const total = todayTodos.value.length
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }

  return {
    todos,
    todayTodos,
    loading,
    loadTodosByDate,
    addTodo,
    toggleDone,
    removeTodo,
    todayProgress,
  }
})
