<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content glass-panel animate-scale">
        <!-- Cabecera del Modal -->
        <div class="modal-header">
          <div class="title-info">
            <div class="icon-orb">
              <EyeIcon :size="20" class="text-accent" />
            </div>
            <div class="text-meta">
              <h4>Previsualización de Documento</h4>
              <p class="text-muted">{{ fileName }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button @click="$emit('download')" class="btn-action-primary" title="Descargar este archivo">
              <DownloadIcon :size="18" />
              <span>Descargar ahora</span>
            </button>
            <div class="v-divider"></div>
            <button @click="$emit('close')" class="btn-close-circle">
              <XIcon :size="20" />
            </button>
          </div>
        </div>

        <!-- Cuerpo del Modal (Visor PDF) -->
        <div class="modal-body">
          <div v-if="!pdfUrl" class="loading-overlay">
            <Loader2Icon class="spinner" :size="48" />
            <p>Generando vista previa de alta calidad...</p>
          </div>
          <iframe 
            v-else 
            :src="`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`" 
            class="pdf-frame"
          ></iframe>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { XIcon, EyeIcon, DownloadIcon, Loader2Icon } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  pdfUrl: String,
  fileName: String
});

defineEmits(['close', 'download']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.95);
  backdrop-filter: blur(10px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-content {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
}

.modal-header {
  padding: 1rem 2rem;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid var(--surface-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-info {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.icon-orb {
  width: 40px;
  height: 40px;
  background: rgba(34, 211, 238, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(34, 211, 238, 0.2);
}

.text-meta h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.text-meta p {
  font-size: 0.8rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.btn-action-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-action-primary:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.v-divider {
  width: 1px;
  height: 24px;
  background: var(--surface-border);
}

.btn-close-circle {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-border);
  color: var(--text-muted);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-circle:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.modal-body {
  flex: 1;
  position: relative;
  background: #1e1e1e;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  color: white;
  background: #0f172a;
}

.animate-scale {
  animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
