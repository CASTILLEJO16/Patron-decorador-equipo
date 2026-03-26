/**
 * Composable principal para el Sistema de Decoradores de Gráficas
 */
import { ref, computed, watch } from 'vue'
import { BaseChart } from './BaseChart'
import { PieChartDecorator, DonutChartDecorator } from './decorators/PieChartDecorator'
import { FilterDecorator } from './decorators/FilterDecorator'
import { AnimationDecorator } from './decorators/AnimationDecorator'
import { ThemeDecorator } from './decorators/ThemeDecorator'
import { ExportDecorator } from './decorators/ExportDecorator'

export function useChartDecorator(initialData, initialOptions = {}) {
  // Estado reactivo
  const data = ref(initialData || [])
  const options = ref(initialOptions)
  const chartConfig = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Computed properties
  const hasData = computed(() => {
    return data.value && data.value.length > 0
  })

  const dataCount = computed(() => {
    return data.value?.length || 0
  })

  /**
   * Crea una gráfica de pastel con decoradores
   * @param {Object} config - Configuración de la gráfica
   * @returns {Object} Configuración completa de la gráfica
   */
  const createPieChart = (config = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const {
        filters = {},
        animation = 'bounce',
        theme = 'light',
        enableExport = true,
        customOptions = {}
      } = config

      // Crear gráfica base
      let chart = new BaseChart(data.value, { ...options.value, ...customOptions })

      // Aplicar decoradores en orden
      chart = new PieChartDecorator(chart)

      if (Object.keys(filters).length > 0) {
        chart = new FilterDecorator(chart, filters)
      }

      chart = new ThemeDecorator(chart, theme)
      chart = new AnimationDecorator(chart, animation)

      if (enableExport) {
        chart = new ExportDecorator(chart)
      }

      chartConfig.value = chart.render()
      return chartConfig.value

    } catch (err) {
      error.value = err.message
      console.error('Error creando gráfica de pastel:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea una gráfica de donut con decoradores
   * @param {Object} config - Configuración de la gráfica
   * @returns {Object} Configuración completa de la gráfica
   */
  const createDonutChart = (config = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const {
        filters = {},
        animation = 'bounce',
        theme = 'light',
        enableExport = true,
        cutoutPercentage = 50,
        customOptions = {}
      } = config

      // Crear gráfica base
      let chart = new BaseChart(data.value, { ...options.value, ...customOptions })

      // Aplicar decoradores en orden
      chart = new DonutChartDecorator(chart, cutoutPercentage)

      if (Object.keys(filters).length > 0) {
        chart = new FilterDecorator(chart, filters)
      }

      chart = new ThemeDecorator(chart, theme)
      chart = new AnimationDecorator(chart, animation)

      if (enableExport) {
        chart = new ExportDecorator(chart)
      }

      chartConfig.value = chart.render()
      return chartConfig.value

    } catch (err) {
      error.value = err.message
      console.error('Error creando gráfica de donut:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea una gráfica con decoradores personalizados
   * @param {Array} decorators - Array de funciones decoradoras
   * @param {Object} customOptions - Opciones personalizadas
   * @returns {Object} Configuración completa de la gráfica
   */
  const createCustomChart = (decorators, customOptions = {}) => {
    try {
      isLoading.value = true
      error.value = null

      // Crear gráfica base
      let chart = new BaseChart(data.value, { ...options.value, ...customOptions })

      // Aplicar decoradores personalizados
      decorators.forEach(decoratorFn => {
        chart = decoratorFn(chart)
      })

      chartConfig.value = chart.render()
      return chartConfig.value

    } catch (err) {
      error.value = err.message
      console.error('Error creando gráfica personalizada:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza los datos de la gráfica
   * @param {Array} newData - Nuevos datos
   */
  const updateData = (newData) => {
    data.value = newData
  }

  /**
   * Actualiza las opciones de la gráfica
   * @param {Object} newOptions - Nuevas opciones
   */
  const updateOptions = (newOptions) => {
    options.value = { ...options.value, ...newOptions }
  }

  /**
   * Exporta la gráfica actual
   * @param {string} format - Formato de exportación
   * @param {string} filename - Nombre del archivo
   */
  const exportChart = async (format, filename = null) => {
    if (!chartConfig.value || !chartConfig.value.exportChart) {
      throw new Error('La gráfica actual no soporta exportación')
    }

    return await chartConfig.value.exportChart(format, filename)
  }

  /**
   * Obtiene los metadatos de la gráfica actual
   * @returns {Object} Metadatos de la gráfica
   */
  const getMetadata = () => {
    return chartConfig.value?.metadata || {}
  }

  /**
   * Verifica si la gráfica tiene una característica específica
   * @param {string} feature - Característica a verificar
   * @returns {boolean} True si tiene la característica
   */
  const hasFeature = (feature) => {
    const metadata = getMetadata()
    return metadata.features?.includes(feature) || false
  }

  /**
   * Obtiene información sobre los decoradores aplicados
   * @returns {Array} Lista de decoradores aplicados
   */
  const getAppliedDecorators = () => {
    const metadata = getMetadata()
    const decorators = []
    
    if (metadata.decorator) {
      decorators.push(metadata.decorator)
    }
    
    if (metadata.filters) {
      decorators.push('FilterDecorator')
    }
    
    if (metadata.animated) {
      decorators.push('AnimationDecorator')
    }
    
    if (metadata.theme) {
      decorators.push('ThemeDecorator')
    }
    
    if (metadata.exportable) {
      decorators.push('ExportDecorator')
    }
    
    return decorators
  }

  /**
   * Recrea la gráfica con la misma configuración
   */
  const refreshChart = () => {
    if (!chartConfig.value) return

    const metadata = getMetadata()
    const chartType = metadata.chartType

    if (chartType === 'pie') {
      createPieChart({
        filters: metadata.filters || {},
        animation: metadata.animationType || 'bounce',
        theme: metadata.theme || 'light',
        enableExport: metadata.exportable || false
      })
    } else if (chartType === 'doughnut') {
      createDonutChart({
        filters: metadata.filters || {},
        animation: metadata.animationType || 'bounce',
        theme: metadata.theme || 'light',
        enableExport: metadata.exportable || false,
        cutoutPercentage: 50
      })
    }
  }

  // Watchers para actualizar automáticamente
  watch([data, options], () => {
    if (chartConfig.value) {
      refreshChart()
    }
  }, { deep: true })

  return {
    // Estado
    data,
    options,
    chartConfig,
    isLoading,
    error,
    
    // Computados
    hasData,
    dataCount,
    
    // Métodos principales
    createPieChart,
    createDonutChart,
    createCustomChart,
    
    // Métodos de utilidad
    updateData,
    updateOptions,
    exportChart,
    getMetadata,
    hasFeature,
    getAppliedDecorators,
    refreshChart
  }
}

/**
 * Función de conveniencia para crear gráficas rápidamente
 */
export function createQuickPieChart(data, options = {}) {
  const { createPieChart } = useChartDecorator(data, options)
  return createPieChart()
}

export function createQuickDonutChart(data, options = {}) {
  const { createDonutChart } = useChartDecorator(data, options)
  return createDonutChart()
}
