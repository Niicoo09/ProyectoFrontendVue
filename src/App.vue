<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside v-if="$route.path === '/'" class="sidebar glass-panel">
      <div class="logo">
        <h1 class="gradient-text">Solay</h1>
        <span class="sub-logo">Docs API</span>
      </div>
      
      <nav class="navigation">
        <router-link to="/" class="nav-item" active-class="active">
          <LayoutDashboardIcon :size="20" />
          <span>Dashboard</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="divider"></div>
        <p>© 2026 Solay Fotovoltaica</p>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="top-header animate-fade-in" v-if="$route.path === '/'">
        <div class="header-left">
          <h2>Panel de Control</h2>
          <p class="text-muted">Gestiona y descarga la documentación técnica de tus clientes.</p>
        </div>
        <div class="header-right">
          <div class="status-badge">
            <div class="status-dot"></div>
            API Online
          </div>
        </div>
      </header>

      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { LayoutDashboardIcon } from 'lucide-vue-next';
</script>

<style scoped>
.app-container {
  display: flex;
  padding: 1.5rem;
  gap: 2rem;
  min-height: 100vh;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.sidebar {
  width: 280px;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 1.5rem;
  height: calc(100vh - 3rem);
  flex-shrink: 0;
}

.logo {
  margin-bottom: 4rem;
  text-align: center;
}

.logo h1 {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.sub-logo {
  font-size: 0.875rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.navigation {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.nav-item:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.03);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
  color: var(--primary);
  box-shadow: inset 4px 0 0 -2px var(--primary);
}

.sidebar-footer {
  margin-top: auto;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.divider {
  height: 1px;
  background: var(--surface-border);
  margin-bottom: 1.5rem;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1rem;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.status-badge {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1024px) {
  .app-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
  }
}
</style>
