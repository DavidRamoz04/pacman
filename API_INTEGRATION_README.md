# Integración API REST - Juego Pacman

## 📋 Descripción

Se ha implementado una integración completa con la API REST para el manejo de high scores del juego Pacman. El sistema funciona con un enfoque híbrido que utiliza la base de datos cuando está disponible y localStorage como fallback.

## 🏗️ Arquitectura Implementada

### Modelos de Datos (`api.models.ts`)
- **Player**: Información del jugador
- **GameSession**: Sesión de juego con puntaje y nivel
- **PlayerStatistics**: Estadísticas del jugador
- **HighScore**: Modelo extendido para compatibilidad

### Servicios

#### ApiService (`api.service.ts`)
Servicio principal para comunicación con la API REST:
- ✅ Gestión de jugadores (CRUD)
- ✅ Gestión de sesiones de juego (CRUD)
- ✅ Obtención de top scores globales
- ✅ Estadísticas de jugadores
- ✅ Health checks de la API
- ✅ Manejo automático de conexión/desconexión

#### HighScoreService (Actualizado)
Servicio híbrido que combina API y localStorage:
- ✅ Fallback automático a localStorage si la API no está disponible
- ✅ Sincronización automática con la API cuando se restablece la conexión
- ✅ Métodos síncronos y asíncronos para compatibilidad

### Componentes Actualizados

#### GameComponent
- ✅ Integración con API para guardar puntajes
- ✅ Manejo de errores con fallback automático

#### HighScoresComponent
- ✅ Indicador de estado de conexión con la base de datos
- ✅ Botón de actualización manual
- ✅ Indicador de carga
- ✅ Mensajes de error informativos
- ✅ Estilos actualizados con tema del juego

## ⚙️ Configuración

### 1. Configuración de la API

Edita el archivo `src/app/infrastructure/config/api.config.ts`:

```typescript
export const API_CONFIGS = {
  development: {
    baseUrl: 'http://localhost:5000/api', // Tu URL de desarrollo
    timeout: 10000
  },
  production: {
    baseUrl: 'https://tu-api-produccion.com/api', // Tu URL de producción
    timeout: 15000
  }
};
```

### 2. Endpoints de la API

La aplicación espera los siguientes endpoints:

#### Jugadores
- `GET /api/Players` - Obtener todos los jugadores
- `POST /api/Players` - Crear nuevo jugador
- `GET /api/Players/{id}` - Obtener jugador por ID
- `GET /api/Players/by-username/{username}` - Obtener jugador por username

#### Sesiones de Juego
- `GET /api/GameSessions/top-scores/{count}` - Top scores globales
- `POST /api/GameSessions` - Crear nueva sesión
- `GET /api/GameSessions/player/{playerId}/top-scores/{count}` - Top scores del jugador

#### Health Check
- `GET /api/Health` - Estado de la API
- `GET /api/Health/database` - Estado de la base de datos

### 3. Modelos de Request/Response

#### CreatePlayerRequest
```json
{
  "username": "string"
}
```

#### CreateGameSessionRequest
```json
{
  "playerId": 0,
  "score": 0,
  "maxLevelReached": 0
}
```

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales
- **Conexión híbrida**: API + localStorage como fallback
- **Detección automática de conectividad**
- **Retry automático en errores de red**
- **Indicadores visuales de estado**
- **Manejo robusto de errores**
- **Compatibilidad con sistema existente**

### ✅ Mejoras de UX
- Indicador de conexión a base de datos (🟢/🔴)
- Botón de actualización manual
- Spinner de carga
- Mensajes de error informativos
- Transiciones suaves entre estados

### ✅ Manejo de Errores
- Interceptor HTTP global
- Retry automático para requests fallidos
- Fallback a localStorage en caso de error
- Mensajes de error localizados en español

## 🔧 Uso

### Inicialización Automática
El sistema se inicializa automáticamente al cargar la aplicación:
1. Verifica conectividad con la API
2. Carga high scores desde la fuente disponible
3. Configura listeners para cambios de conectividad

### Guardado de Puntajes
```typescript
// El sistema maneja automáticamente el guardado
this.highScoreService.addScore(score, playerName).subscribe({
  next: (isNewHighScore) => {
    if (isNewHighScore) {
      console.log('¡Nuevo high score!');
    }
  },
  error: (error) => {
    // Error manejado automáticamente con fallback
  }
});
```

### Obtención de High Scores
```typescript
// Método asíncrono (recomendado)
this.highScoreService.getHighScoresAsync().subscribe(scores => {
  console.log('High scores:', scores);
});

// Método síncrono (compatibilidad)
const scores = this.highScoreService.getHighScores();
```

## 🛠️ Desarrollo

### Estructura de Archivos Creados/Modificados

```
src/app/
├── domain/models/
│   └── api.models.ts                    # ✅ Nuevo
├── infrastructure/
│   ├── services/
│   │   └── api.service.ts              # ✅ Nuevo
│   ├── interceptors/
│   │   └── http-error.interceptor.ts   # ✅ Nuevo
│   └── config/
│       └── api.config.ts               # ✅ Nuevo
├── application/services/
│   └── high-score.service.ts           # ✅ Modificado
├── presentation/components/
│   ├── game/
│   │   └── game.component.ts           # ✅ Modificado
│   └── high-scores/
│       ├── high-scores.component.ts    # ✅ Modificado
│       ├── high-scores.component.html  # ✅ Modificado
│       └── high-scores.component.scss  # ✅ Modificado
└── app.config.ts                       # ✅ Modificado
```

## 🧪 Testing

### Escenarios de Prueba
1. **API disponible**: Verificar guardado y carga desde base de datos
2. **API no disponible**: Verificar fallback a localStorage
3. **Pérdida de conexión**: Verificar transición automática
4. **Recuperación de conexión**: Verificar sincronización automática

### Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve

# Ejecutar tests
ng test
```

## 📝 Notas Importantes

1. **Compatibilidad**: El sistema mantiene 100% de compatibilidad con el código existente
2. **Performance**: Los high scores se cachean localmente para mejorar la experiencia
3. **Seguridad**: Se implementa manejo seguro de errores sin exponer información sensible
4. **Escalabilidad**: La arquitectura permite fácil extensión para nuevas funcionalidades

## 🔄 Estados del Sistema

| Estado | Descripción | Indicador Visual |
|--------|-------------|------------------|
| Conectado | API disponible y funcionando | 🟢 Conectado a BD |
| Desconectado | API no disponible, usando localStorage | 🔴 Sin conexión BD |
| Cargando | Obteniendo datos de la API | Spinner animado |
| Error | Error temporal, reintentando | Mensaje de error + fallback |

## 🎯 Próximos Pasos

Para completar la integración:

1. **Configurar tu API**: Actualizar URLs en `api.config.ts`
2. **Verificar endpoints**: Asegurar que tu API implementa todos los endpoints requeridos
3. **Testing**: Probar todos los escenarios de conectividad
4. **Despliegue**: Configurar URLs de producción

¡La integración está lista para usar! 🚀
