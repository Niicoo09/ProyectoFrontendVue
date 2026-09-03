<template>
  <div class="master-form-container animate-fade-in">
    <!-- Sidebar Navigation -->
    <aside class="form-sidebar glass-panel">
      <div class="sidebar-header">
        <div class="logo-placeholder">
          <ZapIcon class="text-primary" :size="24" />
        </div>
        <h2 class="gradient-text">Formulario Maestro</h2>
      </div>

      <nav class="sidebar-nav">
        <button 
          v-for="section in sections" 
          :key="section.id"
          class="nav-item"
          :class="{ active: currentSection === section.id }"
          @click="currentSection = section.id"
        >
          <component :is="section.icon" :size="18" />
          <span>{{ section.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button @click="saveForm" class="btn-primary w-full">
          <SaveIcon :size="18" />
          Guardar Datos
        </button>
        <button @click="$router.push('/')" class="btn-outline w-full mt-2">
          <ArrowLeftIcon :size="18" />
          Volver al Panel
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="form-content">
      <header class="content-header glass-panel">
        <div class="header-info">
          <h1>{{ activeSectionLabel }} <span v-if="route.params.id" class="text-accent text-sm ml-4">(Modo Edición)</span></h1>
          <p class="text-muted">Completa los datos técnicos y administrativos para la generación de documentos.</p>
        </div>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </header>

      <div v-if="isLoading" class="fields-grid-container glass-panel animate-fade-in flex flex-col gap-6 p-8">
        <div class="skeleton" style="width: 200px; height: 28px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="width: 100%; height: 60px; border-radius: 12px;"></div>
        <div class="grid grid-cols-2 gap-5 mt-4">
          <div v-for="i in 8" :key="'form-skel-'+i" class="flex flex-col gap-2">
            <div class="skeleton" style="width: 30%; height: 14px;"></div>
            <div class="skeleton" style="width: 100%; height: 42px; border-radius: 8px;"></div>
          </div>
        </div>
      </div>

      <div v-else class="fields-grid-container glass-panel">
        <div class="groups-container">
          <div 
            v-for="(groupFields, groupName) in groupedCurrentFields" 
            :key="groupName"
            class="field-group-container"
          >
            <!-- Header for collapsible group -->
            <div 
              v-if="groupName !== '__sin-grupo__'" 
              class="group-header" 
              @click="toggleGroup(groupName)"
            >
              <h3 class="group-title">{{ groupName }}</h3>
              <ChevronDownIcon 
                :size="20" 
                :class="{ 'rotate-180': expandedGroups[groupName] }" 
                class="transition-transform group-icon text-muted" 
              />
            </div>

            <!-- Fields Grid for this group -->
            <transition name="fade-slide">
              <div 
                v-show="groupName === '__sin-grupo__' || expandedGroups[groupName]" 
                class="fields-grid"
              >
              <div 
                v-for="field in groupFields" 
                :key="field.name"
                class="field-group"
                :class="{ 'full-width': field.fullWidth }"
                v-show="field.type !== 'hidden'"
              >
                <label v-if="field.type !== 'checkbox'" :for="field.name" class="field-label">
                  {{ field.label }}
                  <span v-if="field.description" class="field-desc">({{ field.description }})</span>
                </label>

                <!-- Text / Number / Tel / Email / Date Inputs -->
                <div v-if="['text', 'number', 'tel', 'email', 'date'].includes(field.type)" class="flex flex-col relative">
                  <input 
                    :type="field.type"
                    :id="field.name"
                    v-model="formData[field.name]"
                    :placeholder="field.placeholder"
                    class="form-input"
                    :class="{ 'invalid-input': validationErrors[field.name] }"
                  />
                  <span v-if="validationErrors[field.name]" class="text-[#ef4444] text-[0.7rem] font-medium absolute -bottom-4">{{ validationErrors[field.name] }}</span>
                  
                  <!-- Desglose de Calculadora PEM -->
                  <div v-if="field.name === 'pemCalculoPresupuestoTotal' && formData.pemCalculoPresupuestoTotal" class="pem-breakdown-card glass-panel mt-4 animate-fade-in">
                    <h4 class="pem-breakdown-title">Aclaración del Presupuesto (PEM)</h4>
                    <div class="pem-breakdown-table">
                      <div class="pem-row main-pem">
                        <span class="pem-label">P.E.M. Final (Valor de Entrada)</span>
                        <span class="pem-value">{{ formData.pemCalculoPem }} €</span>
                      </div>
                      <div class="pem-divider"></div>
                      <div class="pem-row">
                        <span class="pem-label">Gastos Generales (13%)</span>
                        <span class="pem-value">{{ formData.pemCalculoGastosGenerales }} €</span>
                      </div>
                      <div class="pem-row">
                        <span class="pem-label">Beneficio Industrial (6%)</span>
                        <span class="pem-value">{{ formData.pemCalculoBeneficioIndustrial }} €</span>
                      </div>
                      <div class="pem-row">
                        <span class="pem-label">PEC (Base Imponible)</span>
                        <span class="pem-value">{{ formData.pemCalculoPec }} €</span>
                      </div>
                      <div class="pem-row">
                        <span class="pem-label">IVA (21%)</span>
                        <span class="pem-value">{{ formData.pemCalculoIva }} €</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Textarea -->
                <textarea 
                  v-else-if="field.type === 'textarea'"
                  :id="field.name"
                  v-model="formData[field.name]"
                  :placeholder="field.placeholder"
                  :rows="field.rows || 3"
                  class="form-input"
                ></textarea>

                <!-- Select Inputs -->
                <select 
                  v-else-if="field.type === 'select'"
                  :id="field.name"
                  v-model="formData[field.name]"
                  class="form-select"
                >
                  <option value="" disabled selected>{{ field.placeholder || 'Selecciona una opción...' }}</option>
                  <option 
                    v-for="opt in field.options" 
                    :key="typeof opt === 'string' ? opt : opt.value || opt.label"
                    :value="typeof opt === 'string' ? opt : opt.value"
                  >
                    {{ typeof opt === 'string' ? opt : opt.label }}
                  </option>
                </select>

                <!-- Checkbox -->
                <div v-else-if="field.type === 'checkbox'" class="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    :id="field.name" 
                    v-model="formData[field.name]"
                    class="form-checkbox"
                  />
                  <label :for="field.name" class="checkbox-label">{{ field.label }}</label>
                </div>

                <!-- File Upload with Canvas Preview -->
                <div v-else-if="field.type === 'file'" class="file-upload-wrapper">
                  <input 
                    type="file" 
                    :id="field.name" 
                    @change="handleFileUpload($event, field.name)"
                    :accept="field.accept"
                    class="hidden-file-input"
                  />
                  <label :for="field.name" 
                         class="file-dropzone" 
                         :class="{ 'has-file': formData[field.name], 'drag-over': dragOverField === field.name }"
                         @dragover.prevent="dragOverField = field.name"
                         @dragleave.prevent="dragOverField = null"
                         @drop.prevent="onDrop($event, field.name)">
                    <div v-if="!formData[field.name]" class="dropzone-empty">
                      <UploadIcon :size="24" />
                      <span>Subir archivo o arrastrar</span>
                    </div>
                    <div v-else class="dropzone-filled">
                      <img v-if="formData[field.name]?.startsWith('data:image/')" :src="formData[field.name]" class="file-preview-image" />
                      <div v-else class="flex items-center gap-2">
                        <FileCheckIcon class="text-accent" :size="24" />
                        <span class="file-name">{{ formData[field.name + '_name'] || 'Documento cargado' }}</span>
                      </div>
                      <button @click.prevent="formData[field.name] = ''; formData[field.name + '_name'] = ''" class="remove-file">Eliminar</button>
                    </div>
                  </label>
                </div>

                <!-- Equipment Autocomplete -->
                <EquipmentAutocomplete 
                  v-else-if="field.type === 'equipment-autocomplete'"
                  v-model="formData[field.name]"
                  :equipmentType="field.equipmentType"
                  :placeholder="field.placeholder"
                  @select="onEquipmentSelect($event, field.mapping)"
                />
              </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Botón de Automatización del Robot -->
        <div v-if="currentSection === 'PRESENTACIÓN'" class="automation-actions mt-8">
          <button @click="handleLaunchAutomation" class="btn-launch-automation" :disabled="isAutomating">
            <span v-if="isAutomating" class="flex gap-2 items-center">
              <Loader2Icon class="spinner" :size="20"/> Lanzando...
            </span>
            <span v-else class="flex gap-2 items-center">
              <RocketIcon :size="20" /> Lanzar Automatización (Junta de Andalucía)
            </span>
          </button>
          <p class="text-muted text-center mt-2 text-sm italic">
            Se abrirá el robot para completar los trámites con tu certificado en la Junta de Andalucía.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ZapIcon, SaveIcon, ArrowLeftIcon, UserIcon, SettingsIcon, 
  LayersIcon, LayoutIcon, FileTextIcon, CheckCircleIcon, 
  SendIcon, UploadIcon, FileCheckIcon, Loader2Icon, ChevronDownIcon, RocketIcon, MapPinIcon 
} from 'lucide-vue-next';
import { masterFormFields, getMasterFormDefaultData } from '../config/masterFormFields';
import EquipmentAutocomplete from '../components/EquipmentAutocomplete.vue';
import { documentService } from '../api/documentService';
import { useToast } from '../store/toastStore';

const toast = useToast();

// Section Definitions
const sections = [
  { id: 'A', label: 'Datos Generales', icon: UserIcon },
  { id: 'E2', label: 'Instalación Técnica', icon: SettingsIcon },
  { id: 'G', label: 'Líneas y Circuitos', icon: LayersIcon },
  { id: 'IMAGEN', label: 'Planos y Archivos', icon: LayoutIcon },
  { id: 'LEGALIZACION', label: 'Legalización', icon: FileTextIcon },
  { id: 'EXTREMADURA', label: 'Extremadura', icon: MapPinIcon },
  { id: 'ACEPTACION', label: 'Aceptación', icon: CheckCircleIcon },
  { id: 'JUSTIFICACION', label: 'Justificación', icon: FileTextIcon },
  { id: 'PRESENTACIÓN', label: 'Presentación', icon: SendIcon },
];

const currentSection = ref('A');
const formData = ref(getMasterFormDefaultData());
const isLoading = ref(false);
const isAutomating = ref(false);
const expandedGroups = ref({});
const dragOverField = ref(null);
const isDirty = ref(false);
const initialSnapshot = ref('');

// Lógica de validación
const validateNIF = (nif) => {
  if (!nif) return true; // No mostrar error si está vacío
  const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase();
  const regex = /^[XYZ]?\d{7,8}[A-Z]$/;
  return regex.test(cleanNif);
};

const validationErrors = computed(() => {
  const errors = {};
  if (formData.value.nif_presentador && !validateNIF(formData.value.nif_presentador)) {
    errors.nif_presentador = 'Formato DNI/NIE inválido (Ej: 12345678A)';
  }
  return errors;
});

const route = useRoute();
const router = useRouter();

const onDrop = async (event, fieldName) => {
  dragOverField.value = null;
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    await handleFileUpload({ target: { files } }, fieldName);
  }
};

