/**
 * Abstracción principal del patrón Bridge para Canales de Exportación
 * 
 * Esta clase define la interfaz común para todos los canales de exportación
 * permitiendo que la implementación varíe independientemente.
 */
export class ExportChannel {
  constructor(destination) {
    this.destination = destination
  }

  /**
   * Envía datos exportados a través del canal específico
   * @param {Object} exportData - Datos exportados (blob, formato, etc.)
   * @param {Object} options - Opciones específicas del canal
   * @returns {Promise<Object>} Resultado del envío
   */
  async send(exportData, options = {}) {
    if (!this.destination) {
      throw new Error('No se ha configurado un destino para el canal de exportación')
    }

    try {
      return await this.destination.send(exportData, options)
    } catch (error) {
      throw new Error(`Error en el canal de exportación: ${error.message}`)
    }
  }

  /**
   * Obtiene información del canal
   * @returns {Object} Información del canal
   */
  getInfo() {
    return {
      name: this.destination.constructor.name,
      type: this.destination.type || 'unknown',
      supportedFormats: this.destination.supportedFormats || []
    }
  }
}
