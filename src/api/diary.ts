import { getDB, ok, fail } from './index'
import type { CloudFunctionResult } from './types'

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

const db = getDB()
const collection = db.collection('diaries')

/** 获取日期范围内的日记 */
export async function getDiariesByDateRange(startDate: string, endDate: string): Promise<CloudFunctionResult<DiaryRecord[]>> {
  try {
    const res = await collection.where({
      date: db.command.gte(startDate).and(db.command.lt(endDate)),
    }).orderBy('date', 'desc').get()
    return ok(res.data as DiaryRecord[])
  } catch (err: any) {
    console.error('[API] getDiariesByDateRange:', err)
    return fail(err.message || '获取日记失败')
  }
}

/** 获取指定日期的日记 */
export async function getDiaryByDate(date: string): Promise<CloudFunctionResult<DiaryRecord | null>> {
  try {
    const res = await collection.where({ date }).limit(1).get()
    return ok((res.data[0] as DiaryRecord) || null)
  } catch (err: any) {
    console.error('[API] getDiaryByDate:', err)
    return fail(err.message || '获取日记失败')
  }
}

/** 创建日记 */
export async function createDiary(input: {
  date: string
  content: string
  mood?: string
  weather?: string
  images?: string[]
  tags?: string[]
}): Promise<CloudFunctionResult<DiaryRecord>> {
  try {
    // Check if diary already exists for this date
    const existing = await collection.where({ date: input.date }).limit(1).get()
    if (existing.data.length > 0) {
      // Update existing
      await collection.doc(existing.data[0]._id).update({
        data: {
          content: input.content,
          mood: input.mood || '',
          weather: input.weather || '',
          images: input.images || [],
          tags: input.tags || [],
          updatedAt: db.serverDate(),
        },
      })
      return ok({ ...existing.data[0], ...input } as unknown as DiaryRecord)
    }
    // Create new
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
export async function updateDiary(input: {
  _id: string
  content?: string
  mood?: string
  weather?: string
  images?: string[]
  tags?: string[]
}): Promise<CloudFunctionResult<DiaryRecord>> {
  try {
    const updateData: Record<string, any> = { updatedAt: db.serverDate() }
    if (input.content !== undefined) updateData.content = input.content
    if (input.mood !== undefined) updateData.mood = input.mood
    if (input.weather !== undefined) updateData.weather = input.weather
    if (input.images !== undefined) updateData.images = input.images
    if (input.tags !== undefined) updateData.tags = input.tags

    await collection.doc(input._id).update({ data: updateData })
    const updated = await collection.doc(input._id).get()
    return ok(updated.data as DiaryRecord)
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
    return ok(res.data as DiaryRecord[])
  } catch (err: any) {
    console.error('[API] getDiariesByTag:', err)
    return fail(err.message || '获取日记失败')
  }
}
