<template>
  <div class="home-view">
    <!-- Header -->
    <header class="header">
      <h1 class="logo">🧊 冷知識</h1>
      <p class="tagline">探索有趣的世界</p>
    </header>

    <!-- 主內容區 -->
    <main class="main-content">
      <!-- 顯示卡片 -->
      <div v-if="store.currentKnowledge" class="card-container">
        <Transition name="card" mode="out-in">
          <KnowledgeCard 
            :key="store.currentKnowledge.id"
            :knowledge="store.currentKnowledge"
            @swipe-left="handleNext"
            @swipe-right="handleNext"
          />
        </Transition>
        
        <!-- 控制按鈕 -->
        <div class="card-controls">
          <button class="btn btn-icon btn-secondary" @click="handleNext" :disabled="!store.hasNext">
            ⏭️
          </button>
          <button class="btn btn-icon btn-primary" @click="showSelector = true">
            🔍
          </button>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-else-if="store.isLoading" class="loading-state">
        <div class="loading-spinner">🧊</div>
        <p>正在探索冷知識...</p>
      </div>

      <!-- 選擇主題 -->
      <div v-else class="selector-container">
        <TopicSelector @search="handleSearch" />
      </div>
    </main>

    <!-- 底部導航 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首頁</span>
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
          <TopicSelector @search="(k) => { handleSearch(k); showSelector = false; }" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'
import KnowledgeCard from '../components/KnowledgeCard.vue'
import TopicSelector from '../components/TopicSelector.vue'

const store = useKnowledgeStore()
const showSelector = ref(false)

// 搜尋
const handleSearch = async (keywords) => {
  await store.fetchKnowledge(keywords, 1)
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
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.loading-state {
  text-align: center;
  color: var(--text-secondary);
}

.loading-spinner {
  font-size: 48px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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
</style>
