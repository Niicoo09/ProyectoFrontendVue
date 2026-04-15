<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content glass-panel">
        <!-- Cabecera -->
        <div class="modal-header">
          <div class="title-area">
            <div class="selection-status" v-if="selectedIds.length > 0">
              {{ selectedIds.length }}
            </div>
            <FileStackIcon v-else :size="24" class="text-primary" />
            <div>
              <h3>Catálogo de Documentos</h3>
              <p class="text-muted">{{ clientName }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="btn-close">
            <XIcon :size="20" />
          </button>
        </div>

        <!-- Tab Controller -->
        <div class="tab-controller glass-panel">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-btn"
            :class="{ 'active': activeTab === tab.id }"
          >
            <component :is="tab.icon" :size="18" />
            {{ tab.name }}
          </button>
        </div>

        <!-- Cuerpo del Modal -->
        <div class="modal-body custom-scroll">
          <!-- Vista de Documentos -->
          <div class="docs-view animate-fade-in">
            <div class="docs-grid">
              <div 
                v-for="doc in currentDocs" 
                :key="doc.id" 
                class="doc-item" 
                :class="{ 'is-selected': isSelected(doc.id) }"
              >
                <div class="checkbox-area" @click="toggleSelect(doc.id)">
                  <div class="custom-checkbox">
                    <CheckIcon v-if="isSelected(doc.id)" :size="14" />
                  </div>
                </div>
                <div class="doc-main-content" @click="toggleSelect(doc.id)">
                  <div class="doc-icon-box" :class="{ 'alt': activeTab === 'aceptaciones' }">
                    <component :is="doc.icon" :size="20" />
                  </div>
                  <div class="doc-text">
                    <span class="name">{{ doc.name }}</span>
                    <span class="desc">{{ doc.desc }}</span>
                  </div>
                </div>
                <div class="item-actions">
                  <button class="btn-mini-preview" @click.stop="preview(doc)" title="Previsualizar">
                    <EyeIcon :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pie de página con descarga masiva -->
        <div class="modal-footer" v-if="selectedIds.length > 0">
          <div class="selection-info">
            Has seleccionado <strong>{{ selectedIds.length }}</strong> documentos de distintas categorías
          </div>
          <button @click="downloadSelected" class="btn-primary-glow">
            <DownloadIcon :size="18" />
            Descargar selección
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  XIcon, FileStackIcon, EyeIcon, CheckIcon, DownloadIcon, 
  HardHatIcon, Trash2Icon, ZapIcon, HomeIcon, LayoutIcon, 
  LayersIcon, MaximizeIcon, ClipboardCheckIcon, FileTextIcon,
  ShieldCheckIcon, SignatureIcon, ClockIcon, FolderIcon,
  FileCheckIcon, UserIcon
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  clientName: String,
  clientId: String
});

const emit = defineEmits(['close', 'downloadMany', 'preview']);

const activeTab = ref('certificados');
const selectedIds = ref([]);

const tabs = [
  { id: 'certificados', name: 'Certificados', icon: FileTextIcon },
  { id: 'aceptaciones', name: 'Aceptaciones', icon: ClipboardCheckIcon },
  { id: 'justificaciones', name: 'Justificaciones', icon: FolderIcon },
  { id: 'justificaciones50', name: 'Justificación 50%', icon: FileStackIcon },
  { id: 'legalizacion', name: 'Legalización', icon: FileCheckIcon },
];

// Limpiar estados al cerrar/abrir
watch(() => props.isOpen, (val) => {
  if (!val) {
    selectedIds.value = [];
    activeTab.value = 'certificados';
  }
});

