// tedConfigLoader.ts
interface ColorSet {
  name: string;
  description: string;
  textColor: string;
  backgroundColor: string;
}

interface ColorScheme {
  name: string;
  description: string;
  screen: {
    textColor: string;
    backgroundColor: string;
  };
  colorSets: {
    color1: ColorSet;
    color2: ColorSet;
    color3: ColorSet;
    color4: ColorSet;
  };
}

interface TEDColorConfig {
  version: string;
  description: string;
  availableColors: string[];
  colorSchemes: {
    dark: ColorScheme;
    bright: ColorScheme;
    custom: ColorScheme;
  };
  buttonTypeMapping: Record<string, string>;
  userPreferences: {
    activeScheme: string;
    customButtonOverrides: Record<string, { textColor: string; backgroundColor: string }>;
  };
}

interface TEDConfig {
  tedColorConfig: TEDColorConfig;
}

class TEDColorConfigLoader {
  private config: TEDConfig | null = null;
  private configPath: string = '/ted-color-config.json'; // Adjust path as needed

  /**
   * Load TED color configuration from JSON file
   */
  async loadConfig(): Promise<TEDConfig> {
    try {
      const response = await fetch(this.configPath);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      this.config = await response.json();
      return this.config!;
    } catch (error) {
      console.warn('Failed to load TED color config, using defaults:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Apply color scheme from JSON configuration
   */
  applyColorScheme(schemeName: keyof TEDColorConfig['colorSchemes']): void {
    if (!this.config) {
      console.error('Config not loaded. Call loadConfig() first.');
      return;
    }

    const scheme = this.config.tedColorConfig.colorSchemes[schemeName];
    if (!scheme) {
      console.error(`Color scheme '${schemeName}' not found.`);
      return;
    }

    const root = document.documentElement;

    // Apply screen colors
    root.style.setProperty('--ted-screen-text', `var(--${scheme.screen.textColor})`);
    root.style.setProperty('--ted-screen-background', `var(--${scheme.screen.backgroundColor})`);

    // Apply color sets
    Object.entries(scheme.colorSets).forEach(([colorSetKey, colorSet]) => {
      root.style.setProperty(`--ted-${colorSetKey}-text`, `var(--${colorSet.textColor})`);
      root.style.setProperty(`--ted-${colorSetKey}-background`, `var(--${colorSet.backgroundColor})`);
    });

    // Save user preference
    this.config.tedColorConfig.userPreferences.activeScheme = schemeName;
    this.saveUserPreferences();
  }

  /**
   * Get available color schemes
   */
  getAvailableSchemes(): Array<{ key: string; name: string; description: string }> {
    if (!this.config) return [];
    
    return Object.entries(this.config.tedColorConfig.colorSchemes).map(([key, scheme]) => ({
      key,
      name: scheme.name,
      description: scheme.description
    }));
  }

  /**
   * Get available colors from palette
   */
  getAvailableColors(): string[] {
    return this.config?.tedColorConfig.availableColors || [];
  }

  /**
   * Update custom color scheme
   */
  updateCustomScheme(updates: Partial<ColorScheme>): void {
    if (!this.config) return;

    const customScheme = this.config.tedColorConfig.colorSchemes.custom;
    Object.assign(customScheme, updates);
    
    this.saveConfig();
    this.applyColorScheme('custom');
  }

  /**
   * Override individual button colors
   */
  setButtonColorOverride(buttonId: string, textColor: string, backgroundColor: string): void {
    if (!this.config) return;

    this.config.tedColorConfig.userPreferences.customButtonOverrides[buttonId] = {
      textColor,
      backgroundColor
    };

    // Apply the override immediately
    const buttonElement = document.querySelector(`[data-button-id="${buttonId}"]`) as HTMLElement;
    if (buttonElement) {
      buttonElement.style.color = `var(--${textColor})`;
      buttonElement.style.backgroundColor = `var(--${backgroundColor})`;
    }

    this.saveUserPreferences();
  }

  /**
   * Load and apply saved user preferences
   */
  loadUserPreferences(): void {
    const saved = localStorage.getItem('ted-color-preferences');
    if (saved && this.config) {
      try {
        const preferences = JSON.parse(saved);
        this.config.tedColorConfig.userPreferences = {
          ...this.config.tedColorConfig.userPreferences,
          ...preferences
        };
        
        // Apply saved scheme
        this.applyColorScheme(preferences.activeScheme || 'dark');
        
        // Apply custom button overrides
        Object.entries(preferences.customButtonOverrides || {}).forEach(([buttonId, colors]: [string, any]) => {
          const buttonElement = document.querySelector(`[data-button-id="${buttonId}"]`) as HTMLElement;
          if (buttonElement) {
            buttonElement.style.color = `var(--${colors.textColor})`;
            buttonElement.style.backgroundColor = `var(--${colors.backgroundColor})`;
          }
        });
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      }
    }
  }

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(): void {
    if (this.config) {
      localStorage.setItem('ted-color-preferences', 
        JSON.stringify(this.config.tedColorConfig.userPreferences)
      );
    }
  }

  /**
   * Save entire config (for custom scheme updates)
   */
  private async saveConfig(): Promise<void> {
    // Note: This would typically save to a server endpoint
    // For client-side only, we save to localStorage
    if (this.config) {
      localStorage.setItem('ted-color-config', JSON.stringify(this.config));
    }
  }

  /**
   * Get default configuration if JSON fails to load
   */
  private getDefaultConfig(): TEDConfig {
    return {
      tedColorConfig: {
        version: "1.0",
        description: "TED Color Scheme Configuration",
        availableColors: [
          "black", "blue", "green", "cyan", "red", "magenta", "brown",
          "light-gray", "white", "light-blue", "light-green", "light-cyan",
          "light-red", "light-magenta", "yellow", "dark-gray"
        ],
        colorSchemes: {
          dark: {
            name: "Dark Environment",
            description: "Best for dark operating environments",
            screen: { textColor: "green", backgroundColor: "black" },
            colorSets: {
              color1: { name: "Normal Buttons", description: "", textColor: "green", backgroundColor: "black" },
              color2: { name: "Significant DA", description: "", textColor: "yellow", backgroundColor: "black" },
              color3: { name: "Utility Buttons", description: "", textColor: "cyan", backgroundColor: "black" },
              color4: { name: "Significant Radio", description: "", textColor: "red", backgroundColor: "black" }
            }
          },
          bright: {
            name: "Bright Environment",
            description: "Best for bright operating environments",
            screen: { textColor: "black", backgroundColor: "light-gray" },
            colorSets: {
              color1: { name: "Normal Buttons", description: "", textColor: "black", backgroundColor: "light-gray" },
              color2: { name: "Significant DA", description: "", textColor: "brown", backgroundColor: "light-gray" },
              color3: { name: "Utility Buttons", description: "", textColor: "blue", backgroundColor: "light-gray" },
              color4: { name: "Significant Radio", description: "", textColor: "red", backgroundColor: "light-gray" }
            }
          },
          custom: {
            name: "Custom Colors",
            description: "User-defined color scheme",
            screen: { textColor: "green", backgroundColor: "black" },
            colorSets: {
              color1: { name: "Normal Buttons", description: "", textColor: "green", backgroundColor: "black" },
              color2: { name: "Significant DA", description: "", textColor: "yellow", backgroundColor: "black" },
              color3: { name: "Utility Buttons", description: "", textColor: "cyan", backgroundColor: "black" },
              color4: { name: "Significant Radio", description: "", textColor: "red", backgroundColor: "black" }
            }
          }
        },
        buttonTypeMapping: {
          "intercom-ringback": "color1",
          "intercom-override": "color1",
          "control-monitor": "color1",
          "normal-radio": "color1",
          "sidetone-radio": "color1",
          "preempt-radio": "color1",
          "interphone": "color2",
          "special-function": "color3",
          "dial-digit": "color3",
          "emergency-radio": "color4"
        },
        userPreferences: {
          activeScheme: "dark",
          customButtonOverrides: {}
        }
      }
    };
  }
}

// Export singleton instance
export const tedColorConfig = new TEDColorConfigLoader();

// Initialize and load config when module is imported
export async function initializeTEDColors(): Promise<void> {
  await tedColorConfig.loadConfig();
  tedColorConfig.loadUserPreferences();
}