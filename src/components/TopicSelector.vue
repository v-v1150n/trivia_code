<template>
  <div class="topic-selector">
    <!-- 模式選擇 -->
    <div class="mode-tabs">
      <button 
        type="button"
        class="tab" 
        :class="{ active: mode === 'trending' }"
        @click="switchMode('trending')"
      >
        📈 今日熱門
      </button>
      <button 
        type="button"
        class="tab" 
        :class="{ active: mode === 'custom' }"
        @click="switchMode('custom')"
      >
        ✏️ 自訂關鍵字
      </button>
    </div>

    <!-- 今日熱門 -->
    <div v-if="mode === 'trending'" class="trending-section">
      <div v-if="store.isLoading" class="loading">
        <span class="loading-icon">🔍</span>
        <span>搜尋熱門話題中...</span>
      </div>
      
      <template v-else>
        <div v-if="store.trendingTopics.length" class="topics-grid">
          <button 
            type="button"
            v-for="(topic, index) in store.trendingTopics" 
            :key="index"
            class="topic-chip"
            :class="{ selected: selectedTopic === topic }"
            @click="selectTopic(topic)"
          >
            {{ topic }}
          </button>
        </div>
        
        <!-- 刷新按鈕 - 永遠可見 -->
        <button 
          type="button"
          class="btn btn-secondary refresh-btn"
          @click="refreshTrending"
        >
          🔄 重新搜尋熱門話題
        </button>
      </template>
    </div>

    <!-- 自訂關鍵字 -->
    <div v-if="mode === 'custom'" class="custom-section">
      <div class="input-wrapper">
        <input 
          v-model="customKeywords"
          type="text"
          class="input"
          placeholder="輸入關鍵字，多個用空格分隔..."
          @keyup.enter="search"
        />
        <button type="button" class="btn btn-primary search-btn" @click="search">
          🔍
        </button>
      </div>
      <p class="input-hint">例如：日本 動物、北歐 神話、太空探索</p>
    </div>

    <!-- 搜尋按鈕 -->
    <button 
      type="button"
      class="btn btn-primary main-search-btn"
      :disabled="store.isLoading || (!selectedTopic && !customKeywords)"
      @click="search"
    >
      <span v-if="store.isLoading">搜尋中...</span>
      <span v-else>🧊 探索冷知識</span>
    </button>

    <!-- 隨機按鈕 -->
    <button 
      type="button"
      class="btn btn-secondary random-btn"
      :disabled="store.isLoading"
      @click="randomSearch"
    >
      🎲 隨機冷知識
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'

const emit = defineEmits(['search'])

const store = useKnowledgeStore()

const mode = ref('trending')  // 預設為今日熱門
const selectedTopic = ref('')
const customKeywords = ref('')

// 載入熱門話題
const loadTrending = async () => {
  await store.fetchTrendingTopics()
}

// 手動刷新熱門話題
const refreshTrending = async () => {
  store.trendingTopics = []  // 清空現有話題
  await store.fetchTrendingTopics()
}

// 初始化時自動載入熱門話題
onMounted(() => {
  if (!store.trendingTopics.length) {
    loadTrending()
  }
})

// 選擇話題並直接搜尋
const selectTopic = (topic) => {
  selectedTopic.value = topic
  emit('search', topic, 'trending')
}

// 搜尋
const search = () => {
  if (!customKeywords.value.trim()) return
  emit('search', customKeywords.value, 'keyword')
}

// 隨機搜尋
const randomSearch = () => {
  emit('search', '')
}

// 切換模式
const switchMode = (newMode) => {
  mode.value = newMode
  
  if (newMode === 'trending' && !store.trendingTopics.length) {
    loadTrending()
  }
}
</script>

<style scoped>
.topic-selector {
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-lg);
}

.mode-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tab {
  flex: 1;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: var(--bg-card-hover);
}

.tab.active {
  background: var(--primary-glow);
  border-color: var(--primary);
  color: var(--primary);
}

.trending-section,
.custom-section {
  margin-bottom: var(--spacing-lg);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.loading-icon {
  animation: pulse 1s infinite;
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.topic-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.topic-chip:hover {
  background: var(--bg-card-hover);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.topic-chip.selected {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--bg-dark);
}

.refresh-btn {
  width: auto;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 12px;
  margin: 0 auto;
  display: block;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.refresh-btn:hover {
  opacity: 1;
}

.input-wrapper {
  display: flex;
  gap: var(--spacing-sm);
}

.input-wrapper .input {
  flex: 1;
}

.search-btn {
  width: 48px;
  padding: 0;
}

.input-hint {
  margin-top: var(--spacing-sm);
  font-size: 12px;
  color: var(--text-muted);
}

.main-search-btn {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 16px;
  margin-bottom: var(--spacing-sm);
}

.main-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.random-btn {
  width: 100%;
  padding: var(--spacing-md);
}
</style>