const techDocs = [
  { id: 'adecuacion', name: 'Cert. Adecuación', desc: 'Real Decreto 1699/2011.', icon: FileTextIcon, category: 'pdf' },
  { id: 'aporticada-teja', name: 'Aporticada Teja', desc: 'Solidez para cubiertas de teja.', icon: LayoutIcon, category: 'pdf' },
  { id: 'chapas-grecadas', name: 'Chapa Grecada', desc: 'Instalación aporticada.', icon: LayersIcon, category: 'pdf' },
  { id: 'chapas-grecadas-coplanaria', name: 'Chapa Coplanaria', desc: 'Fijación coplanar.', icon: LayersIcon, category: 'pdf' },
  { id: 'coplanar-teja', name: 'Coplanar Teja', desc: 'Nivelado sobre teja.', icon: LayoutIcon, category: 'pdf' },
  { id: 'cubierta-plana-aporticada', name: 'Cubierta Plana', desc: 'Soporte aporticado.', icon: MaximizeIcon, category: 'pdf' },
  { id: 'paramento-vertical', name: 'P. Vertical', desc: 'Fachadas y muros.', icon: HomeIcon, category: 'pdf' },
  { id: 'pergola-aporticada', name: 'Pérgola', desc: 'Certificado específico.', icon: HomeIcon, category: 'pdf' },
  { id: 'memoria-tecnica', name: 'Memoria Técnica', desc: 'Diseño de la instalación.', icon: FileTextIcon, category: 'pdf' },
  { id: 'punto-recarga-ve', name: 'Punto Recarga', desc: 'Cargadores vehículos.', icon: ZapIcon, category: 'pdf' },
  { id: 'planos', name: 'Planos', desc: 'Situación y Cubierta.', icon: LayoutIcon, category: 'pdf' },
  { id: 'estudio-seguridad', name: 'Seguridad y Salud', desc: 'Estudio Básico de SYS.', icon: ShieldCheckIcon, category: 'pdf' },
];

const adminDocs = [
  { id: 'aceptacion-subvencion', name: 'Acept. Subvención', desc: 'Aceptación de ayuda oficial.', icon: SignatureIcon, category: 'aceptacion' },
  { id: 'declaracion-cesion-tratamiento', name: 'Cesión de Datos', desc: 'Anexo A de tratamiento.', icon: ClipboardCheckIcon, category: 'aceptacion' },
  { id: 'declaracion-ausencia-conflicto', name: 'DACI', icon: ClipboardCheckIcon, desc: 'Ausencia Conflicto Intereses.', category: 'aceptacion' },
  { id: 'declaracion-compromiso-derechos', name: 'Compromiso Derechos', desc: 'Derechos sociales y laborales.', icon: ShieldCheckIcon, category: 'aceptacion' },
  { id: 'declaracion-compromiso-transversales', name: 'Principios Transversales', desc: 'Cumplimiento principios transversales.', icon: ClipboardCheckIcon, category: 'aceptacion' },
  { id: 'habilitacion-profesional', name: 'Habilitación', desc: 'Declaración técnica.', icon: HardHatIcon, category: 'pdf' },
  { id: 'no-generacion-rcds', name: 'No Residuos', desc: 'Gestión de escombros.', icon: Trash2Icon, category: 'pdf' },
];

const justDocs = [
  { id: 'justificacion-pago-subvencion-l3', name: 'Justif. Pago L3', desc: 'Documento justificativo línea 3.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'justificacion-pago-subvencion-l4', name: 'Justif. Pago L4', desc: 'Documento justificativo línea 4.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'memoria-economica', name: 'Memoria Económica', desc: 'Justificación inversión realizada.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'memoria-fv-aer', name: 'Memoria FV/AER', desc: 'Justificación técnica instalación.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'obra-massol', name: 'Declaración Inicio', desc: 'Certificado inicio obra Massol.', icon: LayoutIcon, category: 'justificacion' },
  { id: 'declaracion-compromiso-corriente', name: 'Compromiso Corriente', desc: 'Estar al corriente de pagos.', icon: ClipboardCheckIcon, category: 'justificacion' },
  { id: 'cartel-l3', name: 'Cartel L3', desc: 'Cartel publicitario línea 3.', icon: LayersIcon, category: 'justificacion' },
  { id: 'cartel-l4', name: 'Cartel L4', desc: 'Cartel publicitario línea 4.', icon: LayersIcon, category: 'justificacion' },
];
 
const just50Docs = [
  { id: 'pago-anticipado-50-l3', name: 'Anticipado 50% L3', desc: 'Solicitud de pago anticipado.', icon: FolderIcon, category: 'justificaciones50' },
  { id: 'pago-restante-50-l3', name: 'Restante 50% L3', desc: 'Solicitud de pago restante.', icon: FolderIcon, category: 'justificaciones50' },
  { id: 'pago-anticipado-100-l4', name: 'Anticipado 100% L4', desc: 'Solicitud de pago total L4.', icon: FolderIcon, category: 'justificaciones50' },
];

