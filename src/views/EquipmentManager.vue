<template>
  <div class="equipment-manager animate-fade-in">
    <div class="content-header flex items-center gap-4 mb-2">
      <button @click="$router.push('/equipos')" class="back-btn">
        <ArrowLeftIcon :size="24" />
      </button>
      <div class="header-info">
        <h1 class="capitalize">Gestión de {{ currentTypeString }}</h1>
        <div class="progress-container mt-2">
          <div class="progress-bar" style="width: 100%"></div>
        </div>
      </div>
    </div>

    <div class="fields-grid-container glass-panel">
      <div class="groups-container">
        
        <!-- FORMULARIO NUEVO/EDITAR -->
        <div class="field-group-container">
          <div class="group-header">
            <span class="group-title flex items-center gap-2">
              <PlusIcon v-if="!isEditing" :size="18" class="text-accent" />
              <EditIcon v-else :size="18" class="text-accent" />
              {{ isEditing ? 'EDITAR EQUIPO' : 'NUEVO EQUIPO' }}
            </span>
          </div>

          <form @submit.prevent="saveEquipment" class="dynamic-form mt-4">
            <div class="fields-grid">
              <div v-for="field in currentConfig" :key="field.key" class="field-group">
                <label :for="field.key" class="field-label">{{ field.label }}</label>
                
                <select 
                  v-if="field.type === 'select'"
                  :id="field.key"
                  v-model="formData[field.key]"
                  class="form-select"
                  required
                >
                  <option value="" disabled selected>Selecciona {{ field.label }}</option>
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>

                <input 
                  v-else
                  :type="field.type"
                  :id="field.key"
                  v-model="formData[field.key]"
                  class="form-input"
                  :placeholder="`Ej. ${field.placeholder || ''}`"
                  :step="field.type === 'number' ? 'any' : null"
                  required
                />
              </div>
            </div>

            <div class="form-actions mt-6 flex gap-4">
              <button type="submit" class="btn-primary flex items-center justify-center gap-2" style="flex: 2" :disabled="isSaving">
                <SaveIcon v-if="!isSaving" :size="18" />
                <Loader2Icon v-else :size="18" class="animate-spin" />
                {{ isSaving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" @click="resetForm" class="btn-outline flex items-center justify-center gap-2" style="flex: 1">
                <XIcon :size="18" /> Limpiar
              </button>
            </div>
          </form>
        </div>

        <div class="divider my-4" style="height: 1px; background: var(--surface-border);"></div>

        <!-- LISTADO DE EQUIPOS -->
        <div class="field-group-container">
          <div class="group-header">
            <span class="group-title flex items-center gap-2">
              <DatabaseIcon :size="18" class="text-primary" />
              {{ currentTypeString }} REGISTRADOS ({{ equipmentList.length }})
            </span>
          </div>

          <div v-if="isLoading" class="loading-state flex flex-col items-center p-8 mt-4">
            <Loader2Icon :size="32" class="animate-spin text-primary mb-4" />
            <p>Cargando equipos...</p>
          </div>

          <div v-else-if="equipmentList.length === 0" class="empty-state p-8 text-center text-muted mt-4">
            No hay equipos registrados de este tipo.
          </div>

          <div v-else class="cards-grid mt-4">
            <div v-for="item in equipmentList" :key="item.id || item.marcaModelo || item.marca" class="eq-card">
              <div class="card-header">
                <h3>{{ item.nombre || item.marcaModelo || item.marca || 'Sin nombre' }}</h3>
                <span class="badge">{{ equipmentType }}</span>
              </div>
              
              <div class="card-body">
                <div v-for="field in currentConfig" :key="field.key" class="data-row">
                  <span class="data-label">{{ field.label }}:</span>
                  <span class="data-value">{{ item[field.key] || '-' }}</span>
                </div>
              </div>

              <div class="card-footer">
                <button @click="editEquipment(item)" class="btn-sm btn-edit">
                  <Edit2Icon :size="14" /> Editar
                </button>
                <button @click="deleteEquipment(item)" class="btn-sm btn-danger">
                  <TrashIcon :size="14" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeftIcon, PlusIcon, EditIcon, SaveIcon, XIcon, DatabaseIcon, Edit2Icon, TrashIcon, Loader2Icon } from 'lucide-vue-next';
import { equipmentService } from '../api/equipmentService';
import { useToast } from '../store/toastStore';

const toast = useToast();

const route = useRoute();
const router = useRouter();

const equipmentType = computed(() => route.params.type);
const currentTypeString = computed(() => {
  if (equipmentType.value === 'inversores') return 'Inversores';
  if (equipmentType.value === 'baterias') return 'Baterías';
  if (equipmentType.value === 'modulos') return 'Módulos';
  return 'Equipos';
});

// -- CONFIGURACIÓN DE CAMPOS --
const CONFIG_MAP = {
  inversores: [
    { key: 'marcaModelo', label: 'Marca y Modelo', type: 'text', placeholder: 'Huawei SUN2000' },
    { key: 'potencia', label: 'Potencia', type: 'text', placeholder: '5' },
    { key: 'vccMaxima', label: 'Vcc Máxima', type: 'text', placeholder: '1000' },
    { key: 'vccMinima', label: 'Vcc Mínima', type: 'text', placeholder: '140' },
    { key: 'conexion', label: 'Conexión', type: 'select', options: ['Monofásica', 'Trifásica'] },
    { key: 'relacionTension', label: 'Relación Tensión', type: 'text', placeholder: '230V/400V' }
  ],
  baterias: [
    { key: 'marcaModelo', label: 'Marca Modelo', type: 'text', placeholder: 'Luna2000-5-S0' },
    { key: 'tipoBateria', label: 'Tipo Batería', type: 'text', placeholder: 'Litio' },
    { key: 'tensionNominal', label: 'Tensión Nominal', type: 'text', placeholder: '360' },
    { key: 'profundidadDescarga', label: 'Profundidad Descarga', type: 'text', placeholder: '100%' },
    { key: 'tensionMaxima', label: 'Tensión Máxima', type: 'text', placeholder: '450' },
    { key: 'tensionMinima', label: 'Tensión Mínima', type: 'text', placeholder: '300' },
    { key: 'energiaTotal', label: 'Energía Total', type: 'text', placeholder: '5.0' },
    { key: 'potenciaMaxima', label: 'Potencia Máxima', type: 'text', placeholder: '2.5' },
    { key: 'maximoPicoPotencia', label: 'Máximo Pico Potencia', type: 'text', placeholder: '3.5' }
  ],
  modulos: [
    { key: 'marca', label: 'Marca y Modelo', type: 'text', placeholder: 'Jinko Solar 450W' },
    { key: 'potenciaPicoModulo', label: 'Potencia Pico (Wp)', type: 'text', placeholder: '450' },
    { key: 'intensidadIpmp', label: 'Intensidad Máxima (Ipmp)', type: 'text', placeholder: '10.51' },
    { key: 'ramasEnParalelo', label: 'Nº Ramas en Paralelo', type: 'text', placeholder: '1' }
  ]
};

const currentConfig = computed(() => CONFIG_MAP[equipmentType.value] || []);

// -- ESTADO ESTADO --
const equipmentList = ref([]);
const formData = ref({});
const isEditing = ref(false);
const editingId = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);

