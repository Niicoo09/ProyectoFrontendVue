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

const activeTab = ref('proyectos');
const selectedIds = ref([]);

const tabs = [
  { id: 'proyectos', name: 'Proyectos', icon: FileTextIcon },
  { id: 'aceptaciones', name: 'Aceptaciones', icon: ClipboardCheckIcon },
  { id: 'justificaciones', name: 'Justificaciones', icon: FolderIcon },
  { id: 'justificaciones50', name: 'Justificación 50%', icon: FileStackIcon },
  { id: 'legalizacion', name: 'Legalización', icon: FileCheckIcon },
  { id: 'pac', name: 'PAC', icon: ShieldCheckIcon },
];

const techDocs = [
  { id: 'autorizacion-representacion', name: '1.- Autorización de Representación', desc: 'Autorización firmada por el titular.', icon: UserIcon, category: 'pdf' },
  { id: 'mtd-monofasica-con-bateria', name: '6.- MTD (Con batería)', desc: 'Memoria Técnica de Diseño con acumulación.', icon: ZapIcon, category: 'pdf' },
  { id: 'mtd-aislada-con-bateria', name: '6.- MTD (Aislada)', desc: 'Instalación aislada de red.', icon: ZapIcon, category: 'pdf' },
  { id: 'mtd-trifasica-con-bateria', name: '6.- MTD (Trifásica con batería)', desc: 'Diseño para sistemas trifásicos.', icon: ZapIcon, category: 'pdf' },
  { id: 'mtd-sin-bateria', name: '6.- MTD (Sin batería)', desc: 'Autoconsumo instantáneo.', icon: ZapIcon, category: 'pdf' },
  { id: 'mtd-punto-recarga', name: '6.- MTD (Punto de recarga)', desc: 'Instalación de VE.', icon: ZapIcon, category: 'pdf' },
  { id: 'coplanar-teja', name: '7.- Certificado de solidez (coplanar teja)', desc: 'Estructura nivelada sobre teja.', icon: LayoutIcon, category: 'pdf' },
  { id: 'cubierta-plana-aporticada', name: '7.- Certificado de solidez (Cubierta plana)', desc: 'Soporte aporticado en plano.', icon: MaximizeIcon, category: 'pdf' },
  { id: 'aporticado-teja', name: '7.- Certificado de solidez (aporticado teja)', desc: 'Soporte inclinado sobre teja.', icon: LayoutIcon, category: 'pdf' },
  { id: 'paramento-vertical', name: '7.- Certificado de solidez (paramento vertical)', desc: 'Instalación en fachada.', icon: HomeIcon, category: 'pdf' },
  { id: 'chapas-grecadas', name: '7.- Certificado de solidez (chapa grecada aporticada)', desc: 'Fijación en chapa con inclinación.', icon: LayersIcon, category: 'pdf' },
  { id: 'chapas-grecadas-coplanaria', name: '7.- Certificado de solidez (chapa grecada coplanaria)', desc: 'Fijación directa a chapa.', icon: LayersIcon, category: 'pdf' },
  { id: 'pergola-aporticada', name: '7.- Certificado de solidez (Pérgola)', desc: 'Estructura tipo pérgola.', icon: HomeIcon, category: 'pdf' },
  { id: 'no-generacion-rcds', name: '8.- DR No Generación de Residuos', desc: 'Declaración responsable de escombros.', icon: Trash2Icon, category: 'pdf' },
  { id: 'habilitacion-profesional', name: '9.- DR de Habilitación Profesional', desc: 'Habilitación técnica del instalador.', icon: HardHatIcon, category: 'pdf' },
  { id: 'planos', name: '12.- Planos de Situación, Emplazamiento y Cubierta', desc: 'Planos técnicos oficiales.', icon: LayoutIcon, category: 'pdf' },
  { id: 'estudio-seguridad', name: 'Estudio Básico de Seguridad y Salud - 80 páginas', desc: 'Documento completo de prevención.', icon: ShieldCheckIcon, category: 'pdf' },
  { id: 'documento-ultima-pagina', name: 'Última Página - Otras Informaciones Útiles', desc: 'Cierre del expediente.', icon: FileTextIcon, category: 'pdf' },
];

const adminDocs = [
  { id: 'aceptacion-subvencion', name: '1.- Aceptación de la Subvención Concedida', desc: 'Aceptación formal de la ayuda.', icon: SignatureIcon, category: 'aceptacion' },
  { id: 'declaracion-cesion-tratamiento', name: '2.- ANEXO A - Declaración de Cesión y Tratamiento de Datos', desc: 'Tratamiento de datos personales.', icon: ClipboardCheckIcon, category: 'aceptacion' },
  { id: 'declaracion-compromiso-derechos', name: '3.- ANEXO B - Compromiso de concesión de derechos y accesos', desc: 'Derechos sociales y laborales.', icon: ShieldCheckIcon, category: 'aceptacion' },
  { id: 'declaracion-compromiso-transversales', name: '4.- ANEXO C - Cumplimiento de principios transversales', desc: 'Principios transversales del PRTR.', icon: ClipboardCheckIcon, category: 'aceptacion' },
  { id: 'declaracion-ausencia-conflicto', name: '5.- DACI', icon: ClipboardCheckIcon, desc: 'Declaración de Ausencia de Conflicto de Intereses.', category: 'aceptacion' },
  { id: 'cartel-l3', name: 'Cartel Publicitario L3.pdf', desc: 'Publicidad oficial Línea 3.', icon: LayersIcon, category: 'justificacion' },
  { id: 'cartel-l4', name: 'Cartel Publicitario L4.pdf', desc: 'Publicidad oficial Línea 4.', icon: LayersIcon, category: 'justificacion' },
];

