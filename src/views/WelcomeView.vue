<template>
  <div class="welcome-view">
    <div class="content">
      <div class="logo-container">
        <span class="logo-icon">🧊</span>
        <h1 class="logo-text">冷知識</h1>
      </div>
      <p class="tagline">探索世界的有趣角落</p>
      <p class="description">每天來點不一樣的，讓你的對話更有料！</p>
      
      <div class="actions">
        <router-link to="/explore" class="btn btn-primary btn-lg pulse-animation">
          🚀 開始探索
        </router-link>
        <router-link to="/favorites" class="btn btn-secondary btn-lg">
          ❤️ 我的收藏檢查
        </router-link>
      </div>
    </div>

    <!-- 背景裝飾 -->
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  </div>
</template>

<style scoped>
.welcome-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at top right, #1e293b, #0f172a);
}

.content {
  text-align: center;
  z-index: 10;
  max-width: 400px;
  width: 100%;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.logo-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-xs);
  animation: float 6s ease-in-out infinite;
}

.logo-text {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.tagline {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.description {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.btn-lg {
  padding: var(--spacing-md);
  font-size: 18px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.pulse-animation {
  animation: pulse-shadow 2s infinite;
}

/* 背景動畫 */
.background-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 10s infinite ease-in-out;
  /* 效能優化 */
  transform: translateZ(0);
  will-change: transform;
  contain: layout style paint;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: var(--primary);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: var(--accent-secondary);
  bottom: -50px;
  left: -50px;
  animation-delay: -3s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: purple;
  top: 40%;
  left: 30%;
  opacity: 0.2;
  animation-delay: -6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-shadow {
  0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(14, 165, 233, 0); }
  100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
}
</style>
