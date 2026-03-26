export class DownloadDestination {
  constructor() {
    this.type = 'download'
    this.supportedFormats = ['png', 'jpg', 'svg', 'pdf', 'csv', 'json']
  }

  async send(exportData, options = {}) {
    const filename = options.filename || exportData.filename
    const blob = exportData.blob

    if (!blob) {
      throw new Error('No hay blob para descargar')
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return {
      success: true,
      channel: 'download',
      filename,
      format: exportData.format
    }
  }
}