const parseSpanishName = (sourceValue) => {
  if (!sourceValue || typeof sourceValue !== 'string') {
    return { nombre: '', ap1: '', ap2: '' };
  }
  const clean = sourceValue.trim();
  if (!clean) return { nombre: '', ap1: '', ap2: '' };

  if (clean.includes(',')) {
    const partes = clean.split(',');
    const nombre = partes.slice(1).join(',').trim();
    const apellidosStr = partes[0].trim();
    const apellidos = apellidosStr.split(/\s+/).filter(Boolean);
    const ap1 = apellidos[0] || '';
    const ap2 = apellidos.slice(1).join(' ') || '';
    return { nombre, ap1, ap2 };
  }

  const partes = clean.split(/\s+/).filter(Boolean);
  if (partes.length === 1) {
    return { nombre: partes[0], ap1: '', ap2: '' };
  } else if (partes.length === 2) {
    return { nombre: partes[0], ap1: partes[1], ap2: '' };
  } else if (partes.length === 3) {
    return { nombre: partes[0], ap1: partes[1], ap2: partes[2] };
  } else if (partes.length >= 4) {
    const nombre = partes.slice(0, partes.length - 2).join(' ');
    const ap1 = partes[partes.length - 2];
    const ap2 = partes[partes.length - 1];
    return { nombre, ap1, ap2 };
  }

  return { nombre: clean, ap1: '', ap2: '' };
};

