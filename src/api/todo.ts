import { getDB, ok, fail } from './index'
import type { CloudFunctionResult } from './types'

export interface TodoRecord {
  _id: string
  date: string
  content: string
  isDone: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

const db = getDB()
const collection = db.collection('todos')

/** 获取指定日期的待办 */
export async function getTodosByDate(date: string): Promise<CloudFunctionResult<TodoRecord[]>> {
  try {
    const res = await collection.where({ date }).orderBy('priority', 'desc').get()
    return ok(res.data as TodoRecord[])
  } catch (err: any) {
    console.error('[API] getTodosByDate:', err)
    return fail(err.message || '获取待办失败')
  }
}

/** 创建待办 */
export async function createTodo(
  date: string,
  content: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<CloudFunctionResult<TodoRecord>> {
  try {
    const doc = {
      date,
      content,
      isDone: false,
      priority,
      createdAt: db.serverDate(),
    }
    const res = await collection.add({ data: doc })
    return ok({ _id: res._id, ...doc } as unknown as TodoRecord)
  } catch (err: any) {
    console.error('[API] createTodo:', err)
    return fail(err.message || '创建待办失败')
  }
}

/** 切换完成状态 */
export async function toggleTodo(id: string, isDone: boolean): Promise<CloudFunctionResult<TodoRecord>> {
  try {
    await collection.doc(id).update({
      data: { isDone },
    })
    const updated = await collection.doc(id).get()
    return ok(updated.data as TodoRecord)
  } catch (err: any) {
    console.error('[API] toggleTodo:', err)
    return fail(err.message || '更新待办失败')
  }
}

/** 删除待办 */
export async function deleteTodo(id: string): Promise<CloudFunctionResult> {
  try {
    await collection.doc(id).remove()
    return ok({ _id: id })
  } catch (err: any) {
    console.error('[API] deleteTodo:', err)
    return fail(err.message || '删除待办失败')
  }
}
