<template>
  <div class="autocomplete-container" ref="containerRef">
    <div class="input-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @focus="showDropdown = true"
        @input="onInput"
        :placeholder="placeholder"
        class="form-input"
      />
      <div v-if="searchQuery" @click="clearSearch" class="clear-btn">
        <XIcon :size="16" />
      </div>
      <SearchIcon class="search-icon" :size="18" />
    </div>

    <Transition name="fade-slide">
      <div v-if="showDropdown" class="dropdown glass-panel">
        
        <div v-if="isLoading" class="dropdown-item loading-item">
           <Loader2Icon class="spinner" :size="20"/> <span>Cargando BD...</span>
        </div>
        
        <template v-else-if="filteredResults.length > 0">
          <div
            v-for="item in filteredResults"
            :key="item.id"
            class="dropdown-item"
            @click="selectItem(item)"
          >
            <div class="item-label">{{ item.label }}</div>
            <div class="item-brand">{{ item.marca || item.marcaModelo }}</div>
          </div>
        </template>
        
        <div v-else class="dropdown-item text-muted text-sm text-center">
          <p>Sin resultados en BD</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { SearchIcon, XIcon, Loader2Icon } from 'lucide-vue-next';
import { equipmentData } from '../config/equipmentData';
import { equipmentService } from '../api/equipmentService';

const props = defineProps({
  modelValue: String,
  equipmentType: {
    type: String,
    required: true, // 'modulos', 'inversores', 'baterias'
  },
  placeholder: String,
});

const emit = defineEmits(['update:modelValue', 'select']);

const searchQuery = ref(props.modelValue || '');
const showDropdown = ref(false);
const containerRef = ref(null);

// Inicia con datos estáticos como fallback, pero los reemplaza si el Backend responde
const dbEquipmentList = ref(equipmentData[props.equipmentType] || []);
const isLoading = ref(false);

const loadEquipmentFromDB = async () => {
  isLoading.value = true;
  try {
    const list = await equipmentService.getByType(props.equipmentType);
    if (list && Array.isArray(list) && list.length > 0) {
      dbEquipmentList.value = list;
    }
  } catch (error) {
    // Falla silenciada porque dbEquipmentList mantiene el default equipmentData estático
  } finally {
    isLoading.value = false;
  }
};

const filteredResults = computed(() => {
  const data = dbEquipmentList.value;
  if (!searchQuery.value) return data;
  
  const query = searchQuery.value.toLowerCase();
  return data.filter(item => 
    item.label?.toLowerCase().includes(query) || 
    (item.marca && item.marca.toLowerCase().includes(query)) ||
    (item.marcaModelo && item.marcaModelo.toLowerCase().includes(query))
  );
});

const onInput = () => {
  emit('update:modelValue', searchQuery.value);
  showDropdown.value = true;
};

const selectItem = (item) => {
  searchQuery.value = item.label;
  showDropdown.value = false;
  emit('update:modelValue', item.label);
  emit('select', item);
};

const clearSearch = () => {
  searchQuery.value = '';
  showDropdown.value = false;
  emit('update:modelValue', '');
  emit('select', null);
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadEquipmentFromDB(); // Trigger background load from Backend Action!
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.autocomplete-container {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-border);
  border-radius: 0.75rem;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.search-icon {
  position: absolute;
  right: 1rem;
  color: var(--text-muted);
  pointer-events: none;
}

.clear-btn {
  position: absolute;
  right: 3rem;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  padding: 0.5rem;
  border-radius: 1rem;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.item-label {
  font-weight: 500;
  color: var(--text-main);
  font-size: 0.9rem;
}

.item-brand {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