const buildInitialFormData = (baseData = {}) => {
  const result = { ...getMasterFormDefaultData(), ...baseData };
  
  // Extraer nombre y apellidos desde apellidosNombre para rellenar campos de presentador
  const sourceValue = result['apellidosNombre'];
  if (sourceValue) {
    const { nombre, ap1, ap2 } = parseSpanishName(sourceValue);
    if (!result.nombre_presentador || result.nombre_presentador === 'Vidal') {
      result.nombre_presentador = nombre;
    }
    if (!result.apellido1_presentador || result.apellido1_presentador === 'V') {
      result.apellido1_presentador = ap1;
    }
    if (!result.apellido2_presentador || !result.nombre_presentador || result.nombre_presentador === 'Vidal') {
      result.apellido2_presentador = ap2;
    }
  }

  // Lógica mapFrom en carga inicial
  masterFormFields.forEach(field => {
    if (!field.mapFrom) return;
    const destValue = result[field.name];
    const sourceVal = result[field.mapFrom];
    if ((destValue === undefined || destValue === '') && sourceVal !== undefined && sourceVal !== '') {
      result[field.name] = sourceVal;
    }
  });

  // Asegurar que uso_instalacion siempre tenga valor por defecto si vino vacío de la base de datos
  if (!result.uso_instalacion || result.uso_instalacion === '') {
    result.uso_instalacion = 'produccion de energia electrica';
  }

  return result;
};

