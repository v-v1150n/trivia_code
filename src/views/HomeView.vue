<template>
  <div class="home-view">
    <!-- Header -->
    <header class="header">
      <router-link to="/" class="header-link">
        <h1 class="logo">🧊 冷知識</h1>
      </router-link>
      <p class="tagline">探索有趣的世界</p>
    </header>

    <!-- 主內容區 -->
    <main class="main-content">
      <!-- 載入中 -->
      <div v-if="store.isLoading" class="loading-state">
        <div class="loading-content">
          <div v-if="loadingType === 'keyword'" class="search-anim-wrapper">
             <span class="search-icon-anim">🔍</span>
          </div>
          <div v-else class="cube-wrapper">
            <div class="cube"></div>
          </div>
          <p class="loading-text">{{ currentLoadingText }}</p>
          <div class="loading-progress"></div>
        </div>
      </div>

      <!-- 顯示卡片 -->
      <div v-else-if="store.currentKnowledge" class="card-container">
        <Transition name="card" mode="out-in">
          <KnowledgeCard 
            :key="store.currentKnowledge.id"
            :knowledge="store.currentKnowledge"
          />
        </Transition>
        
        <!-- 控制按鈕 -->
        <div class="card-controls">
          <button 
            v-if="store.hasPrev"
            class="btn btn-icon btn-secondary" 
            @click="store.prevKnowledge"
          >
            ⏮️
          </button>

          <button 
            v-if="store.hasNext"
            class="btn btn-icon btn-secondary" 
            @click="handleNext"
          >
            ⏭️
          </button>
          
          <button 
            class="btn btn-icon btn-favorite-control"
            :class="{ 'is-active': isCurrentFavorited }"
            @click="toggleCurrentFavorite"
          >
            {{ isCurrentFavorited ? '❤️' : '🤍' }}
          </button>

          <button class="btn btn-icon btn-primary" @click="showSelector = true">
            🔍
          </button>
        </div>
      </div>

      <!-- 選擇主題 -->
      <div v-else class="selector-container">
        <TopicSelector @search="handleSearch" />
      </div>
    </main>

    <!-- 底部導航 -->
    <nav class="bottom-nav">
      <router-link to="/explore" class="nav-item" :class="{ active: $route.path === '/explore' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">探索</span>
      </router-link>
      <router-link to="/favorites" class="nav-item" :class="{ active: $route.path === '/favorites' }">
        <span class="nav-icon">❤️</span>
        <span class="nav-label">收藏</span>
        <span v-if="store.favorites.length" class="nav-badge">{{ store.favorites.length }}</span>
      </router-link>
    </nav>

    <!-- 選擇器 Modal -->
    <Transition name="modal">
      <div v-if="showSelector" class="modal-overlay" @click.self="showSelector = false">
        <div class="modal-content">
          <button class="modal-close" @click="showSelector = false">✕</button>
          <TopicSelector @search="(k, t) => { handleSearch(k, t); showSelector = false; }" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'
import KnowledgeCard from '../components/KnowledgeCard.vue'
import TopicSelector from '../components/TopicSelector.vue'

const store = useKnowledgeStore()
const showSelector = ref(false)
const currentLoadingText = ref('正在探索冷知識...')
const loadingType = ref('trending')
let loadingInterval = null

// 是否收藏當前
const isCurrentFavorited = computed(() => {
  return store.currentKnowledge && store.isFavorite(store.currentKnowledge.id)
})

// 切換當前收藏
const toggleCurrentFavorite = () => {
  if (!store.currentKnowledge) return
  
  if (isCurrentFavorited.value) {
    store.removeFromFavorites(store.currentKnowledge.id)
  } else {
    store.addToFavorites(store.currentKnowledge)
  }
}

const loadingTexts = [
  '正在搜尋相關冷知識...',
  '正在挖掘有趣的資訊...',
  '正在翻閱知識寶庫...',
  '正在篩選最冷的知識...',
  '正在整理驚人事實...',
  '正在探索未知領域...',
  '馬上就好，請稍候...',
]

// 啟動載入動畫
const startLoadingAnimation = () => {
  let index = 0
  currentLoadingText.value = loadingTexts[0]
  loadingInterval = setInterval(() => {
    index = (index + 1) % loadingTexts.length
    currentLoadingText.value = loadingTexts[index]
  }, 2000)
}

// 停止載入動畫
const stopLoadingAnimation = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval)
    loadingInterval = null
  }
}

// 搜尋
const handleSearch = async (keywords, type = 'trending') => {
  loadingType.value = type
  startLoadingAnimation()
  try {
    store.knowledgeList = [] // 清空舊的
    await store.fetchKnowledge(keywords, 5) // 搜尋 5 則
  } finally {
    stopLoadingAnimation()
  }
}

// 下一則
const handleNext = () => {
  if (store.hasNext) {
    store.nextKnowledge()
  } else {
    // 沒有更多了，顯示選擇器
    showSelector.value = true
  }
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 70px; /* 底部導航高度 */
}

.header {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-md);
}

.logo {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.card-container {
  width: 100%;
  max-width: 400px;
}

.card-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn-favorite-control {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-favorite-control:active {
  transform: scale(0.9);
}

.btn-favorite-control.is-active {
  color: var(--accent-danger);
  border-color: var(--accent-danger);
  background: rgba(239, 68, 68, 0.1);
  animation: heartbeat 0.3s ease;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
}

.loading-content {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.cube-wrapper {
  perspective: 400px;
  margin-bottom: var(--spacing-xl);
}

.cube {
  width: 50px;
  height: 50px;
  background: var(--primary);
  transform-style: preserve-3d;
  animation: rotate 2s infinite linear;
  box-shadow: 0 0 20px var(--primary-glow);
}

.loading-text {
  color: var(--text-primary);
  font-size: 16px;
  min-height: 24px;
  margin-bottom: var(--spacing-md);
  font-weight: 500;
}

.loading-progress {
  width: 150px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto;
}

.loading-progress::after {
  content: '';
  display: block;
  width: 50%;
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  animation: slide 1.5s infinite ease-in-out;
}

@keyframes rotate {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.selector-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 底部導航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-sm) 0;
  padding-bottom: max(var(--spacing-sm), env(safe-area-inset-bottom));
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-sm);
  text-decoration: none;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
  position: relative;
}

.nav-item.active {
  color: var(--primary);
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 50%;
  transform: translateX(15px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--accent-danger);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-md);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  background: var(--bg-dark);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  background: var(--bg-card);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  z-index: 1;
}

/* 動畫 */
.card-enter-active,
.card-leave-active {
  transition: all 0.3s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.card-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Header Link */
.header-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}

.header-link:hover {
  opacity: 0.8;
}

/* Search Animation */
.search-anim-wrapper {
  font-size: 60px;
  animation: bounce 1s infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
</style>
