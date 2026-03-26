/**
 * Decorador de Exportación para Gráficas
 */
import { ExportChannel } from '../bridge/ExportChannel'
import { DownloadDestination } from '../bridge/destinations/DownloadDestination'
import { EmailDestination } from '../bridge/destinations/EmailDestination'
import { WhatsAppDestination } from '../bridge/destinations/WhatsAppDestination'

export class ExportDecorator {
  constructor(chart) {
    this.chart = chart
    this.destinations = this.createDestinations()
  }

  render() {
    const baseConfig = this.chart.render()
    
    return {
      ...baseConfig,
      exportable: true,
      exportOptions: this.getExportOptions(),
      exportChart: (format, filename) => this.exportChart(baseConfig, format, filename),
      exportToChannel: (format, channel, options) => this.exportToChannel(baseConfig, format, channel, options),
      availableChannels: Object.keys(this.destinations),
      metadata: {
        ...baseConfig.metadata,
        exportable: true,
        decorator: 'ExportDecorator',
        channels: Object.keys(this.destinations)
      }
    }
  }

  createDestinations() {
    return {
      download: new DownloadDestination(),
      email: new EmailDestination(),
      whatsapp: new WhatsAppDestination()
    }
  }

  async exportToChannel(chartConfig, format, channel = 'download', options = {}) {
    const destination = this.destinations[channel]
    if (!destination) {
      throw new Error(`Canal de envío no soportado: ${channel}`)
    }

    const exportData = await this.generateExportDataBlob(chartConfig, format, options.filename)
    const bridge = new ExportChannel(destination)
    return await bridge.send(exportData, { ...options, filename: exportData.filename })
  }