// Watcher para resetear el scroll al cambiar de sección
watch(currentSection, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(async () => {
  if (route.params.id) {
    isLoading.value = true;
    try {
      const response = await documentService.getById(route.params.id);
      const formRaw = response.data?.data ?? response.data;
      if (formRaw) {
        formData.value = buildInitialFormData(formRaw);

        // Formatear g_generadorDirectoInversorPotencia a 2 decimales con coma al cargar
        if (formData.value.g_generadorDirectoInversorPotencia) {
          const cleanVal = String(formData.value.g_generadorDirectoInversorPotencia).replace(',', '.');
          const num = parseFloat(cleanVal);
          if (!isNaN(num)) {
            formData.value.g_generadorDirectoInversorPotencia = num.toFixed(2).replace('.', ',');
          }
        }

        initialSnapshot.value = JSON.stringify(formData.value);
      }
    } catch (err) {
      console.error('Error cargando documento:', err);
    } finally {
      isLoading.value = false;
    }
  } else {
     formData.value = buildInitialFormData({});
     initialSnapshot.value = JSON.stringify(formData.value);
  }
});

// Detectar cambios para el estado isDirty
watch(formData, (newVal) => {
  isDirty.value = JSON.stringify(newVal) !== initialSnapshot.value;
}, { deep: true });

// Watcher para la calculadora PEM
watch(() => formData.value.pemCalculoPresupuestoTotal, (newVal) => {
  if (newVal) {
    const total = parseFloat(newVal);
    if (!isNaN(total)) {
      const pec = total / 1.21;
      const pem = pec / 1.19;
      const gastosGenerales = pem * 0.13;
      const beneficioIndustrial = pem * 0.06;
      const iva = pec * 0.21;

      formData.value.pemCalculoPec = pec.toFixed(2).replace('.', ',');
      formData.value.pemCalculoPem = pem.toFixed(2).replace('.', ',');
      formData.value.pemCalculoGastosGenerales = gastosGenerales.toFixed(2).replace('.', ',');
      formData.value.pemCalculoBeneficioIndustrial = beneficioIndustrial.toFixed(2).replace('.', ',');
      formData.value.pemCalculoIva = iva.toFixed(2).replace('.', ',');

      // Sincronizar presupuestoTotal (PEM final)
      formData.value.presupuestoTotal = pem.toFixed(2).replace('.', ',');
    }
  } else {
    formData.value.pemCalculoPec = '';
    formData.value.pemCalculoPem = '';
    formData.value.pemCalculoGastosGenerales = '';
    formData.value.pemCalculoBeneficioIndustrial = '';
    formData.value.pemCalculoIva = '';
    formData.value.presupuestoTotal = '';
  }
});

// Watcher para calcular la potencia pico del generador, la tensión Vpmp y la potencia en líneas y circuitos (soporta 2 marcas de módulos)
watch(
  [
    () => formData.value.e2_potenciaPicoModulo,
    () => formData.value.e2_totalModulos1,
    () => formData.value.e2_totalModulos,
    () => formData.value.tieneSegundaMarcaModulo,
    () => formData.value.e2_potenciaPicoModulo2,
    () => formData.value.e2_totalModulos2
  ],
  ([potMod1, totMod1, totModLegacy, tieneMarca2, potMod2, totMod2]) => {
    const pMod1 = parseFloat(String(potMod1 || '').replace(',', '.'));
    const rawTot1 = totMod1 !== undefined && totMod1 !== '' ? totMod1 : totModLegacy;
    const tMod1 = parseFloat(String(rawTot1 || '').replace(',', '.'));

    const validMod1 = !isNaN(pMod1) && !isNaN(tMod1) && pMod1 > 0 && tMod1 > 0;
    
    let genPico = 0;
    let totalModulosSum = 0;

    if (validMod1) {
      genPico += pMod1 * tMod1;
      totalModulosSum += tMod1;
    }

    if (tieneMarca2) {
      const pMod2 = parseFloat(String(potMod2 || '').replace(',', '.'));
      const tMod2 = parseFloat(String(totMod2 || '').replace(',', '.'));
      if (!isNaN(pMod2) && !isNaN(tMod2) && pMod2 > 0 && tMod2 > 0) {
        genPico += pMod2 * tMod2;
        totalModulosSum += tMod2;
      }
    }

    if (totalModulosSum > 0) {
      const roundedGenPico = Math.round(genPico);
      formData.value.e2_potenciaPicoGenerador = String(roundedGenPico);
      formData.value.e2_totalModulos = String(Math.round(totalModulosSum));

      const vPmp = 46.55 * totalModulosSum;
      const formattedVPmp = String(Math.round(vPmp * 100) / 100).replace('.', ',');
      formData.value.e2_tensionVpmpGenerador = formattedVPmp;

      const genKw = roundedGenPico / 1000;
      const formattedKw = genKw.toFixed(2).replace('.', ',');
      formData.value.g_generadorDirectoInversorPotencia = formattedKw;
    } else {
      formData.value.e2_potenciaPicoGenerador = '';
      formData.value.e2_tensionVpmpGenerador = '';
      formData.value.g_generadorDirectoInversorPotencia = '';
    }
  }
);

// Watcher para autocompletar la potencia de la batería en líneas y circuitos con la energía total de la batería
watch(
  () => formData.value.e2_energiaTotal,
  (newVal) => {
    if (newVal !== undefined && newVal !== null && newVal !== '') {
      formData.value.g_bateriaDiRectaInversorPotencia = newVal;
    }
  }
);

// Watcher para autocompletar la potencia del inversor-red en líneas y circuitos con la potencia nominal total de inversores
watch(
  () => formData.value.e2_potenciaNominalInversores,
  (newVal) => {
    if (newVal !== undefined && newVal !== null && newVal !== '') {
      formData.value.g_inversorRedPotencia = newVal;
    }
  }
);

// Watcher para autocompletar la tensión de salida total de la batería (número de baterías * capacidad nominal)
watch(
  [() => formData.value.numeroBaterias, () => formData.value.capacidadNominalBateria],
  ([numBat, capBat]) => {
    if (numBat !== undefined && capBat !== undefined && numBat !== '' && capBat !== '') {
      const n = parseFloat(String(numBat).replace(',', '.'));
      const c = parseFloat(String(capBat).replace(',', '.'));
      if (!isNaN(n) && !isNaN(c)) {
        const total = n * c;
        formData.value.tensionSalidaTotalBateria = String(total).replace('.', ',');
      }
    }
  }
);

// Watcher para autocompletar coordenadas de la instalación en Extremadura
watch(
  [() => formData.value.coordenadaX, () => formData.value.coordenadaY],
  ([cX, cY]) => {
    if (cX && cY) {
      formData.value.coordenadasInstalacion = `${cX}, ${cY}`;
    } else if (cX) {
      formData.value.coordenadasInstalacion = cX;
    } else if (cY) {
      formData.value.coordenadasInstalacion = cY;
    }
  }
);


// Computed Properties
const currentFields = computed(() => {
  return masterFormFields.filter(f => {
    if (f.subsection !== currentSection.value) return false;
    if (f.showIf) {
      const parentVal = formData.value[f.showIf.field];
      return parentVal === f.showIf.value;
    }
    return true;
  });
});

// Agrupamos los campos de la sección activa
const groupedCurrentFields = computed(() => {
  const grouped = {};
  currentFields.value.forEach(field => {
    const groupName = field.group || '__sin-grupo__';
    if (!grouped[groupName]) {
      grouped[groupName] = [];
      if (expandedGroups.value[groupName] === undefined && groupName !== '__sin-grupo__') {
        expandedGroups.value[groupName] = true;
      }
    }
    grouped[groupName].push(field);
  });
  return grouped;
});

const activeSectionLabel = computed(() => {
  return sections.find(s => s.id === currentSection.value)?.label || '';
});

const progressPercentage = computed(() => {
  const total = masterFormFields.length;
  const filled = Object.values(formData.value).filter(v => 
    v !== '' && v !== false && v !== null && v !== undefined
  ).length;
  return Math.round((filled / total) * 100);
});

const toggleGroup = (groupName) => {
  expandedGroups.value[groupName] = !expandedGroups.value[groupName];
};

// Autocompletion & Watchers logic (Replicated from Automator)
const syncConfig = {
  edificio: {
    edificioVivienda: 'rehabilitacion a nivel de edificio',
    edificioViviendaJUS: 'edificio',
    l3l4: 'Línea 4',
    tipoEdificioFvAerotermia: 'EDIFICIO DE VIVIENDA UNIFAMILIAR',
    parrafoTexto: 'Estas ayudas tienen por objeto la financiación de actuaciones u obras de mejora de la eficiencia energética en las viviendas, ya sean unifamiliares o pertenecientes a edificios plurifamiliares',
    textoOpcional1: 'Estas ayudas tienen por objeto la financiación de actuaciones u obras de mejora de la eficiencia energética en las viviendas, ya sean unifamiliares o pertenecientes a edificios plurifamiliares'
  },
  vivienda: {
    edificioVivienda: 'mejora de la eficiencia energetica en viviendas',
    edificioViviendaJUS: 'vivienda',
    l3l4: 'Línea 3',
    tipoEdificioFvAerotermia: 'VIVIENDAS',
    parrafoTexto: 'Estas ayudas tienen por objeto la financiación de obras o actuaciones en los edificios de uso predominante residencial en las que se obtenga una mejora acreditada de la eficiencia energética, con especial atención a la envolvente edificatoria en edificios de tipología residencial colectiva, incluyendo sus viviendas, y en las viviendas unifamiliares.',
    textoOpcional1: 'Estas ayudas tienen por objeto la financiación de actuaciones u obras de mejora de la eficiencia energética en edificios, en concreto en una vivienda unifamiliar no perteneciente a un bloque de viviendas '
  }
};

const triggerFields = ['edificioVivienda', 'edificioViviendaJUS', 'l3l4', 'tipoEdificioFvAerotermia'];
let isInternalChange = false;
let lastTriggerValues = { ...Object.fromEntries(triggerFields.map(f => [f, formData.value[f]])) };

let oldFormDataStr = JSON.stringify(formData.value);

watch(formData, (newVal) => {
  if (isInternalChange) return;

  const newFormDataStr = JSON.stringify(newVal);
  if (newFormDataStr === oldFormDataStr) return;
  
  const parsedOldVal = JSON.parse(oldFormDataStr);
  let changed = false;
  isInternalChange = true;

  try {
    masterFormFields.forEach(field => {
      if (field.mapFrom) {
        const sourceValue = newVal[field.mapFrom];
        const targetValue = newVal[field.name];
        const sourceOldValue = parsedOldVal[field.mapFrom];

        if (sourceOldValue !== undefined && sourceValue !== sourceOldValue) {
          if (!targetValue || targetValue === sourceOldValue) {
            
            let parsedValue = sourceValue;
            if (field.mapTransform && field.mapTransform[sourceValue]) {
              parsedValue = field.mapTransform[sourceValue];
            }

            if (field.name === 'nombre_presentador' && sourceValue) {
               const { nombre, ap1, ap2 } = parseSpanishName(sourceValue);
               formData.value.nombre_presentador = nombre;
               formData.value.apellido1_presentador = ap1;
               formData.value.apellido2_presentador = ap2;
               changed = true;
               return;
            }
            formData.value[field.name] = parsedValue;
            changed = true;
          }
        }
      }
    });

    const changedField = triggerFields.find(field => newVal[field] !== lastTriggerValues[field]);
    if (changedField) {
      const value = newVal[changedField];
      triggerFields.forEach(f => lastTriggerValues[f] = newVal[f]);
      if (value) {
        let detectedMode = null;
        if (Object.values(syncConfig.edificio).includes(value)) detectedMode = 'edificio';
        else if (Object.values(syncConfig.vivienda).includes(value)) detectedMode = 'vivienda';

        if (detectedMode) {
          const config = syncConfig[detectedMode];
          Object.keys(config).forEach(field => {
            formData.value[field] = config[field];
            if (triggerFields.includes(field)) lastTriggerValues[field] = config[field];
          });
          changed = true;
        }
      }
    }
  } finally {
    if (changed) {
      nextTick(() => {
        oldFormDataStr = JSON.stringify(formData.value);
        isInternalChange = false;
      });
    } else {
      oldFormDataStr = newFormDataStr;
      isInternalChange = false;
    }
  }

}, { deep: true });

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;

        if (width > height) {
          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width = Math.round((width * MAX_HEIGHT) / height); height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      }
    }
  });
};

