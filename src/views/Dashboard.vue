<template>
  <div class="dashboard-container">
    <!-- Buscador y Filtros -->
    <div class="controls-bar animate-fade-in">
      <div class="search-box glass-panel">
        <SearchIcon :size="20" class="text-muted" />
        <input type="text" v-model="searchQuery" placeholder="Buscar por nombre o ID..." />
      </div>
      <div class="stats glass-panel">
        <span class="text-muted">Total: </span>
        <span class="count">{{ filteredDocuments.length }} Clientes</span>
      </div>
      <router-link to="/master-form" class="btn-primary">
        <PlusIcon :size="18" />
        Nuevo Cliente
      </router-link>
    </div>

    <!-- Estados de Carga / Error -->
    <div v-if="loading" class="clients-grid animate-fade-in text-left">
      <div v-for="i in 3" :key="'skel-'+i" class="client-card glass-panel" style="pointer-events: none;">
        <div class="card-header border-b border-[rgba(255,255,255,0.1)] pb-4 mb-4 flex items-center gap-4">
          <div class="skeleton" style="width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;"></div>
          <div class="flex-grow flex flex-col gap-2">
            <div class="skeleton" style="width: 60%; height: 16px;"></div>
            <div class="skeleton" style="width: 40%; height: 12px;"></div>
          </div>
        </div>
        <div class="card-body mb-4 flex flex-col gap-3">
          <div class="skeleton" style="width: 70%; height: 14px;"></div>
          <div class="skeleton" style="width: 50%; height: 14px;"></div>
        </div>
        <div class="card-actions flex flex-col gap-2">
           <div class="skeleton" style="width: 100%; height: 32px; border-radius: 8px;"></div>
           <div class="skeleton" style="width: 100%; height: 32px; border-radius: 8px;"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="center-state error-box glass-panel animate-fade-in">
      <AlertCircleIcon :size="48" color="#ef4444" />
      <h3>No se pudo conectar con el Backend</h3>
      <p>{{ error }}</p>
      <button @click="fetchDocuments" class="btn-primary">
        <RefreshCwIcon :size="18" />
        Intentar de nuevo
      </button>
    </div>

    <!-- Grid de Clientes -->
    <div v-else-if="filteredDocuments.length > 0" class="clients-grid">
      <div v-for="doc in filteredDocuments" :key="doc.id" class="client-card glass-panel animate-fade-in">
        <div class="card-header">
          <div class="avatar">
            <UserIcon :size="24" />
          </div>
          <div class="header-info">
            <h3>{{ doc.nombre || 'Cliente sin nombre' }}</h3>
            <code class="uuid">{{ doc.id }}</code>
          </div>
          <div style="margin-left: auto;">
            <router-link :to="'/master-form/' + doc.id" class="btn-edit-icon" title="Editar Expediente">
              <EditIcon :size="20" />
            </router-link>
          </div>
        </div>

        <div class="card-body">
          <div class="meta-item">
            <CalendarIcon :size="14" />
            <span>Última actualización: {{ formatDate(doc.updatedAt || doc.createdAt) }}</span>
          </div>
        </div>

        <div class="card-actions">
          <div class="action-group">
            <span class="group-label">Documentos Oficiales</span>
            <div class="buttons-grid">
              <button @click="handleDownload('pdf', 'adecuacion', doc)" class="btn-dl">
                <FileTextIcon :size="14" /> Adecuación
              </button>
              <button @click="handleDownload('pdf', 'memoria-tecnica', doc)" class="btn-dl">
                <FileTextIcon :size="14" /> M. Técnica
              </button>
              <button @click="handleDownload('pdf', 'planos', doc)" class="btn-dl">
                <FileTextIcon :size="14" /> Planos
              </button>
              <button @click="handleDownload('pdf', 'estudio-seguridad', doc)" class="btn-dl btn-special">
                <ShieldCheckIcon :size="14" /> E. Seguridad
              </button>
            </div>
          </div>

          <div class="action-group">
            <span class="group-label">Aceptaciones y Firmas</span>
            <div class="buttons-grid">
              <button @click="handleDownload('aceptacion', 'aceptacion-subvencion', doc)" class="btn-dl alt">
                <SignatureIcon :size="14" /> Subvención
              </button>
              <button @click="handleDownload('aceptacion', 'declaracion-ausencia-conflicto', doc)" class="btn-dl alt">
                <SignatureIcon :size="14" /> DACI
              </button>
            </div>
          </div>
          
          <button @click="openDocsModal(doc)" class="btn-more">
            Ver todos los certificados disponibles (14+)
            <ChevronDownIcon :size="16" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="center-state animate-fade-in">
      <GhostIcon :size="48" class="text-muted" />
      <h3>No se encontraron resultados</h3>
      <p class="text-muted">Prueba con otro término de búsqueda.</p>
    </div>

    <!-- Modal de Documentos Extra -->
    <MoreDocsModal 
      :isOpen="isModalOpen" 
      :clientName="selectedClient?.nombre" 
      :clientId="selectedClient?.id"
      @close="isModalOpen = false"
      @download="handleModalDownload"
      @downloadMany="handleDownloadMany"
      @preview="handlePreviewRequest"
    />

    <!-- Modal de Previsualización PDF -->
    <PDFPreviewModal
      :isOpen="isPreviewOpen"
      :pdfUrl="previewUrl"
      :fileName="previewFileName"
      @close="closePreview"
      @download="downloadFromPreview"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  SearchIcon, Loader2Icon, AlertCircleIcon, UserIcon, RefreshCwIcon, 
  CalendarIcon, FileTextIcon, ShieldCheckIcon, SignatureIcon, 
  ChevronDownIcon, GhostIcon, PlusIcon, EditIcon
} from 'lucide-vue-next';
import { documentService } from '../api/documentService';
import MoreDocsModal from '../components/MoreDocsModal.vue';
import PDFPreviewModal from '../components/PDFPreviewModal.vue';