const justDocs = [
  { id: 'justificacion-pago-subvencion-l3', name: '1.- Formato para Pago previa justificacion (100%) L3', desc: 'Documento justificativo línea 3.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'justificacion-pago-subvencion-l4', name: '1.- Formato para Pago previa justificacion (100%) L4', desc: 'Documento justificativo línea 4.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'memoria-economica', name: '2.- Memoria Económica (sin anexos)', desc: 'Justificación inversión realizada.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'memoria-fv-aer', name: '3.- Memoria Justificativa', desc: 'Justificación técnica de la instalación.', icon: FileTextIcon, category: 'justificacion' },
  { id: 'certificado-pedidos', name: '8.- Certificado de Pedidos', desc: 'Certificado de pedidos realizados.', icon: FileCheckIcon, category: 'justificacion' },
  { id: 'obra-massol', name: '9.- Declaración inicio de obras-Massol', desc: 'Certificado inicio obra Massol.', icon: LayoutIcon, category: 'justificacion' },
  { id: 'declaracion-compromiso-corriente', name: '10.- Declaración de Compromiso de Pago - Corriente', desc: 'Estar al corriente de pagos.', icon: ClipboardCheckIcon, category: 'justificacion' },
];
 
const just50Docs = [
  { id: 'pago-anticipado-50-l3', name: 'Anticipado 50% L3', desc: 'Solicitud de pago anticipado.', icon: FolderIcon, category: 'justificaciones50' },
  { id: 'pago-restante-50-l3', name: 'Restante 50% L3', desc: 'Solicitud de pago restante.', icon: FolderIcon, category: 'justificaciones50' },
  { id: 'pago-anticipado-100-l4', name: 'Anticipado 100% L4', desc: 'Solicitud de pago total L4.', icon: FolderIcon, category: 'justificaciones50' },
];

const legalDocs = [
  { id: 'certificado-adecuacion', name: '7.- Certificado de Adecuación al RD 1699-2011', desc: 'Certificado de estado de la instalación.', icon: ClipboardCheckIcon, category: 'legalizacion' },
  { id: 'cie', name: '2.- CIE', desc: 'Certificado de Instalación Eléctrica (Boletín).', icon: FileCheckIcon, category: 'legalizacion' },
  { id: 'anexo-iii', name: 'ANEXO III', desc: 'Comunicaciones oficiales de la instalación.', icon: FileTextIcon, category: 'legalizacion' },
  { id: 'certificado-direccion-obra', name: '3.- Certificado de Dirección de Obra', desc: 'Certificado oficial de dirección técnica.', icon: SignatureIcon, category: 'legalizacion' },
  { id: 'declaracion-responsable-do', name: '3.a- Declaración Responsable DO', desc: 'Declaración de la dirección de obra.', icon: ShieldCheckIcon, category: 'legalizacion' },
  { id: 'dr-tecnico-competente', name: '1.1.a - DR Técnico Competente', desc: 'Declaración responsable técnica.', icon: HardHatIcon, category: 'legalizacion' },
];

const pacDocs = [
  { id: 'declaracion-propietario', name: '1.- Declaración del Propietario', desc: 'Conformidad para la central de generación.', icon: SignatureIcon, category: 'pac' },
  { id: 'autorizacion-facturacion', name: '2.- Autorización de Facturación', desc: 'Gestión de facturación por representante.', icon: FileTextIcon, category: 'pac' },
];

const currentDocs = computed(() => {
  if (activeTab.value === 'proyectos') return techDocs;
  if (activeTab.value === 'aceptaciones') return adminDocs;
  if (activeTab.value === 'justificaciones') return justDocs;
  if (activeTab.value === 'justificaciones50') return just50Docs;
  if (activeTab.value === 'legalizacion') return legalDocs;
  if (activeTab.value === 'pac') return pacDocs;
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
  const selectedDocs = [
    ...techDocs, 
    ...adminDocs, 
    ...justDocs, 
    ...just50Docs, 
    ...legalDocs,
    ...pacDocs
  ].filter(d => selectedIds.value.includes(d.id));
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
  background: var(--surface);
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
  color: var(--text-main);
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
  background: var(--hover-subtle);
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
  background: var(--primary-glow);
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
  background: var(--primary-glow);
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
  color: var(--text-main);
  background: var(--surface);
  border-color: var(--accent);
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: var(--surface);
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