const handleFileUpload = async (event, fieldName) => {
  const file = event.target.files[0];
  if (!file) return;

  formData.value[fieldName + '_name'] = file.name;

  if (file.type.startsWith('image/')) {
    const compressedDataUrl = await compressImage(file);
    formData.value[fieldName] = compressedDataUrl;
  } else {
    const readerPromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
    
    try {
      formData.value[fieldName] = await readerPromise;
    } catch (err) {
      toast.error('Error al leer el archivo');
      console.error('Error al leer el archivo:', err);
    }
  }
};

const onEquipmentSelect = (item, mapping) => {
  if (!item || !mapping) return;
  Object.entries(mapping).forEach(([itemKey, formKey]) => {
    if (item[itemKey] !== undefined && item[itemKey] !== null) {
      formData.value[formKey] = item[itemKey];
    }
  });
};

const saveForm = async () => {
  isLoading.value = true;
  try {
    const isEditing = !!route.params.id;
    const dataToSave = Object.fromEntries(
      Object.entries(formData.value).filter(([_, v]) => v !== '' && v !== null && v !== undefined || v === false)
    );

    const nombre = dataToSave.apellidosNombre || 'Cliente sin nombre';

    if (isEditing) {
      await documentService.update(route.params.id, nombre, dataToSave);
    } else {
      await documentService.create(nombre, dataToSave);
    }
    
    isDirty.value = false;
    try {
      initialSnapshot.value = JSON.stringify(formData.value);
    } catch (snapErr) {
      console.warn('No se pudo crear el snapshot inicial (posiblemente por tamaño excesivo):', snapErr);
    }
    
    toast.success(isEditing ? '¡Datos actualizados correctamente!' : '¡Nuevo cliente registrado con éxito!');
    router.push('/');
  } catch (err) {
    console.error('Error detallado al guardar:', err);
    const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
    toast.error(`No se pudieron guardar los datos: ${errorMsg}`);
  } finally {
    isLoading.value = false;
  }
};

