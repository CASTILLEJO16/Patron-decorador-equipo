<template>
  <div class="decorated-pie-chart">
    <!-- Controles de la gráfica -->
    <div class="chart-controls" v-if="showControls">
      <div class="control-group">
        <label for="chart-type">Tipo:</label>
        <select id="chart-type" v-model="chartType" @change="recreateChart">
          <option value="pie">Pastel</option>
          <option value="doughnut">Donut</option>
        </select>
      </div>

      <div class="control-group">
        <label for="theme">Tema:</label>
        <select id="theme" v-model="selectedTheme" @change="recreateChart">
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="blue">Azul</option>
          <option value="green">Verde</option>
          <option value="purple">Morado</option>
          <option value="orange">Naranja</option>
        </select>
      </div>

      <div class="control-group">
        <label for="animation">Animación:</label>
        <select id="animation" v-model="selectedAnimation" @change="recreateChart">
          <option value="bounce">Rebote</option>
          <option value="fade">Desvanecer</option>
          <option value="slide">Deslizar</option>
          <option value="rotate">Rotar</option>
          <option value="scale">Escalar</option>
          <option value="pulse">Pulso</option>
        </select>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="enableFilters" @change="recreateChart">
          Activar Filtros
        </label>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="enableExport" @change="recreateChart">
          Habilitar Exportación
        </label>
      </div>
    </div>

    <!-- Controles de filtros -->
    <div class="filter-controls" v-if="enableFilters && showFilterControls">
      <h4>Filtros Activos</h4>
      <div class="filter-row">
        <input 
          type="text" 
          v-model="filters.searchText" 
          placeholder="Buscar por nombre..."
          @input="applyFilters"
        >
        <select v-model="filters.semestre" @change="applyFilters">
          <option value="">Todos los semestres</option>
          <option value="1">Semestre 1</option>
          <option value="2">Semestre 2</option>
          <option value="3">Semestre 3</option>
          <option value="4">Semestre 4</option>
          <option value="5">Semestre 5</option>
          <option value="6">Semestre 6</option>
        </select>
        <select v-model="filters.genero" @change="applyFilters">
          <option value="">Todos los géneros</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
        </select>
        <button @click="clearFilters" class="btn-clear">Limpiar Filtros</button>
      </div>
    </div>

    <!-- Contenedor de la gráfica -->
    <div class="chart-container" ref="chartContainer">
      <canvas ref="chartCanvas" v-if="chartConfig"></canvas>
      
      <!-- Estado de carga -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando gráfica...</p>
      </div>

      <!-- Estado de error -->
      <div v-if="error" class="error-overlay">
        <p class="error-message">❌ {{ error }}</p>
        <button @click="retry" class="btn-retry">Reintentar</button>
      </div>

      <!-- Estado sin datos -->
      <div v-if="!hasData && !isLoading && !error" class="no-data-overlay">
        <p>📊 No hay datos disponibles para mostrar</p>
      </div>
    </div>

    <!-- Controles de exportación -->
    <div class="export-controls" v-if="chartConfig?.exportable && showExportControls">
      <h4>Exportar Gráfica</h4>
      <div class="export-channel-controls" v-if="chartConfig?.availableChannels?.length">
        <div class="control-group">
          <label for="export-channel">Enviar por:</label>
          <select id="export-channel" v-model="selectedExportChannel">
            <option v-for="ch in chartConfig.availableChannels" :key="ch" :value="ch">
              {{ channelLabel(ch) }}
            </option>
          </select>
        </div>

        <div class="control-group" v-if="selectedExportChannel === 'email'">
          <label for="export-email">Correo:</label>
          <input id="export-email" type="email" v-model="exportEmailTo" placeholder="correo@ejemplo.com" />
        </div>

        <div class="control-group" v-if="selectedExportChannel === 'whatsapp'">
          <label for="export-phone">WhatsApp:</label>
          <input id="export-phone" type="tel" v-model="exportWhatsAppPhone" placeholder="+52..." />
        </div>

        <div class="control-group" v-if="selectedExportChannel !== 'download'">
          <label for="export-message">Mensaje:</label>
          <input id="export-message" type="text" v-model="exportMessage" placeholder="Mensaje opcional" />
        </div>
      </div>

      <div class="export-buttons">
        <button @click="exportChart('png')" class="btn-export" :disabled="isExporting">
          📷 Exportar PNG
        </button>
        <button @click="exportChart('jpg')" class="btn-export" :disabled="isExporting">
          🖼️ Exportar JPG
        </button>
        <button @click="exportChart('pdf')" class="btn-export" :disabled="isExporting">
          📄 Exportar PDF
        </button>
        <button @click="exportChart('csv')" class="btn-export" :disabled="isExporting">
          📊 Exportar CSV
        </button>
        <button @click="exportChart('json')" class="btn-export" :disabled="isExporting">
          💾 Exportar JSON
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useChartDecorator } from '@/composables/charts/useChartDecorator'

// Registrar componentes de Chart.js
Chart.register(...registerables)

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showFilterControls: {
    type: Boolean,
    default: true
  },
  showExportControls: {
    type: Boolean,
    default: true
  },
  showInfo: {
    type: Boolean,
    default: false
  },
  initialType: {
    type: String,
    default: 'pie'
  },
  initialTheme: {
    type: String,
    default: 'light'
  },
  initialAnimation: {
    type: String,
    default: 'bounce'
  }
})

