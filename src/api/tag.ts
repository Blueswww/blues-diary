import { callCloudFunction } from './index'

export interface TagRecord {
  _id: string
  userId: string
  name: string
  color: string         // 标签颜色, e.g. '#5B7FFF'
  createdAt: string
}

/** 获取用户所有标签 */
export async function getTags() {
  return callCloudFunction<TagRecord[]>({
    name: 'tag',
    data: { action: 'list' },
  })
}

/** 创建标签 */
export async function createTag(name: string, color: string = '#5B7FFF') {
  return callCloudFunction<TagRecord>({
    name: 'tag',
    data: { action: 'create', name, color },
  })
}

/** 删除标签 */
export async function deleteTag(id: string) {
  return callCloudFunction({
    name: 'tag',
    data: { action: 'delete', _id: id },
  })
}
