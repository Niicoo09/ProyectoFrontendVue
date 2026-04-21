<template>
  <div class="equipment-dashboard animate-fade-in">
    <div class="cards-grid mt-4">
      <router-link to="/equipos/inversores" class="eq-card glass-panel group">
        <div class="icon-wrapper">
          <ZapIcon :size="32" class="text-accent" />
        </div>
        <div class="card-content">
          <h2>Inversores</h2>
          <p class="text-muted">Gestiona inversores solares</p>
        </div>
        <div class="arrow-wrapper">
          <ArrowRightIcon :size="20" class="text-muted group-hover:text-primary transition-colors" />
        </div>
      </router-link>

      <router-link to="/equipos/baterias" class="eq-card glass-panel group">
        <div class="icon-wrapper">
          <BatteryIcon :size="32" class="text-accent" />
        </div>
        <div class="card-content">
          <h2>Baterías</h2>
          <p class="text-muted">Gestiona sistemas de almacenamiento</p>
        </div>
        <div class="arrow-wrapper">
          <ArrowRightIcon :size="20" class="text-muted group-hover:text-primary transition-colors" />
        </div>
      </router-link>

      <router-link to="/equipos/modulos" class="eq-card glass-panel group">
        <div class="icon-wrapper">
          <SunIcon :size="32" class="text-accent" />
        </div>
        <div class="card-content">
          <h2>Módulos</h2>
          <p class="text-muted">Gestiona módulos fotovoltaicos</p>
        </div>
        <div class="arrow-wrapper">
          <ArrowRightIcon :size="20" class="text-muted group-hover:text-primary transition-colors" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ZapIcon, BatteryIcon, SunIcon, ArrowRightIcon } from 'lucide-vue-next';
</script>

<style scoped>
.equipment-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.content-header {
  padding: 2rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.eq-card {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-main);
  transition: all 0.2s ease;
  cursor: pointer;
}

.eq-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.icon-wrapper {
  background: rgba(99, 102, 241, 0.1); /* Primary color con opacidad */
  padding: 1rem;
  border-radius: 12px;
  margin-right: 1.5rem;
}

.card-content h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.arrow-wrapper {
  margin-left: auto;
}

/* Animations and Utilities */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.group:hover .group-hover\:text-primary {
  color: var(--color-primary);
}
.transition-colors {
  transition: color 0.2s ease;
}
</style>
