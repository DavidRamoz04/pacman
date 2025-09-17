export const environment = {
  production: true,
  apiConfig: {
    baseUrl: 'https://your-production-api.com/api', // Cambiar por tu URL de producción
    timeout: 15000
  },
  features: {
    enableApiIntegration: true,
    enableLocalStorageFallback: true,
    enableDebugLogging: false
  }
};
