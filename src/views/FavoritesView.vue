<template>
  <div class="favorites-view">
    <!-- Header -->
    <header class="header">
      <h1 class="title">❤️ 我的收藏</h1>
      <p class="count" v-if="store.favorites.length">
        {{ store.favorites.length }} 則冷知識
      </p>
    </header>

    <!-- 收藏列表 -->
    <main class="main-content">
      <div v-if="store.favorites.length" class="favorites-list">
        <div 
          v-for="item in store.favorites" 
          :key="item.id" 
          class="favorite-item"
        >
          <div class="item-header">
            <span class="item-category">{{ item.category }}</span>
            <button class="btn-remove" @click="removeFavorite(item.id)">
              🗑️
            </button>
          </div>
          
          <h3 class="item-title">🧊 {{ item.title }}</h3>
          <p class="item-content">{{ item.content }}</p>
          
          <div class="item-footer">
            <span class="saved-date">
              {{ formatDate(item.savedAt) }}
            </span>
            <button class="btn btn-secondary btn-sm" @click="copyIcebreaker(item)">
              📋 複製破冰話術
            </button>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <span class="empty-icon">💔</span>
        <h2>還沒有收藏</h2>
        <p>右滑卡片或點擊愛心即可收藏冷知識</p>
        <router-link to="/" class="btn btn-primary">
          🧊 去探索冷知識
        </router-link>
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

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'

const store = useKnowledgeStore()

const showToast = ref(false)
const toastMessage = ref('')

// 移除收藏
const removeFavorite = (id) => {
  store.removeFromFavorites(id)
  showToastMessage('已從收藏移除')
}

// 複製破冰話術
const copyIcebreaker = async (item) => {
  try {
    await navigator.clipboard.writeText(item.icebreaker)
    showToastMessage('已複製到剪貼簿！')
  } catch (err) {
    showToastMessage('複製失敗')
  }
}

// 顯示 Toast
const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.favorites-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 70px;
}

.header {
  padding: var(--spacing-lg) var(--spacing-md);
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.count {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.main-content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 500px;
  margin: 0 auto;
}

.favorite-item {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.item-category {
  font-size: 12px;
  color: var(--primary);
  background: var(--primary-glow);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
}

.btn-remove {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.btn-remove:hover {
  opacity: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.item-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.saved-date {
  font-size: 12px;
  color: var(--text-muted);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 12px;
}

/* 空狀態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}

.empty-state h2 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
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

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 14px;
  color: var(--text-primary);
  z-index: 200;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