const documents = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Estado para el Modal de Catálogo
const isModalOpen = ref(false);
const selectedClient = ref(null);

// Estado para el Modal de Previsualización
const isPreviewOpen = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');
const currentPreviewDoc = ref(null);

const fetchDocuments = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await documentService.getAll();
    documents.value = response.data;
  } catch (err) {
    console.error(err);
    error.value = 'No se pudo conectar con el servidor. Verifica que el Backend esté en línea y los permisos de CORS estén configurados correctamente.';
  } finally {
    loading.value = false;
  }
};

const filteredDocuments = computed(() => {
  // 1. Creamos una copia para no mutar el original y ordenamos
  let list = [...documents.value].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB - dateA; // Descendente: más recientes primero
  });

  // 2. Filtramos por búsqueda si hay texto
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(d => 
    d.nombre?.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
  );
});

const handleDownload = async (type, endpoint, doc) => {
  const fileName = `${endpoint}_${doc.nombre || 'Documento'}`.replace(/ /g, '_');
  try {
    await documentService.download(type, endpoint, doc.id, fileName);
  } catch (err) {
    alert('Error al descargar el archivo. Verifica la consola.');
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const openDocsModal = (doc) => {
  selectedClient.value = doc;
  isModalOpen.value = true;
};

const handleModalDownload = async (endpoint) => {
  if (!selectedClient.value) return;
  await handleDownload('pdf', endpoint, selectedClient.value);
};

const handleDownloadMany = async (selectedDocs) => {
  if (!selectedClient.value) return;
  // Descarga secuencial con delay para no saturar el navegador
  for (const doc of selectedDocs) {
    await handleDownload(doc.category, doc.id, selectedClient.value);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

const handlePreviewRequest = async (docInfo) => {
  if (!selectedClient.value) return;
  
  currentPreviewDoc.value = docInfo;
  previewFileName.value = docInfo.name;
  previewUrl.value = ''; // Limpiar previo
  isPreviewOpen.value = true;

  try {
    const blob = await documentService.getBlob(docInfo.category, docInfo.id, selectedClient.value.id);
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value); // Limpiar memoria
    previewUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    alert('Error al generar la previsualización.');
    isPreviewOpen.value = false;
  }
};

const closePreview = () => {
  isPreviewOpen.value = false;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
};

const downloadFromPreview = () => {
  if (!currentPreviewDoc.value || !selectedClient.value) return;
  handleDownload(currentPreviewDoc.value.category, currentPreviewDoc.value.id, selectedClient.value);
};

onMounted(fetchDocuments);
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
  height: 3.5rem;
}

.search-box input {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 1rem;
  width: 100%;
  outline: none;
}

.stats {
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.client-card {
  padding: 2rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.client-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45);
}

.card-header {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.uuid {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
}

.btn-edit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-edit-icon:hover {
  color: var(--primary);
  background: var(--primary-glow);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
}

.buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.btn-dl {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-border);
  color: var(--text-main);
  padding: 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-dl:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--text-muted);
}

.btn-dl.alt {
  color: var(--accent);
  border-color: rgba(34, 211, 238, 0.2);
}

.btn-dl.alt:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: var(--accent);
}

.btn-special {
  grid-column: span 2;
  background: linear-gradient(90deg, var(--primary-glow), transparent);
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}

.btn-more {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.btn-more:hover {
  color: var(--text-main);
}

.center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 5rem;
  text-align: center;
}

.error-box {
  max-width: 500px;
  margin: 0 auto;
}

.spinner {
  animation: spin 1s linear infinite;
  color: var(--primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