const handleLaunchAutomation = async () => {
  if (isAutomating.value) return;
  const confirmLaunch = confirm('¿Deseas iniciar la automatización? Se abrirá el navegador para interactuar con la Junta de Andalucía.');
  if (!confirmLaunch) return;

  isAutomating.value = true;
  
  await documentService.update(route.params.id || formData.value.id || 1, formData.value).catch(() => {});

  const form = formData.value;
  const robotPayload = {
    datos: {
      tipoDocumento: form.tipo_documento_presentador,
      nif: form.nif_presentador,
      nombre: form.nombre_presentador,
      apellido1: form.apellido1_presentador,
      apellido2: form.apellido2_presentador,
      sexo: form.sexo_presentador,
      delegacion: form.cod_delegacion,

      tipoVia: form.tipo_via_presentador,
      nombreVia: form.nombre_via_presentador,
      tipoNumeracion: form.tipo_numeracion_presentador,
      numero: form.numero_presentador,
      calificador: form.calificador_numero_presentador,
      bloque: form.bloque_presentador,
      escalera: form.escalera_presentador,
      piso: form.piso_presentador,
      puerta: form.puerta_presentador,
      margen: form.margen_presentador,
      codigoPostal: form.cp_presentador,
      provincia: form.provincia_presentador,
      municipioNombre: form.municipio_presentador,
      poblacion: form.poblacion_presentador,
      telefono: form.telefono_presentador,
      movil: form.movil_presentador,
      email: form.email_presentador,
      ps_distribuidora: form.ps_distribuidora,

      conRepresentante: form.con_representante_legal,
      representante: {
        tipoDocumento: form.rep_leg_tipo_documento,
        nif: form.rep_leg_nif,
        sexo: form.rep_leg_sexo,
        nombre: form.rep_leg_nombre,
        apellido1: form.rep_leg_apellido1,
        apellido2: form.rep_leg_apellido2,
      },

      conPersonaAutorizada: form.con_persona_autorizada,
      personaAutorizada: {
        tipoDocumento: form.per_aut_tipo_documento,
        nif: form.per_aut_nif,
        sexo: form.per_aut_sexo,
        nombre: form.per_aut_nombre,
        apellido1: form.per_aut_apellido1,
        apellido2: form.per_aut_apellido2,
      },

      otrosDatos75codigo: form.cnae_rite,
      otrosDatosNumero: form.numero_empresa_instaladora,
      codigoComunidadAutonoma: form.codigo_ccaa,

      fichaTecnica: {
        potencia: form.potencia_instalacion,
        uso: form.uso_instalacion,
        tipoSuministro: form.tipo_suministro,
        tension: form.tension_red,
        esAutoconsumo: form.es_autoconsumo,
        cau: form.cau_presentador,
        potenciaInstalada: form.potencia_instalada_ficha,
        acumulacion: form.tiene_acumulacion === 'si',
        potenciaAcumulacion: form.potencia_acumulacion,
        energiaMaximaAlmacenada: form.energia_almacenada,
        empresaInstaladora: form.nombre_empresa_instaladora,
        empresaInstaladoraDocTipo: form.empresa_instaladora_doc_tipo,
        empresaInstaladoraDoc: form.empresa_instaladora_doc,
        empresaDistribuidora: form.ps_distribuidora || '',
        cups: form.cups_presentador,
      }
    },
    flatFormData: form
  };

  try {
    const response = await fetch('/api/automation/junta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(robotPayload)
    });
    const result = await response.json();
    if (result.success) {
      alert('¡Automatización completada con éxito!');
    } else {
      alert(`Error en la automatización: ${result.error || 'Inválido'}`);
    }
  } catch (error) {
    alert('No se pudo conectar a la API de automatización.');
  } finally {
    isAutomating.value = false;
  }
};
</script>

