import { getDB, ok, fail } from './index'
import type { CloudFunctionResult } from './types'

export interface AnniversaryRecord {
  _id: string
  name: string
  date: string
  type: 'solar' | 'lunar'
  remindDays: number[]
  createdAt: string
}

const db = getDB()
const collection = db.collection('anniversaries')

/** 获取所有纪念日 */
export async function getAnniversaries(): Promise<CloudFunctionResult<AnniversaryRecord[]>> {
  try {
    const res = await collection.orderBy('date', 'asc').get()
    return ok(res.data as AnniversaryRecord[])
  } catch (err: any) {
    console.error('[API] getAnniversaries:', err)
    return fail(err.message || '获取纪念日失败')
  }
}

/** 创建纪念日 */
export async function createAnniversary(input: {
  name: string
  date: string
  type: 'solar' | 'lunar'
  remindDays?: number[]
}): Promise<CloudFunctionResult<AnniversaryRecord>> {
  try {
    const doc = {
      name: input.name,
      date: input.date,
      type: input.type,
      remindDays: input.remindDays || [7, 1],
      createdAt: db.serverDate(),
    }
    const res = await collection.add({ data: doc })
    return ok({ _id: res._id, ...doc } as unknown as AnniversaryRecord)
  } catch (err: any) {
    console.error('[API] createAnniversary:', err)
    return fail(err.message || '创建纪念日失败')
  }
}

/** 删除纪念日 */
export async function deleteAnniversary(id: string): Promise<CloudFunctionResult> {
  try {
    await collection.doc(id).remove()
    return ok({ _id: id })
  } catch (err: any) {
    console.error('[API] deleteAnniversary:', err)
    return fail(err.message || '删除纪念日失败')
  }
}
