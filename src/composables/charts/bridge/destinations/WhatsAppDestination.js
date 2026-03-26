export class WhatsAppDestination {
  constructor() {
    this.type = 'whatsapp'
    this.supportedFormats = ['png', 'jpg', 'pdf']
  }

  async send(exportData, options = {}) {
    const phone = options.phone
    if (!phone) {
      throw new Error('Falta el numero de WhatsApp')
    }

    const filename = options.filename || exportData.filename
    const message = options.message || 'Te comparto una grafica exportada.'

   
    const text = encodeURIComponent(
      `${message}\n\nArchivo: ${filename}\nFormato: ${exportData.format.toUpperCase()}\n\nNota: Descarga la grafica y enviela como archivo/imagen desde WhatsApp.`
    )

    const normalizedPhone = String(phone).replace(/\D/g, '')
    const url = `https://wa.me/${normalizedPhone}?text=${text}`
    window.open(url, '_blank')

    return {
      success: true,
      channel: 'whatsapp',
      phone: normalizedPhone,
      filename,
      format: exportData.format,
      message: 'Se abrio WhatsApp (envia el archivo manualmente)'
    }
  }
}
