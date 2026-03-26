/**
 * Decorador de Filtros para Gráficas
 */
export class FilterDecorator {
  constructor(chart, filters = {}) {
    this.chart = chart
    this.filters = filters
  }

  render() {
    const baseConfig = this.chart.render()
    const filteredData = this.applyFilters(baseConfig.data)
    
    return {
      ...baseConfig,
      data: filteredData,
      options: {
        ...baseConfig.options,
        plugins: {
          ...baseConfig.options.plugins,
          title: {
            ...baseConfig.options.plugins.title,
            text: this.addFilterInfoToTitle(baseConfig.options.plugins.title.text)
          }
        }
      },
      metadata: {
        ...baseConfig.metadata,
        filters: this.filters,
        filtered: true,
        originalCount: this.getOriginalDataCount(baseConfig.data),
        filteredCount: this.getFilteredDataCount(filteredData),
        decorator: 'FilterDecorator'
      }
    }
  }

  applyFilters(data) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return data
    }

    // Si es un array de objetos, filtrar
    if (Array.isArray(data)) {
      return data.filter(item => this.passesAllFilters(item))
    }

    // Si es formato de Chart.js con datasets
    if (data.datasets && data.labels) {
      const filteredIndices = data.labels
        .map((label, index) => ({ label, index }))
        .filter(({ label }) => this.passesLabelFilters(label))

      return {
        labels: filteredIndices.map(({ label }) => label),
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          data: filteredIndices.map(({ index }) => dataset.data[index])
        }))
      }
    }

    return data
  }

  passesAllFilters(item) {
    // Filtro por semestre
    if (this.filters.semestre && item.semestre !== this.filters.semestre) {
      return false
    }

    // Filtro por carrera
    if (this.filters.carrera && item.id_carrera !== this.filters.carrera) {
      return false
    }

    // Filtro por rango de fechas
    if (this.filters.fechaInicio && item.fecha) {
      const itemDate = new Date(item.fecha)
      const startDate = new Date(this.filters.fechaInicio)
      if (itemDate < startDate) return false
    }

    if (this.filters.fechaFin && item.fecha) {
      const itemDate = new Date(item.fecha)
      const endDate = new Date(this.filters.fechaFin)
      if (itemDate > endDate) return false
    }

    // Filtro por rango de calificaciones
    if (this.filters.calificacionMin !== undefined && item.calificacion < this.filters.calificacionMin) {
      return false
    }

    if (this.filters.calificacionMax !== undefined && item.calificacion > this.filters.calificacionMax) {
      return false
    }

    // Filtro por género
    if (this.filters.genero && item.genero !== this.filters.genero) {
      return false
    }

    // Filtro por estado (activo/inactivo)
    if (this.filters.activo !== undefined && item.activo !== this.filters.activo) {
      return false
    }

    // Filtro personalizado por texto
    if (this.filters.searchText) {
      const searchText = this.filters.searchText.toLowerCase()
      const searchableText = `${item.nombre || ''} ${item.apellido_paterno || ''} ${item.apellido_materno || ''} ${item.email || ''}`.toLowerCase()
      if (!searchableText.includes(searchText)) {
        return false
      }
    }

    return true
  }

  passesLabelFilters(label) {
    if (!this.filters.labelFilter) return true
    
    const filterText = this.filters.labelFilter.toLowerCase()
    return label.toLowerCase().includes(filterText)
  }

  addFilterInfoToTitle(originalTitle) {
    const activeFilters = Object.keys(this.filters).filter(key => 
      this.filters[key] !== undefined && this.filters[key] !== null && this.filters[key] !== ''
    )

    if (activeFilters.length === 0) {
      return originalTitle
    }

    return `${originalTitle} (Filtrado: ${activeFilters.length} filtros activos)`
  }

  getOriginalDataCount(data) {
    if (Array.isArray(data)) return data.length
    if (data.datasets && data.labels) return data.labels.length
    return 0
  }

  getFilteredDataCount(data) {
    if (Array.isArray(data)) return data.length
    if (data.datasets && data.labels) return data.labels.length
    return 0
  }

  /**
   * Actualiza los filtros
   * @param {Object} newFilters - Nuevos filtros
   */
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters }
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters() {
    this.filters = {}
  }

  /**
   * Obtiene los filtros activos
   * @returns {Object} Filtros con valores no nulos
   */
  getActiveFilters() {
    const active = {}
    Object.keys(this.filters).forEach(key => {
      const value = this.filters[key]
      if (value !== undefined && value !== null && value !== '') {
        active[key] = value
      }
    })
    return active
  }

  /**
   * Verifica si hay filtros activos
   * @returns {boolean} True si hay filtros activos
   */
  hasActiveFilters() {
    return Object.keys(this.getActiveFilters()).length > 0
  }
}
