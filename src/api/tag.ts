import { getDB, ok, fail } from './index'
import type { CloudFunctionResult } from './types'

export interface TagRecord {
  _id: string
  name: string
  color: string
  createdAt: string
}

const db = getDB()
const collection = db.collection('tags')

/** 获取所有标签 */
export async function getTags(): Promise<CloudFunctionResult<TagRecord[]>> {
  try {
    const res = await collection.orderBy('createdAt', 'desc').get()
    return ok(res.data as TagRecord[])
  } catch (err: any) {
    console.error('[API] getTags:', err)
    return fail(err.message || '获取标签失败')
  }
}

/** 创建标签 */
export async function createTag(name: string, color: string = '#5B7FFF'): Promise<CloudFunctionResult<TagRecord>> {
  try {
    const doc = {
      name,
      color,
      createdAt: db.serverDate(),
    }
    const res = await collection.add({ data: doc })
    return ok({ _id: res._id, ...doc } as unknown as TagRecord)
  } catch (err: any) {
    console.error('[API] createTag:', err)
    return fail(err.message || '创建标签失败')
  }
}

/** 删除标签 */
export async function deleteTag(id: string): Promise<CloudFunctionResult> {
  try {
    await collection.doc(id).remove()
    return ok({ _id: id })
  } catch (err: any) {
    console.error('[API] deleteTag:', err)
    return fail(err.message || '删除标签失败')
  }
}
