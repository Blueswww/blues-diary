import { callCloudFunction } from './index'

export interface DiaryRecord {
  _id: string
  userId: string
  date: string          // YYYY-MM-DD
  content: string       // 日记正文 (支持简要富文本 HTML)
  mood?: string         // 心情 emoji
  weather?: string      // 天气
  images?: string[]     // 图片 fileID 列表
  tags?: string[]       // 标签 ID 列表
  createdAt: string
  updatedAt: string
}

export interface DiaryCreateInput {
  date: string
  content: string
  mood?: string
  weather?: string
  images?: string[]
  tags?: string[]
}

export interface DiaryUpdateInput extends Partial<DiaryCreateInput> {
  _id: string
}

/** 获取日期范围内的日记 */
export async function getDiariesByDateRange(startDate: string, endDate: string) {
  return callCloudFunction<DiaryRecord[]>({
    name: 'diary',
    data: { action: 'listByDateRange', startDate, endDate },
  })
}

/** 获取指定日期的日记 */
export async function getDiaryByDate(date: string) {
  return callCloudFunction<DiaryRecord | null>({
    name: 'diary',
    data: { action: 'getByDate', date },
  })
}

/** 创建日记 */
export async function createDiary(input: DiaryCreateInput) {
  return callCloudFunction<DiaryRecord>({
    name: 'diary',
    data: { action: 'create', ...input },
  })
}

/** 更新日记 */
export async function updateDiary(input: DiaryUpdateInput) {
  return callCloudFunction<DiaryRecord>({
    name: 'diary',
    data: { action: 'update', ...input },
  })
}

/** 删除日记 */
export async function deleteDiary(id: string) {
  return callCloudFunction({
    name: 'diary',
    data: { action: 'delete', _id: id },
  })
}

/** 按标签获取日记 */
export async function getDiariesByTag(tagId: string) {
  return callCloudFunction<DiaryRecord[]>({
    name: 'diary',
    data: { action: 'listByTag', tagId },
  })
}