<style scoped>
.master-form-container { 
  display: flex; 
  gap: 1.25rem; 
  padding: 1.25rem; 
  width: 100%; 
  max-width: 1600px; 
  margin: 0 auto; 
  min-height: calc(100vh - 2.5rem); 
  box-sizing: border-box; 
}

.form-sidebar { 
  width: 260px; 
  flex-shrink: 0; 
  display: flex; 
  flex-direction: column; 
  padding: 1.5rem; 
  position: sticky; 
  top: 1.25rem; 
  height: calc(100vh - 2.5rem); 
}

.sidebar-header { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  margin-bottom: 2rem; 
}

.logo-placeholder { 
  width: 36px; 
  height: 36px; 
  background: rgba(99, 102, 241, 0.1); 
  border-radius: 10px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}

.sidebar-nav { 
  display: flex; 
  flex-direction: column; 
  gap: 0.4rem; 
  flex-grow: 1; 
  overflow-y: auto; 
  padding-right: 0.5rem; 
}

.nav-item { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  padding: 0.75rem 1rem; 
  border: none; 
  background: transparent; 
  color: var(--text-muted); 
  border-radius: 0.75rem; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  text-align: left; 
  font-family: inherit; 
  font-size: 0.85rem; 
}

.nav-item:hover { background: var(--hover-subtle); color: var(--text-main); }
.nav-item.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; box-shadow: 0 4px 12px 0 var(--primary-glow); }

