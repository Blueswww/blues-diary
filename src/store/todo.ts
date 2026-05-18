import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTodosByDate, createTodo, toggleTodo, deleteTodo, updateTodoReminder, type TodoRecord, type TodoReminder } from '@/api/todo'
import { getToday } from '@/utils/dayjs'

/** 默认订阅消息模板 ID（用户可在"我"页面修改） */
const DEFAULT_TEMPLATE_ID = 'mP9JdbNYlo-2QvknNlB3DBNLtbKv0kkFJDbUvrvHbus'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<TodoRecord[]>([])
  const todayTodos = ref<TodoRecord[]>([])
  const loading = ref(false)
  const sendingReminders = ref<Set<string>>(new Set())
  let checkTimer: ReturnType<typeof setInterval> | null = null

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
    if (res.success) {
      await loadTodosByDate(date)
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

  async function setReminder(id: string, reminder: TodoReminder | null) {
    const res = await updateTodoReminder(id, reminder)
    if (res.success) {
      const todo = todos.value.find(t => t._id === id)
      if (todo) {
        todo.reminder = reminder || undefined
        todo.reminded = false
      }
      const todayTodo = todayTodos.value.find(t => t._id === id)
      if (todayTodo) {
        todayTodo.reminder = reminder || undefined
        todayTodo.reminded = false
      }
      return true
    }
    return false
  }

  /** 检查并触发到期的提醒 */
  async function checkReminders() {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const today = getToday()

    const dueTodos = todos.value.filter(t =>
      t.date === today
      && t.reminder?.enabled
      && !t.reminded
      && !t.isDone           // 已完成的不再提醒
      && t.reminder.time === currentTime
      && !sendingReminders.value.has(t._id)
    )

    for (const todo of dueTodos) {
      sendingReminders.value.add(todo._id)
      try {
        await sendReminderMessage(todo.content, todo.reminder!.time, todo.date)
        // 标记已提醒（持久化 reminded 状态，防止数据重载后重复触发）
        await updateTodoReminder(todo._id, { ...todo.reminder!, enabled: true }, true)
        const t = todos.value.find(t => t._id === todo._id)
        if (t) t.reminded = true
        const tt = todayTodos.value.find(t => t._id === todo._id)
        if (tt) tt.reminded = true
      } catch (e) {
        console.error('[TodoStore] 提醒发送失败:', e)
      } finally {
        sendingReminders.value.delete(todo._id)
      }
    }
  }

  /** 通过云函数发送订阅消息（授权已在 confirmReminder 时完成） */
  async function sendReminderMessage(content: string, time: string, date: string) {
    const templateId = DEFAULT_TEMPLATE_ID

    const wxNative = (globalThis as any)['w' + 'x']
    if (!wxNative?.cloud) {
      console.warn('[TodoStore] 微信云开发不可用')
      return
    }

    // 调用云函数发送
    const res = await wxNative.cloud.callFunction({
      name: 'sendReminder',
      data: {
        templateId,
        content,
        time,
        date,
      },
    })

    if (!res.result?.success) {
      throw new Error(res.result?.error || '发送失败')
    }
  }

  /** 启动提醒检查（建议在页面 onShow 调用） */
  function startReminderCheck() {
    stopReminderCheck()
    checkReminders() // 立即检查一次
    checkTimer = setInterval(() => checkReminders(), 30000) // 每 30 秒检查
  }

  /** 停止提醒检查（建议在页面 onHide 调用） */
  function stopReminderCheck() {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }
  }

  function clearCache() {
    todos.value = []
    todayTodos.value = []
    loading.value = false
  }

  return {
    todos,
    todayTodos,
    loading,
    sendingReminders,
    loadTodosByDate,
    addTodo,
    toggleDone,
    removeTodo,
    setReminder,
    checkReminders,
    startReminderCheck,
    stopReminderCheck,
    todayProgress,
    clearCache,
  }
})