const legalDocs = [
  { id: 'mtd-monofasica-con-bateria', name: 'MTD Monofásica', desc: 'Autoconsumo con batería.', icon: ZapIcon, category: 'legalizacion' },
  { id: 'mtd-trifasica-con-bateria', name: 'MTD Trifásica', desc: 'Autoconsumo trifásico bat.', icon: ZapIcon, category: 'legalizacion' },
  { id: 'mtd-sin-bateria', name: 'MTD Sin Batería', desc: 'Autoconsumo sin batería.', icon: ZapIcon, category: 'legalizacion' },
  { id: 'mtd-aislada-con-bateria', name: 'MTD Aislada', desc: 'Instalación aislada con bat.', icon: ZapIcon, category: 'legalizacion' },
  { id: 'mtd-punto-recarga', name: 'MTD Punto Recarga', desc: 'Cargadores vehículo eléctrico.', icon: ZapIcon, category: 'legalizacion' },
  { id: 'cie', name: 'CIE (Boletín)', desc: 'Certificado Inst. Eléctrica.', icon: FileCheckIcon, category: 'legalizacion' },
  { id: 'doacfv', name: 'DOACFV', desc: 'Certificado Dirección Obra.', icon: SignatureIcon, category: 'legalizacion' },
  { id: 'certificado-adecuacion', name: 'Cert. Adecuación', desc: 'Estado de la instalación.', icon: ClipboardCheckIcon, category: 'legalizacion' },
  { id: 'autorizacion-representacion', name: 'Repres. Legal', desc: 'Autorización representación.', icon: UserIcon, category: 'legalizacion' },
  { id: 'anexo-iii', name: 'Anexo III', desc: 'Comunicaciones oficiales.', icon: FileTextIcon, category: 'legalizacion' },
  { id: 'no-generacion-rcds', name: 'Residuos (RCDs)', desc: 'Declaración no generación.', icon: Trash2Icon, category: 'legalizacion' },
];

const currentDocs = computed(() => {
  if (activeTab.value === 'certificados') return techDocs;
  if (activeTab.value === 'aceptaciones') return adminDocs;
  if (activeTab.value === 'justificaciones') return justDocs;
  if (activeTab.value === 'justificaciones50') return just50Docs;
  if (activeTab.value === 'legalizacion') return legalDocs;
  return [];
});

const isSelected = (id) => selectedIds.value.includes(id);

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const preview = (doc) => {
  emit('preview', doc);
};

const downloadSelected = () => {
  // Buscamos la categoría real de cada ID para que la descarga sepa qué endpoint usar
  const selectedDocs = [...techDocs, ...adminDocs, ...justDocs, ...just50Docs, ...legalDocs].filter(d => selectedIds.value.includes(d.id));
  emit('downloadMany', selectedDocs);
  selectedIds.value = [];
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--surface-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 23, 42, 0.5);
}

.title-area {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.selection-status {
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.title-area h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #ef4444;
}

.tab-controller {
  display: flex;
  margin: 1rem 2rem 0;
  padding: 0.3rem;
  gap: 0.3rem;
  border-radius: 0.8rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 0.6rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: var(--surface-border);
  border-radius: 10px;
}

.placeholder-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1.5rem;
}

.placeholder-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed var(--surface-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 0.75rem;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  transition: all 0.2s ease;
  position: relative;
}

.doc-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.doc-item.is-selected {
  background: rgba(99, 102, 241, 0.08);
  border-color: var(--primary);
}

.checkbox-area {
  cursor: pointer;
  padding: 0.5rem;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--surface-border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: white;
  flex-shrink: 0;
}

.is-selected .custom-checkbox {
  background: var(--primary);
  border-color: var(--primary);
}

.doc-main-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.doc-icon-box {
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-icon-box.alt {
  background: rgba(34, 211, 238, 0.1);
  color: var(--accent);
}

.doc-text {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 0.9rem;
}

.desc {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.item-actions {
  display: flex;
}

.btn-mini-preview {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-border);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-mini-preview:hover {
  color: white;
  background: var(--surface);
  border-color: var(--accent);
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.8);
  border-top: 1px solid var(--surface-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-primary-glow {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.btn-primary-glow:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
