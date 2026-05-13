import { callCloudFunction } from './index'

export interface TodoRecord {
  _id: string
  userId: string
  date: string          // YYYY-MM-DD
  content: string
  isDone: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

/** 获取指定日期的待办 */
export async function getTodosByDate(date: string) {
  return callCloudFunction<TodoRecord[]>({
    name: 'todo',
    data: { action: 'listByDate', date },
  })
}

/** 创建待办 */
export async function createTodo(date: string, content: string, priority: 'low' | 'medium' | 'high' = 'medium') {
  return callCloudFunction<TodoRecord>({
    name: 'todo',
    data: { action: 'create', date, content, priority },
  })
}

/** 切换完成状态 */
export async function toggleTodo(id: string, isDone: boolean) {
  return callCloudFunction<TodoRecord>({
    name: 'todo',
    data: { action: 'toggle', _id: id, isDone },
  })
}

/** 删除待办 */
export async function deleteTodo(id: string) {
  return callCloudFunction({
    name: 'todo',
    data: { action: 'delete', _id: id },
  })
}
