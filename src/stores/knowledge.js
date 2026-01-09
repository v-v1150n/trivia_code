import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useKnowledgeStore = defineStore('knowledge', () => {
    // 狀態
    const knowledgeList = ref([])
    const favorites = ref([])
    const currentIndex = ref(0)
    const isLoading = ref(false)
    const error = ref(null)
    const trendingTopics = ref([])

    // 從 LocalStorage 載入收藏
    const loadFavorites = () => {
        const saved = localStorage.getItem('cold-knowledge-favorites')
        if (saved) {
            favorites.value = JSON.parse(saved)
        }
    }

    // 儲存收藏到 LocalStorage
    const saveFavorites = () => {
        localStorage.setItem('cold-knowledge-favorites', JSON.stringify(favorites.value))
    }

    // 添加到收藏
    const addToFavorites = (knowledge) => {
        if (!favorites.value.find(f => f.id === knowledge.id)) {
            favorites.value.push({
                ...knowledge,
                savedAt: new Date().toISOString()
            })
            saveFavorites()
        }
    }

    // 從收藏移除
    const removeFromFavorites = (id) => {
        favorites.value = favorites.value.filter(f => f.id !== id)
        saveFavorites()
    }

    // 檢查是否已收藏
    const isFavorite = (id) => {
        return favorites.value.some(f => f.id === id)
    }

    // 取得冷知識
    const fetchKnowledge = async (keywords = '', count = 3) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keywords, count })
            })

            if (!response.ok) {
                throw new Error('API 請求失敗')
            }

            const data = await response.json()

            // 解析並添加到列表
            const newKnowledge = data.knowledge.map((k, i) => ({
                id: Date.now() + i,
                ...k
            }))

            knowledgeList.value = [...knowledgeList.value, ...newKnowledge]
            currentIndex.value = knowledgeList.value.length - newKnowledge.length

        } catch (e) {
            error.value = e.message
            console.error('Error fetching knowledge:', e)
        } finally {
            isLoading.value = false
        }
    }

    // 取得今日熱門話題
    const fetchTrendingTopics = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await fetch('/api/trending', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('API 請求失敗')
            }

            const data = await response.json()
            trendingTopics.value = data.topics || []

        } catch (e) {
            error.value = e.message
            console.error('Error fetching trending topics:', e)
        } finally {
            isLoading.value = false
        }
    }

    // 下一則
    const nextKnowledge = () => {
        if (currentIndex.value < knowledgeList.value.length - 1) {
            currentIndex.value++
        }
    }

    // 上一則
    const prevKnowledge = () => {
        if (currentIndex.value > 0) {
            currentIndex.value--
        }
    }

    // 當前冷知識
    const currentKnowledge = computed(() => {
        return knowledgeList.value[currentIndex.value] || null
    })

    // 是否還有下一則
    const hasNext = computed(() => {
        return currentIndex.value < knowledgeList.value.length - 1
    })

    // 是否還有上一則
    const hasPrev = computed(() => currentIndex.value > 0)

    // 初始化
    loadFavorites()

    return {
        // 狀態
        knowledgeList,
        favorites,
        currentIndex,
        isLoading,
        error,
        trendingTopics,

        // 計算屬性
        currentKnowledge,
        hasNext,
        hasPrev,

        // 方法
        fetchKnowledge,
        fetchTrendingTopics,
        nextKnowledge,
        prevKnowledge,
        addToFavorites,
        removeFromFavorites,
        isFavorite
    }
})
