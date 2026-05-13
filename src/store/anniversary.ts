import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAnniversaries, createAnniversary, deleteAnniversary, type AnniversaryRecord } from '@/api/anniversary'
import dayjs from '@/utils/dayjs'

export const useAnniversaryStore = defineStore('anniversary', () => {
  const anniversaries = ref<AnniversaryRecord[]>([])
  const loading = ref(false)

  /** 即将到来的纪念日（近 30 天） */
  const upcomingAnniversaries = computed(() => {
    const today = dayjs()
    return anniversaries.value
      .map(a => {
        const dateThisYear = dayjs(`${today.year()}-${a.date.slice(5)}`)
        const diff = dateThisYear.diff(today, 'day')
        const daysUntil = diff >= 0 ? diff : dateThisYear.add(1, 'year').diff(today, 'day')
        return { ...a, daysUntil, dateThisYear: dateThisYear.format('YYYY-MM-DD') }
      })
      .filter(a => a.daysUntil >= 0 && a.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  })

  async function loadAnniversaries() {
    loading.value = true
    const res = await getAnniversaries()
    if (res.success && res.data) {
      anniversaries.value = res.data
    }
    loading.value = false
  }

  async function addAnniversary(input: {
    name: string
    date: string
    type: 'solar' | 'lunar'
    remindDays?: number[]
  }) {
    const res = await createAnniversary(input)
    if (res.success && res.data) {
      anniversaries.value.push(res.data)
      return true
    }
    return false
  }

  async function removeAnniversary(id: string) {
    const res = await deleteAnniversary(id)
    if (res.success) {
      anniversaries.value = anniversaries.value.filter(a => a._id !== id)
      return true
    }
    return false
  }

  return {
    anniversaries,
    upcomingAnniversaries,
    loading,
    loadAnniversaries,
    addAnniversary,
    removeAnniversary,
  }
})
