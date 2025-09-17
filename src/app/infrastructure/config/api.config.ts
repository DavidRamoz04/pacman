import { InjectionToken } from '@angular/core';
import { ApiConfig } from '../../domain/models/api.models';
import { environment } from '../../../environments/environment';

// Token de inyección para la configuración de la API
export const API_CONFIG_TOKEN = new InjectionToken<ApiConfig>('API_CONFIG');

// Configuración por defecto de la API
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'https://localhost:7019/api',
  timeout: 10000
};

// Función para obtener la configuración según el entorno
export function getApiConfig(): ApiConfig {
  try {
    // Usar configuración del environment si está disponible
    if (environment?.apiConfig) {
      return {
        baseUrl: environment.apiConfig.baseUrl,
        timeout: environment.apiConfig.timeout
      };
    }
    
    // Fallback a configuración por defecto
    return DEFAULT_API_CONFIG;
  } catch (error) {
    console.warn('Error loading API config from environment, using default:', error);
    return DEFAULT_API_CONFIG;
  }
}

// Función para verificar si las características están habilitadas
export function isFeatureEnabled(feature: keyof typeof environment.features): boolean {
  try {
    return environment?.features?.[feature] ?? true;
  } catch (error) {
    return true; // Por defecto, habilitar todas las características
  }
}

// Configuraciones legacy para compatibilidad
export const API_CONFIGS = {
  development: {
    baseUrl: 'https://localhost:7019/api',
    timeout: 10000
  },
  production: {
    baseUrl: 'https://your-production-api.com/api',
    timeout: 15000
  },
  staging: {
    baseUrl: 'https://your-staging-api.com/api',
    timeout: 12000
  }
};