// -- MÉTODOS --
const fetchEquipments = async () => {
  isLoading.value = true;
  try {
    const data = await equipmentService.getByType(equipmentType.value);
    equipmentList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching equipments', error);
    // Fallback gestionado en service, opcionalmente mostramos toast
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.value = {};
  isEditing.value = false;
  editingId.value = null;
};

const editEquipment = (item) => {
  // Asegurar que al cargar, todo lo que parezca un número con punto se vea con coma
  const cleanedItem = { ...item };
  Object.keys(cleanedItem).forEach(key => {
    if (typeof cleanedItem[key] === 'string' && /^\d+\.\d+$/.test(cleanedItem[key])) {
      cleanedItem[key] = cleanedItem[key].replace('.', ',');
    } else if (typeof cleanedItem[key] === 'number') {
      cleanedItem[key] = cleanedItem[key].toString().replace('.', ',');
    }
  });

  formData.value = cleanedItem;
  isEditing.value = true;
  editingId.value = item.id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteEquipment = async (item) => {
  if (!confirm(`¿Estás seguro de eliminar ${item.marcaModelo || item.marca}?`)) return;
  
  try {
    await equipmentService.remove(equipmentType.value, item.id);
    toast.success('Equipo eliminado correctamente');
    fetchEquipments();
  } catch (error) {
    toast.error('No se pudo eliminar el equipo. Asegúrate de que el Backend lo soporta.');
  }
};

const saveEquipment = async () => {
  isSaving.value = true;
  try {
    // Limpieza final: asegurar que si hay algún punto se guarde como coma
    const dataToSave = { ...formData.value };
    Object.keys(dataToSave).forEach(key => {
      if (typeof dataToSave[key] === 'string') {
        // Solo reemplazamos si parece un formato numérico (para no romper IDs o nombres)
        if (/^\d+\.\d+$/.test(dataToSave[key]) || /^\d+$/.test(dataToSave[key])) {
           // Si es un número puro o con punto, lo dejamos con coma si es necesario
           // Pero el usuario quiere COMAS, así que:
           dataToSave[key] = dataToSave[key].replace('.', ',');
        }
      }
    });

    if (isEditing.value && editingId.value) {
      await equipmentService.update(equipmentType.value, editingId.value, dataToSave);
      toast.success('Equipo actualizado correctamente');
    } else {
      await equipmentService.create(equipmentType.value, dataToSave);
      toast.success('Equipo creado correctamente');
    }
    resetForm();
    fetchEquipments();
  } catch (error) {
    toast.error('Error al guardar. Asegúrate de que el Backend tiene los endpoints implementados.');
  } finally {
    isSaving.value = false;
  }
};

watch(() => route.params.type, (newType) => {
  if (newType) {
    resetForm();
    fetchEquipments();
  }
});

onMounted(() => {
  if (!CONFIG_MAP[equipmentType.value]) {
    router.push('/equipos');
    return;
  }
  fetchEquipments();
});
</script>

<style scoped>
.equipment-manager {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.content-header {
  padding: 0 1.75rem;
}

.header-info { flex-grow: 1; }
.header-info h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
.progress-container { height: 6px; background: var(--hover-subtle); border-radius: 3px; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width 0.5s ease; }

.back-btn {
  background: var(--hover-subtle);
  border: 1px solid var(--surface-border);
  padding: 0.75rem;
  border-radius: 12px;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover {
  background: var(--hover-strong);
  border-color: var(--primary);
  color: var(--primary);
}

.fields-grid-container {
  padding: 1.75rem;
  width: 100%;
  box-sizing: border-box;
}

.groups-container { display: flex; flex-direction: column; gap: 1.25rem; }
.field-group-container { display: flex; flex-direction: column; gap: 0.75rem; }

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: var(--hover-subtle);
  border-radius: 0.75rem;
  border: 1px solid var(--surface-border);
  cursor: default;
}
.group-title { font-size: 0.9rem; font-weight: 600; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }

.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .fields-grid { grid-template-columns: 1fr; }
}

.field-group { display: flex; flex-direction: column; gap: 0; }

.field-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.2rem;
  margin-bottom: 0.2rem;
}

.form-input, .form-select {
  padding: 0.6rem 0.8rem;
  background: var(--hover-subtle);
  border: 1px solid var(--surface-border);
  border-radius: 0.6rem;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus { outline: none; border-color: var(--primary); background: var(--hover-strong); box-shadow: 0 0 0 3px var(--primary-glow); }
.form-select option { background: var(--bg-dark); color: var(--text-main); }

.form-actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 1.5rem;
  width: 100%;
}

.btn-primary, .btn-outline {
  flex: 1;
  padding: 0.8rem;
  border-radius: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  box-shadow: 0 4px 12px 0 var(--primary-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px 0 var(--primary-glow);
}

.btn-outline {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--surface-border);
}

.btn-outline:hover {
  background: var(--hover-strong);
  border-color: var(--text-muted);
}

/* CARDS GRID */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.eq-card {
  background: var(--hover-subtle);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}

.eq-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.badge {
  background: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.data-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.data-label {
  color: var(--text-muted);
}

.data-value {
  font-weight: 500;
  color: var(--text-main);
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
}

.card-footer {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid var(--surface-border);
  padding-top: 1rem;
}

.btn-sm {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-edit {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.btn-edit:hover {
  background: rgba(99, 102, 241, 0.2);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
