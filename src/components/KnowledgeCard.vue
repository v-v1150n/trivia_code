<template>
  <div class="knowledge-card">
    <!-- 卡片頂部 -->
    <div class="card-header">
      <span class="card-category">{{ knowledge.category }}</span>
      <button 
        class="btn-favorite"
        :class="{ 'is-favorited': isFavorited }"
        @click.stop="toggleFavorite"
      >
        {{ isFavorited ? '❤️' : '🤍' }}
      </button>
    </div>

    <!-- 標題 -->
    <h2 class="card-title">🧊 {{ knowledge.title }}</h2>

    <!-- 冷知識內容 -->
    <div class="card-section">
      <p class="card-content">{{ knowledge.content }}</p>
    </div>

    <!-- 為什麼有趣 -->
    <div class="card-section">
      <h3 class="section-title">✨ 為什麼超有趣</h3>
      <p class="section-content">{{ knowledge.whyInteresting }}</p>
    </div>

    <!-- 破冰話術 -->
    <div class="card-section highlight">
      <h3 class="section-title">💬 破冰話術</h3>
      <p class="section-content quote">「{{ knowledge.icebreaker }}」</p>
    </div>

    <!-- 考考朋友 -->
    <div class="card-section">
      <h3 class="section-title">🤔 考考朋友</h3>
      <p class="section-content">{{ knowledge.quiz }}</p>
    </div>

    <!-- 來源 -->
    <div class="card-footer">
      <span class="source-label">📚 來源：</span>
      <a 
        v-if="knowledge.sourceUrl" 
        :href="knowledge.sourceUrl" 
        target="_blank" 
        rel="noopener"
        class="source-link"
        @click.stop
      >
        {{ knowledge.sourceName }}
      </a>
      <span v-else class="source-name">{{ knowledge.sourceName }}</span>
    </div>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKnowledgeStore } from '../stores/knowledge'

const props = defineProps({
  knowledge: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([])

const store = useKnowledgeStore()

// 是否已收藏
const isFavorited = computed(() => store.isFavorite(props.knowledge.id))

// 切換收藏
const toggleFavorite = () => {
  if (isFavorited.value) {
    store.removeFromFavorites(props.knowledge.id)
  } else {
    store.addToFavorites(props.knowledge)
  }
}
</script>

<style scoped>
.knowledge-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: grab;
  user-select: none;
  overflow: hidden;
}

.knowledge-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
}

.knowledge-card.is-swiping {
  cursor: grabbing;
}

.knowledge-card.swipe-left {
  box-shadow: -10px 0 30px rgba(239, 68, 68, 0.3);
}

.knowledge-card.swipe-right {
  box-shadow: 10px 0 30px rgba(16, 185, 129, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.card-category {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-glow);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--primary);
}

.btn-favorite {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.btn-favorite:hover {
  transform: scale(1.2);
}

.btn-favorite.is-favorited {
  animation: heartbeat 0.3s ease;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.card-section {
  margin-bottom: var(--spacing-md);
}

.card-section.highlight {
  padding: var(--spacing-md);
  background: rgba(0, 212, 255, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.section-content {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
}

.section-content.quote {
  font-style: italic;
  color: var(--primary-light);
}

.card-content {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-primary);
}

.card-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
}

.source-label {
  color: var(--text-muted);
}

.source-link {
  color: var(--primary);
  text-decoration: none;
}

.source-link:hover {
  text-decoration: underline;
}

.source-name {
  color: var(--text-secondary);
}

.swipe-hints {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-sm);
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.6;
}

.knowledge-card.swipe-left .hint-left,
.knowledge-card.swipe-right .hint-right {
  opacity: 1;
  color: var(--primary);
}
</style>