// Emits
const emit = defineEmits(['chartReady', 'exportComplete', 'error'])

// Refs
const chartCanvas = ref(null)
const chartContainer = ref(null)
let chartInstance = null

// Estado del composable
const {
  data: composableData,
  chartConfig,
  isLoading,
  error,
  hasData,
  createPieChart,
  createDonutChart,
  exportChart: exportChartFromComposable,
  getAppliedDecorators
} = useChartDecorator(props.data, props.options)

// Estado local
const chartType = ref(props.initialType)
const selectedTheme = ref(props.initialTheme)
const selectedAnimation = ref(props.initialAnimation)
const enableFilters = ref(false)
const enableExport = ref(true)
const isExporting = ref(false)

const selectedExportChannel = ref('download')
const exportEmailTo = ref('')
const exportWhatsAppPhone = ref('')
const exportMessage = ref('')

const filters = ref({
  searchText: '',
  semestre: '',
  genero: '',
  carrera: '',
  calificacionMin: undefined,
  calificacionMax: undefined
})

// Computados
const appliedDecorators = computed(() => {
  return getAppliedDecorators() || []
})

// Métodos
const recreateChart = async () => {
  try {
    await nextTick()
    
    const config = {
      filters: enableFilters.value ? filters.value : {},
      theme: selectedTheme.value,
      animation: selectedAnimation.value,
      enableExport: enableExport.value,
      customOptions: props.options
    }

    let result
    if (chartType.value === 'pie') {
      result = createPieChart(config)
    } else if (chartType.value === 'doughnut') {
      result = createDonutChart(config)
    }

    if (result) {
      await nextTick()
      renderChart()
      emit('chartReady', result)
    }
  } catch (err) {
    console.error('Error recreando gráfica:', err)
    emit('error', err.message)
  }
}

const channelLabel = (ch) => {
  if (ch === 'download') return 'Descargar'
  if (ch === 'email') return 'Correo'
  if (ch === 'whatsapp') return 'WhatsApp'
  return ch
}

const renderChart = () => {
  if (!chartCanvas.value || !chartConfig.value) return

  // Destruir gráfica existente
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  // Crear nueva gráfica
  const ctx = chartCanvas.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: chartConfig.value.type,
    data: chartConfig.value.data,
    options: chartConfig.value.options
  })
}

const applyFilters = () => {
  if (enableFilters.value) {
    recreateChart()
  }
}

const clearFilters = () => {
  filters.value = {
    searchText: '',
    semestre: '',
    genero: '',
    carrera: '',
    calificacionMin: undefined,
    calificacionMax: undefined
  }
  applyFilters()
}

const exportChart = async (format) => {
  if (!chartConfig.value) return

  try {
    isExporting.value = true

    let result
    if (selectedExportChannel.value && selectedExportChannel.value !== 'download') {
      if (!chartConfig.value.exportToChannel) {
        throw new Error('Esta gráfica no soporta envío por canal')
      }

      const options = {
        message: exportMessage.value,
        to: exportEmailTo.value,
        phone: exportWhatsAppPhone.value
      }

      result = await chartConfig.value.exportToChannel(format, selectedExportChannel.value, options)
    } else {
      if (!chartConfig.value.exportChart) return
      result = await exportChartFromComposable(format)
    }
    
    if (result.success) {
      emit('exportComplete', result)
      // Mostrar notificación de éxito
      console.log(`✅ Gráfica exportada como ${format.toUpperCase()}: ${result.filename}`)
    } else {
      console.error('❌ Error exportando:', result.error)
    }
  } catch (err) {
    console.error('Error exportando gráfica:', err)
    emit('error', err.message)
  } finally {
    isExporting.value = false
  }
}

const retry = () => {
  recreateChart()
}

// Watchers
watch(() => props.data, (newData) => {
  composableData.value = newData
  recreateChart()
}, { deep: true })

watch(() => props.options, () => {
  recreateChart()
}, { deep: true })

// Lifecycle
onMounted(() => {
  recreateChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.decorated-pie-chart {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-group label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.control-group select,
.control-group input[type="checkbox"] {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.filter-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 8px;
}

.filter-controls h4 {
  margin: 0 0 10px 0;
  color: #1976d2;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-row input,
.filter-row select {
  padding: 8px;
  border: 1px solid #90caf9;
  border-radius: 4px;
  font-size: 14px;
}

.btn-clear {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-clear:hover {
  background: #d32f2f;
}

.chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 20px;
}

.loading-overlay,
.error-overlay,
.no-data-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #d32f2f;
  font-weight: 600;
  margin-bottom: 10px;
}

.btn-retry {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: #1565c0;
}

.export-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f1f8e9;
  border-radius: 8px;
}

.export-controls h4 {
  margin: 0 0 10px 0;
  color: #388e3c;
}

.export-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-export {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-export:hover:not(:disabled) {
  background: #45a049;
}

.btn-export:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.chart-info {
  padding: 15px;
  background: #fff3e0;
  border-radius: 8px;
}

.chart-info h4 {
  margin: 0 0 10px 0;
  color: #f57c00;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.info-item {
  font-size: 14px;
  color: #5d4037;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .export-buttons {
    flex-direction: column;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>
