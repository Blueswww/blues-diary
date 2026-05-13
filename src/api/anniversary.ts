import { callCloudFunction } from './index'

export interface AnniversaryRecord {
  _id: string
  userId: string
  name: string          // 纪念日名称
  date: string          // 日期 YYYY-MM-DD
  type: 'solar' | 'lunar'
  remindDays: number[]  // 提前提醒天数, e.g. [7, 1]
  createdAt: string
}

/** 获取所有纪念日 */
export async function getAnniversaries() {
  return callCloudFunction<AnniversaryRecord[]>({
    name: 'anniversary',
    data: { action: 'list' },
  })
}

/** 创建纪念日 */
export async function createAnniversary(input: {
  name: string
  date: string
  type: 'solar' | 'lunar'
  remindDays?: number[]
}) {
  return callCloudFunction<AnniversaryRecord>({
    name: 'anniversary',
    data: { action: 'create', ...input },
  })
}

/** 删除纪念日 */
export async function deleteAnniversary(id: string) {
  return callCloudFunction({
    name: 'anniversary',
    data: { action: 'delete', _id: id },
  })
}
