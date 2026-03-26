/**
 * Decorador de Tema para Gráficas
 */
export class ThemeDecorator {
  constructor(chart, theme = 'light') {
    this.chart = chart
    this.theme = theme
  }

  render() {
    const baseConfig = this.chart.render()
    
    return {
      ...baseConfig,
      options: {
        ...baseConfig.options,
        ...this.getThemeConfig(),
        plugins: {
          ...baseConfig.options.plugins,
          legend: {
            ...baseConfig.options.plugins.legend,
            ...this.getLegendTheme()
          },
          title: {
            ...baseConfig.options.plugins.title,
            ...this.getTitleTheme()
          },
          tooltip: {
            ...baseConfig.options.plugins.tooltip,
            ...this.getTooltipTheme()
          }
        }
      },
      metadata: {
        ...baseConfig.metadata,
        theme: this.theme,
        decorator: 'ThemeDecorator'
      }
    }
  }

  getThemeConfig() {
    const themes = {
      light: {
        backgroundColor: '#ffffff',
        borderColor: '#e0e0e0',
        textColor: '#333333',
        gridColor: '#f0f0f0',
        tickColor: '#666666'
      },
      
      dark: {
        backgroundColor: '#1a1a1a',
        borderColor: '#404040',
        textColor: '#ffffff',
        gridColor: '#333333',
        tickColor: '#cccccc'
      },

      blue: {
        backgroundColor: '#f0f8ff',
        borderColor: '#b3d9ff',
        textColor: '#0066cc',
        gridColor: '#e6f3ff',
        tickColor: '#004d99'
      },

      green: {
        backgroundColor: '#f0fff0',
        borderColor: '#90ee90',
        textColor: '#2d5016',
        gridColor: '#e8f5e8',
        tickColor: '#4a7c2e'
      },

      purple: {
        backgroundColor: '#faf5ff',
        borderColor: '#d8b2fe',
        textColor: '#6b46c1',
        gridColor: '#f3e8ff',
        tickColor: '#553c9a'
      },

      orange: {
        backgroundColor: '#fff7ed',
        borderColor: '#fed7aa',
        textColor: '#c2410c',
        gridColor: '#ffedd5',
        tickColor: '#9a3412'
      }
    }

    const themeConfig = themes[this.theme] || themes.light

    return {
      scales: {
        x: {
          grid: {
            color: themeConfig.gridColor,
            borderColor: themeConfig.borderColor
          },
          ticks: {
            color: themeConfig.tickColor
          }
        },
        y: {
          grid: {
            color: themeConfig.gridColor,
            borderColor: themeConfig.borderColor
          },
          ticks: {
            color: themeConfig.tickColor
          }
        }
      }
    }
  }

  getLegendTheme() {
    const legendThemes = {
      light: {
        labels: {
          color: '#333333',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },
      
      dark: {
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },

      blue: {
        labels: {
          color: '#0066cc',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },

      green: {
        labels: {
          color: '#2d5016',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },

      purple: {
        labels: {
          color: '#6b46c1',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },

      orange: {
        labels: {
          color: '#c2410c',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      }
    }

    return legendThemes[this.theme] || legendThemes.light
  }

  getTitleTheme() {
    const titleThemes = {
      light: {
        color: '#333333',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      
      dark: {
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },

      blue: {
        color: '#0066cc',
        font: {
          size: 16,
          weight: 'bold'
        }
      },

      green: {
        color: '#2d5016',
        font: {
          size: 16,
          weight: 'bold'
        }
      },

      purple: {
        color: '#6b46c1',
        font: {
          size: 16,
          weight: 'bold'
        }
      },

      orange: {
        color: '#c2410c',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }

    return titleThemes[this.theme] || titleThemes.light
  }

  getTooltipTheme() {
    const tooltipThemes = {
      light: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333333',
        bodyColor: '#666666',
        borderColor: '#e0e0e0',
        borderWidth: 1
      },
      
      dark: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#cccccc',
        borderColor: '#404040',
        borderWidth: 1
      },

      blue: {
        backgroundColor: 'rgba(240, 248, 255, 0.9)',
        titleColor: '#0066cc',
        bodyColor: '#004d99',
        borderColor: '#b3d9ff',
        borderWidth: 1
      },

      green: {
        backgroundColor: 'rgba(240, 255, 240, 0.9)',
        titleColor: '#2d5016',
        bodyColor: '#4a7c2e',
        borderColor: '#90ee90',
        borderWidth: 1
      },

      purple: {
        backgroundColor: 'rgba(250, 245, 255, 0.9)',
        titleColor: '#6b46c1',
        bodyColor: '#553c9a',
        borderColor: '#d8b2fe',
        borderWidth: 1
      },

      orange: {
        backgroundColor: 'rgba(255, 247, 237, 0.9)',
        titleColor: '#c2410c',
        bodyColor: '#9a3412',
        borderColor: '#fed7aa',
        borderWidth: 1
      }
    }

    return tooltipThemes[this.theme] || tooltipThemes.light
  }

  /**
   * Cambia el tema de la gráfica
   * @param {string} newTheme - Nuevo tema
   */
  setTheme(newTheme) {
    this.theme = newTheme
  }

  /**
   * Obtiene los temas disponibles
   * @returns {Array} Lista de temas disponibles
   */
  getAvailableThemes() {
    return ['light', 'dark', 'blue', 'green', 'purple', 'orange']
  }

  /**
   * Verifica si un tema es válido
   * @param {string} theme - Tema a verificar
   * @returns {boolean} True si es válido
   */
  isValidTheme(theme) {
    return this.getAvailableThemes().includes(theme)
  }

  /**
   * Obtiene el tema actual
   * @returns {string} Tema actual
   */
  getCurrentTheme() {
    return this.theme
  }
}
