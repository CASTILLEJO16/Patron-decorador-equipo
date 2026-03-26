/**
 * Componente Base para el Patrón Decorador de Gráficas
 */
export class BaseChart {
  constructor(data, options = {}) {
    this.data = data
    this.options = options
    this.type = 'base'
  }

  /**
   * Método principal de renderizado
   * @returns {Object} Configuración básica de la gráfica
   */
  render() {
    return {
      type: this.type,
      data: this.processData(),
      options: this.getOptions(),
      metadata: this.getMetadata()
    }
  }

  /**
   * Procesa los datos brutos para la gráfica
   * @returns {Array} Datos procesados
   */
  processData() {
    return this.data || []
  }

  /**
   * Obtiene las opciones básicas de configuración
   * @returns {Object} Opciones de configuración
   */
  getOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: this.options.title || 'Gráfica'
        }
      }
    }
  }

  /**
   * Obtiene metadatos de la gráfica
   * @returns {Object} Metadatos
   */
  getMetadata() {
    return {
      createdAt: new Date().toISOString(),
      dataCount: this.data?.length || 0,
      version: '1.0.0'
    }
  }

  /**
   * Actualiza los datos de la gráfica
   * @param {Array} newData - Nuevos datos
   */
  updateData(newData) {
    this.data = newData
  }

  /**
   * Actualiza las opciones de la gráfica
   * @param {Object} newOptions - Nuevas opciones
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions }
  }
}
