export class EmailDestination {
  constructor() {
    this.type = 'email'
    this.supportedFormats = ['png', 'jpg', 'pdf', 'svg']
  }

  async send(exportData, options = {}) {
    const to = options.to
    if (!to) {
      throw new Error('Falta el correo destinatario')
    }

    const filename = options.filename || exportData.filename

    
    const subject = encodeURIComponent(options.subject || 'Grafica exportada')
    const body = encodeURIComponent(
      `${options.body || 'Se genero una grafica exportada.'}\n\nArchivo: ${filename}\nFormato: ${exportData.format.toUpperCase()}\n\nNota: Por limitaciones del navegador, el archivo no se adjunta automaticamente. Descargalo y adjuntalo en el correo.`
    )

    window.location.href = `gmail:${encodeURIComponent(to)}?subject=${subject}&body=${body}`

    return {
      success: true,
      channel: 'email',
      to,
      filename,
      format: exportData.format,
      message: 'Se abrio el cliente de correo (adjunta el archivo manualmente)'
    }
  }
}