.sidebar-footer { 
  margin-top: 1.5rem; 
  padding-top: 1.5rem; 
  border-top: 1px solid var(--surface-border); 
}

.w-full { width: 100%; }
.mt-2 { margin-top: 0.5rem; }

/* Main Content Styling */
.form-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.25rem; }

.content-header { 
  padding: 1.25rem 1.75rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
}

.header-info h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
.progress-container { height: 6px; background: var(--hover-subtle); border-radius: 3px; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width 0.5s ease; }

.fields-grid-container { 
  padding: 1.75rem; 
  width: 100%; 
  box-sizing: border-box; 
}

/* Group Accordeons */
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
  cursor: pointer; 
  transition: all 0.2s ease; 
}

.group-header:hover { border-color: var(--primary); background: var(--hover-strong); }
.group-title { font-size: 0.9rem; font-weight: 600; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px; }

.rotate-180 { transform: rotate(180deg); }
.transition-transform { transition: transform 0.3s ease; }

.fields-grid { 
  display: grid; 
  grid-template-columns: repeat(2, minmax(0, 1fr)); 
  gap: 1.25rem; 
  padding: 0; 
}

.field-group { display: flex; flex-direction: column; gap: 0; }
.field-group.full-width { grid-column: span 2; }

.field-label { 
  font-size: 0.65rem; 
  font-weight: 500; 
  color: var(--text-muted); 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
  margin-left: 0.2rem;
  margin-bottom: 0.2rem;
}

.field-desc { text-transform: none; font-weight: 400; font-style: italic; font-size: 0.75rem; margin-left: 0.2rem; }

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

.invalid-input {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
}

/* Buttons */
.btn-launch-automation { 
  margin-top: 0.5rem; 
  padding: 1rem 1.5rem; 
  border-radius: 0.75rem; 
  font-weight: 600; 
  font-size: 1rem; 
  text-align: center; 
  border: none; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: linear-gradient(135deg, #FF6B6B, #C22020); 
  color: white; 
  transition: all 0.3s ease; 
  width: 100%; 
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); 
}

.btn-launch-automation:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(220, 38, 38, 0.5); }

/* File Upload Dropzone */
.hidden-file-input { display: none; }
.file-dropzone { 
  border: 1.5px dashed var(--surface-border); 
  border-radius: 0.75rem; 
  padding: 1.5rem; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  min-height: 100px; 
}

.file-dropzone:hover, .file-dropzone.has-file, .file-dropzone.drag-over { border-color: var(--primary); background: rgba(99, 102, 241, 0.04); }
.dropzone-empty { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; color: var(--text-muted); font-size: 0.85rem; }
.dropzone-filled { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.file-preview-image { max-width: 100%; max-height: 120px; border-radius: 0.4rem; object-fit: contain; }
.file-name { font-size: 0.85rem; color: var(--accent); font-weight: 600; }
.remove-file { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 0.3rem 0.8rem; border-radius: 0.4rem; font-size: 0.75rem; margin-top: 0.4rem; cursor: pointer; }

/* Checkbox */
.checkbox-wrapper { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.8rem; background: rgba(255, 255, 255, 0.02); border-radius: 0.6rem; }
.form-checkbox { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; }
.checkbox-label { font-size: 0.85rem; cursor: pointer; }

@media (max-width: 1200px) {
  .master-form-container { flex-direction: column; }
  .form-sidebar { width: 100%; height: auto; position: static; }
  .sidebar-nav { flex-direction: row; overflow-x: auto; padding-bottom: 0.75rem; }
  .nav-item { white-space: nowrap; padding: 0.5rem 1rem; }
}

@media (max-width: 768px) {
  .fields-grid { grid-template-columns: 1fr; }
  .field-group.full-width { grid-column: span 1; }
}

.loading-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; gap: 1rem; color: var(--text-muted); }
.spinner { animation: spin 1s linear infinite; color: var(--primary); }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.ml-4 { margin-left: 0.75rem; }
.text-sm { font-size: 0.8rem; }
.text-center { text-align: center; }
.italic { font-style: italic; }
.mr-2 { margin-right: 0.4rem; }
.mt-6 { margin-top: 1.25rem; }
.mt-8 { margin-top: 1.5rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 0.4rem; }

/* PEM Breakdown Styles */
.pem-breakdown-card {
  padding: 1.5rem;
  margin-top: 1rem;
  border-radius: 1rem;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pem-breakdown-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.pem-breakdown-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pem-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pem-row.main-pem {
  color: var(--primary);
  font-size: 1rem;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.1);
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid var(--primary-glow);
}

.pem-row.main-pem .pem-value {
  color: var(--accent);
}

.pem-value {
  font-weight: 600;
  color: var(--text-main);
}

.pem-divider {
  height: 1px;
  background: var(--surface-border);
  margin: 0.25rem 0;
}
</style>
