<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-card glass-panel" 
        :class="toast.type"
      >
        <div class="toast-icon">
          <CheckCircleIcon v-if="toast.type === 'success'" :size="20" />
          <AlertCircleIcon v-else-if="toast.type === 'error'" :size="20" />
          <InfoIcon v-else-if="toast.type === 'info'" :size="20" />
          <AlertTriangleIcon v-else :size="20" />
        </div>
        <div class="toast-content">
          {{ toast.message }}
        </div>
        <button @click="removeToast(toast.id)" class="toast-close">
          <XIcon :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../store/toastStore';
import { 
  CheckCircleIcon, AlertCircleIcon, InfoIcon, 
  AlertTriangleIcon, XIcon 
} from 'lucide-vue-next';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  flex-grow: 1;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
}

/* Tipos de Toast */
.success { border-left: 4px solid #10b981; }
.success .toast-icon { color: #10b981; }

.error { border-left: 4px solid #ef4444; }
.error .toast-icon { color: #ef4444; }

.info { border-left: 4px solid var(--primary); }
.info .toast-icon { color: var(--primary); }

.warning { border-left: 4px solid #f59e0b; }
.warning .toast-icon { color: #f59e0b; }

/* Animaciones de Transición */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
