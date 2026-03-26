/**
 * Decorador de Animación para Gráficas
 */
export class AnimationDecorator {
  constructor(chart, animationType = 'bounce', duration = 1000) {
    this.chart = chart
    this.animationType = animationType
    this.duration = duration
  }

  render() {
    const baseConfig = this.chart.render()
    
    return {
      ...baseConfig,
      options: {
        ...baseConfig.options,
        animation: this.getAnimationConfig(),
        interaction: {
          ...baseConfig.options.interaction,
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      },
      metadata: {
        ...baseConfig.metadata,
        animated: true,
        animationType: this.animationType,
        animationDuration: this.duration,
        decorator: 'AnimationDecorator'
      }
    }
  }

  getAnimationConfig() {
    const animations = {
      bounce: {
        duration: this.duration,
        easing: 'easeOutBounce',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 100
          }
          return delay
        },
        onComplete: () => {
          console.log('Animación bounce completada')
        }
      },
      
      fade: {
        duration: this.duration,
        easing: 'easeInOutQuad',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 50
          }
          return delay
        },
        from: 0,
        to: 1,
        onComplete: () => {
          console.log('Animación fade completada')
        }
      },

      slide: {
        duration: this.duration,
        easing: 'easeOutCubic',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 75
          }
          return delay
        },
        onComplete: () => {
          console.log('Animación slide completada')
        }
      },

      rotate: {
        duration: this.duration,
        easing: 'easeInOutSine',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 100
          }
          return delay
        },
        onComplete: () => {
          console.log('Animación rotate completada')
        }
      },

      scale: {
        duration: this.duration,
        easing: 'easeOutElastic',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 80
          }
          return delay
        },
        from: 0,
        to: 1,
        onComplete: () => {
          console.log('Animación scale completada')
        }
      },

      pulse: {
        duration: this.duration,
        easing: 'easeInOutQuad',
        delay: (context) => {
          let delay = 0
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 60
          }
          return delay
        },
        loop: true,
        onComplete: () => {
          console.log('Animación pulse completada')
        }
      }
    }

    return animations[this.animationType] || animations.bounce
  }

  /**
   * Configuración específica para gráficas de pastel
   */
  getPieAnimationConfig() {
    const baseConfig = this.getAnimationConfig()
    
    return {
      ...baseConfig,
      animateRotate: true,
      animateScale: this.animationType === 'scale',
      animateRotate: this.animationType !== 'scale'
    }
  }

  /**
   * Cambia el tipo de animación
   * @param {string} newType - Nuevo tipo de animación
   */
  setAnimationType(newType) {
    this.animationType = newType
  }

  /**
   * Cambia la duración de la animación
   * @param {number} newDuration - Nueva duración en milisegundos
   */
  setDuration(newDuration) {
    this.duration = newDuration
  }

  /**
   * Obtiene los tipos de animación disponibles
   * @returns {Array} Lista de tipos de animación
   */
  getAvailableAnimations() {
    return ['bounce', 'fade', 'slide', 'rotate', 'scale', 'pulse']
  }

  /**
   * Verifica si un tipo de animación es válido
   * @param {string} type - Tipo de animación a verificar
   * @returns {boolean} True si es válido
   */
  isValidAnimationType(type) {
    return this.getAvailableAnimations().includes(type)
  }
}
