import { getDB, ok, fail } from './index'
import type { CloudFunctionResult } from './types'
import { decodeHtml } from '@/utils/decode'

export interface DiaryRecord {
  _id: string
  date: string
  content: string
  mood?: string
  weather?: string
  images?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export type DiaryCreateInput = {
  date: string
  content: string
  mood?: string
  weather?: string
  images?: string[]
  tags?: string[]
}

export type DiaryUpdateInput = {
  _id: string
  content?: string
  mood?: string
  weather?: string
  images?: string[]
  tags?: string[]
}

/** 解码日记内容（在 API 层统一处理） */
function decodeDiary(d: DiaryRecord): DiaryRecord {
  const decoded = decodeHtml(d.content)
  if (d.content !== decoded) {
    console.log('[API] decode:', JSON.stringify(d.content.slice(0, 80)), '→', JSON.stringify(decoded.slice(0, 80)))
  }
  return { ...d, content: decoded }
}
function decodeDiaries(data: DiaryRecord[]): DiaryRecord[] {
  return data.map(d => decodeDiary(d))
}

const db = getDB()
const collection = db.collection('diaries')

/** 获取日期范围内的日记 */
export async function getDiariesByDateRange(startDate: string, endDate: string): Promise<CloudFunctionResult<DiaryRecord[]>> {
  try {
    const res = await collection.where({
      date: db.command.gte(startDate).and(db.command.lt(endDate)),
    }).orderBy('date', 'desc').get()
    return ok(decodeDiaries(res.data as DiaryRecord[]))
  } catch (err: any) {
    console.error('[API] getDiariesByDateRange:', err)
    return fail(err.message || '获取日记失败')
  }
}

/** 获取指定日期的所有日记（支持每天多条） */
export async function getDiariesByDate(date: string): Promise<CloudFunctionResult<DiaryRecord[]>> {
  try {
    const res = await collection.where({ date }).orderBy('createdAt', 'asc').get()
    return ok(decodeDiaries(res.data as DiaryRecord[]))
  } catch (err: any) {
    console.error('[API] getDiariesByDate:', err)
    return fail(err.message || '获取日记失败')
  }
}

/** 创建日记 */
export async function createDiary(input: DiaryCreateInput): Promise<CloudFunctionResult<DiaryRecord>> {
  try {
    const doc = {
      date: input.date,
      content: input.content,
      mood: input.mood || '',
      weather: input.weather || '',
      images: input.images || [],
      tags: input.tags || [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    }
    const res = await collection.add({ data: doc })
    return ok({ _id: res._id, ...doc } as unknown as DiaryRecord)
  } catch (err: any) {
    console.error('[API] createDiary:', err)
    return fail(err.message || '保存日记失败')
  }
}

/** 更新日记 */
export async function updateDiary(input: DiaryUpdateInput): Promise<CloudFunctionResult<DiaryRecord>> {
  try {
    const updateData: Record<string, any> = { updatedAt: db.serverDate() }
    if (input.content !== undefined) updateData.content = input.content
    if (input.mood !== undefined) updateData.mood = input.mood
    if (input.weather !== undefined) updateData.weather = input.weather
    if (input.images !== undefined) updateData.images = input.images
    if (input.tags !== undefined) updateData.tags = input.tags

    await collection.doc(input._id).update({ data: updateData })
    const updated = await collection.doc(input._id).get()
    return ok(decodeDiary(updated.data as DiaryRecord))
  } catch (err: any) {
    console.error('[API] updateDiary:', err)
    return fail(err.message || '更新日记失败')
  }
}

/** 删除日记 */
export async function deleteDiary(id: string): Promise<CloudFunctionResult> {
  try {
    await collection.doc(id).remove()
    return ok({ _id: id })
  } catch (err: any) {
    console.error('[API] deleteDiary:', err)
    return fail(err.message || '删除日记失败')
  }
}

/** 按标签获取日记 */
export async function getDiariesByTag(tagId: string): Promise<CloudFunctionResult<DiaryRecord[]>> {
  try {
    const res = await collection.where({
      tags: db.command.elemMatch(db.command.eq(tagId)),
    }).orderBy('date', 'desc').get()
    return ok(decodeDiaries(res.data as DiaryRecord[]))
  } catch (err: any) {
    console.error('[API] getDiariesByTag:', err)
    return fail(err.message || '获取日记失败')
  }
}
