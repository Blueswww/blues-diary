import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTags, createTag, deleteTag, type TagRecord } from '@/api/tag'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<TagRecord[]>([])
  const loading = ref(false)

  async function loadTags() {
    loading.value = true
    const res = await getTags()
    if (res.success && res.data) {
      tags.value = res.data
    }
    loading.value = false
  }

  async function addTag(name: string, color: string = '#5B7FFF') {
    const res = await createTag(name, color)
    if (res.success && res.data) {
      tags.value.push(res.data)
      return res.data
    }
    return null
  }

  async function removeTag(id: string) {
    const res = await deleteTag(id)
    if (res.success) {
      tags.value = tags.value.filter(t => t._id !== id)
      return true
    }
    return false
  }

  function getTagById(id: string): TagRecord | undefined {
    return tags.value.find(t => t._id === id)
  }

  function getTagNames(ids: string[]): string[] {
    return ids.map(id => getTagById(id)?.name || '未知').filter(Boolean)
  }

  function clearCache() {
    tags.value = []
    loading.value = false
  }

  return {
    tags,
    loading,
    loadTags,
    addTag,
    removeTag,
    getTagById,
    getTagNames,
    clearCache,
  }
})
