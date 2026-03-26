/**
 * Decorador de Gráfica de Pastel
 */
export class PieChartDecorator {
  constructor(chart) {
    this.chart = chart
    this.type = 'pie'
  }

  /**
   * Renderiza la gráfica de pastel con configuración específica
   * @returns {Object} Configuración completa de la gráfica de pastel
   */
  render() {
    const baseConfig = this.chart.render()
    
    return {
      ...baseConfig,
      type: this.type,
      data: this.processPieData(baseConfig.data),
      options: this.getPieOptions(baseConfig.options),
      metadata: {
        ...baseConfig.metadata,
        chartType: 'pie',
        decorator: 'PieChartDecorator',
        features: this.getPieFeatures()
      }
    }
  }

  /**
   * Procesa los datos específicamente para gráfica de pastel
   * @param {Array} data - Datos originales
   * @returns {Object} Datos formateados para Chart.js pie chart
   */
  processPieData(data) {
    // Si los datos ya están en formato de gráfica de pastel, retornarlos
    if (data.labels && data.datasets) {
      return data
    }

    // Convertir datos genéricos a formato de gráfica de pastel
    const labels = data.map(item => item.label || item.name || item.categoria || 'Sin etiqueta')
    const values = data.map(item => item.value || item.count || item.total || item.calificacion || 0)
    const colors = this.generateColors(data.length)

    return {
      labels: labels,
      datasets: [{
        label: 'Datos',
        data: values,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 2,
        hoverOffset: 4
      }]
    }
  }

  /**
   * Genera colores para la gráfica de pastel
   * @param {number} count - Número de segmentos
   * @returns {Object} Colores de fondo y borde
   */
  generateColors(count) {
    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#36A2EB', '#FFCE56', '#E7E9ED', '#71B37C', '#519D9E'
    ]

    const background = []
    const border = []

    for (let i = 0; i < count; i++) {
      const color = baseColors[i % baseColors.length]
      background.push(color + '80') // 80 = 50% opacidad
      border.push(color)
    }

    return { background, border }
  }

  /**
   * Obtiene las opciones específicas para gráfica de pastel
   * @param {Object} baseOptions - Opciones base
   * @returns {Object} Opciones configuradas para pastel
   */
  getPieOptions(baseOptions) {
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 1000,
        easing: 'easeOutQuart'
      },
      cutout: '0%', // 0% = pastel completo, 50% = donut
      rotation: -90,
      circumference: 360
    }
  }

  /**
   * Obtiene las características específicas del decorador
   * @returns {Array} Lista de características
   */
  getPieFeatures() {
    return [
      'circular-visualization',
      'percentage-calculation',
      'interactive-segments',
      'legend-positioning',
      'color-auto-generation',
      'hover-effects',
      'rotation-animation'
    ]
  }

  /**
   * Convierte la gráfica a donut (opción adicional)
   * @param {number} percentage - Porcentaje del centro vacío (0-70)
   * @returns {PieChartDecorator} Nueva instancia con configuración de donut
   */
  toDonut(percentage = 50) {
    return new DonutChartDecorator(this.chart, percentage)
  }

  /**
   * Actualiza los datos manteniendo el formato de pastel
   * @param {Array} newData - Nuevos datos
   */
  updateData(newData) {
    this.chart.updateData(newData)
  }

  /**
   * Actualiza las opciones manteniendo la configuración de pastel
   * @param {Object} newOptions - Nuevas opciones
   */
  updateOptions(newOptions) {
    this.chart.updateOptions(newOptions)
  }
}

/**
 * Variante específica para gráfica de donut
 */
export class DonutChartDecorator extends PieChartDecorator {
  constructor(chart, cutoutPercentage = 50) {
    super(chart)
    this.cutoutPercentage = cutoutPercentage
    this.type = 'doughnut'
  }

  getPieOptions(baseOptions) {
    const options = super.getPieOptions(baseOptions)
    return {
      ...options,
      cutout: `${this.cutoutPercentage}%`,
      plugins: {
        ...options.plugins,
        title: {
          ...options.plugins.title,
          text: options.plugins.title.text + ' (Donut)'
        }
      }
    }
  }

  getPieFeatures() {
    return [
      ...super.getPieFeatures(),
      'center-hole',
      'donut-style'
    ]
  }
}