  async generateExportDataBlob(chartConfig, format, filename = null) {
    const finalFilename = filename || this.generateFilename(format)

    switch (format.toLowerCase()) {
      case 'png': {
        const blob = await this.createCanvasBlob('image/png', 0.9)
        return { blob, format: 'png', filename: finalFilename, chartType: chartConfig.type }
      }
      case 'jpg':
      case 'jpeg': {
        const blob = await this.createCanvasBlob('image/jpeg', 0.8)
        return { blob, format: 'jpg', filename: finalFilename, chartType: chartConfig.type }
      }
      case 'svg': {
        const svgContent = this.generateSVG(chartConfig)
        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        return { blob, format: 'svg', filename: finalFilename, chartType: chartConfig.type }
      }
      case 'pdf': {
             throw new Error('PDF por canal Bridge no está soportado aún. Usa descarga directa.')
      }
      case 'csv': {
        const csvContent = this.generateCSV(chartConfig)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        return { blob, format: 'csv', filename: finalFilename, chartType: chartConfig.type }
      }
      case 'json': {
        const jsonContent = JSON.stringify(chartConfig, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        return { blob, format: 'json', filename: finalFilename, chartType: chartConfig.type }
      }
      default:
        throw new Error(`Formato de exportación no soportado: ${format}`)
    }
  }

  async createCanvasBlob(mimeType, quality) {
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      throw new Error('No se encontró el canvas de la gráfica')
    }

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality)
    })

    if (!blob) {
      throw new Error('No se pudo generar el archivo de exportación')
    }

    return blob
  }

  getExportOptions() {
    return {
      png: {
        enabled: true,
        quality: 0.9,
        backgroundColor: '#ffffff'
      },
      jpg: {
        enabled: true,
        quality: 0.8,
        backgroundColor: '#ffffff'
      },
      svg: {
        enabled: true,
        scalable: true
      },
      pdf: {
        enabled: true,
        format: 'a4',
        orientation: 'landscape'
      },
      csv: {
        enabled: true,
        includeHeaders: true
      },
      json: {
        enabled: true,
        formatted: true
      }
    }
  }

  /**
   * Exporta la gráfica en el formato especificado
   * @param {Object} chartConfig - Configuración de la gráfica
   * @param {string} format - Formato de exportación
   * @param {string} filename - Nombre del archivo (opcional)
   * @returns {Promise} Promesa de exportación
   */
  async exportChart(chartConfig, format, filename = null) {
    const finalFilename = filename || this.generateFilename(format)

    switch (format.toLowerCase()) {
      case 'png':
        return this.exportToPNG(chartConfig, finalFilename)
      case 'jpg':
      case 'jpeg':
        return this.exportToJPG(chartConfig, finalFilename)
      case 'svg':
        return this.exportToSVG(chartConfig, finalFilename)
      case 'pdf':
        return this.exportToPDF(chartConfig, finalFilename)
      case 'csv':
        return this.exportToCSV(chartConfig, finalFilename)
      case 'json':
        return this.exportToJSON(chartConfig, finalFilename)
      default:
        throw new Error(`Formato de exportación no soportado: ${format}`)
    }
  }

  /**
   * Exporta a formato PNG
   */
  async exportToPNG(chartConfig, filename) {
    try {
      const blob = await this.createCanvasBlob('image/png', 0.9)

      this.downloadBlob(blob, filename)
      return { success: true, filename, format: 'png' }
    } catch (error) {
      console.error('Error exportando a PNG:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Exporta a formato JPG
   */
  async exportToJPG(chartConfig, filename) {
    try {
      const blob = await this.createCanvasBlob('image/jpeg', 0.8)

      this.downloadBlob(blob, filename)
      return { success: true, filename, format: 'jpg' }
    } catch (error) {
      console.error('Error exportando a JPG:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Exporta a formato SVG
   */
  async exportToSVG(chartConfig, filename) {
    try {
      const svgContent = this.generateSVG(chartConfig)
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      this.downloadBlob(blob, filename)
      return { success: true, filename, format: 'svg' }
    } catch (error) {
      console.error('Error exportando a SVG:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Exporta a formato PDF
   */
  async exportToPDF(chartConfig, filename) {
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF('landscape', 'mm', 'a4')

      const canvas = document.querySelector('canvas')
      if (!canvas) {
        throw new Error('No se encontró el canvas de la gráfica')
      }

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 280
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      pdf.save(filename)

      return { success: true, filename, format: 'pdf' }
    } catch (error) {
      console.error('Error exportando a PDF:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Exporta a formato CSV
   */
  async exportToCSV(chartConfig, filename) {
    try {
      const csvContent = this.generateCSV(chartConfig)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      this.downloadBlob(blob, filename)
      return { success: true, filename, format: 'csv' }
    } catch (error) {
      console.error('Error exportando a CSV:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Exporta a formato JSON
   */
  async exportToJSON(chartConfig, filename) {
    try {
      const jsonContent = JSON.stringify(chartConfig, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      this.downloadBlob(blob, filename)
      return { success: true, filename, format: 'json' }
    } catch (error) {
      console.error('Error exportando a JSON:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Genera el contenido SVG
   */
  generateSVG(chartConfig) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="white"/>
  <text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="16">
    ${chartConfig.options.plugins.title.text || 'Gráfica'}
  </text>
  <!-- Aquí iría el contenido real de la gráfica -->
</svg>`
  }

  /**
   * Genera el contenido CSV
   */
  generateCSV(chartConfig) {
    if (!chartConfig.data || !chartConfig.data.labels) {
      return 'No hay datos disponibles para exportar'
    }

    const labels = chartConfig.data.labels
    const datasets = chartConfig.data.datasets || []

    let csv = 'Etiqueta'
    datasets.forEach((dataset, index) => {
      csv += `,${dataset.label || `Dataset ${index + 1}`}`
    })
    csv += '\n'

    labels.forEach((label, labelIndex) => {
      csv += `"${label}"`
      datasets.forEach(dataset => {
        csv += `,${dataset.data[labelIndex] || 0}`
      })
      csv += '\n'
    })

    return csv
  }

  /**
   * Genera nombre de archivo automático
   */
  generateFilename(format) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    const chartType = this.chart.type || 'chart'
    return `${chartType}_${timestamp}.${format}`
  }

  /**
   * Descarga un blob como archivo
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Obtiene los formatos de exportación disponibles
   * @returns {Array} Lista de formatos disponibles
   */
  getAvailableFormats() {
    return ['png', 'jpg', 'svg', 'pdf', 'csv', 'json']
  }

  /**
   * Verifica si un formato es soportado
   * @param {string} format - Formato a verificar
   * @returns {boolean} True si es soportado
   */
  isFormatSupported(format) {
    return this.getAvailableFormats().includes(format.toLowerCase())
  }
}
