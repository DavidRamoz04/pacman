# 🚀 Guía Rápida - Integración API

## ⚡ Inicio Rápido (5 minutos)

### 1. Configurar URL de tu API
Edita: `src/environments/environment.ts`
```typescript
export const environment = {
  apiConfig: {
    baseUrl: 'https://localhost:7019/api', // ← URL configurada
    timeout: 10000
  }
};
```

### 2. Verificar que tu API esté corriendo
- Asegúrate de que tu API esté ejecutándose en `https://localhost:7019`
- Verifica que responda en: `https://localhost:7019/api/Health`

### 3. Ejecutar la aplicación
```bash
ng serve
```

## 🧪 Probar la Integración

### Desde la Consola del Navegador:
```javascript
// Abrir DevTools (F12) y ejecutar:
window.testPacmanApi();
```

### Desde el Componente de High Scores:
- Ve a "PUNTUACIONES ALTAS"
- Observa el indicador: 🟢 Conectado a BD / 🔴 Sin conexión BD
- Usa el botón 🔄 para actualizar

### Agregar el Widget de Estado (Opcional):
En cualquier componente, agrega:
```html
<app-api-status></app-api-status>
```

## 📊 Endpoints que tu API debe implementar:

### Mínimos Requeridos:
- `GET /api/Health` - Health check
- `GET /api/GameSessions/top-scores/10` - Top 10 scores
- `POST /api/GameSessions` - Crear nueva sesión
- `GET /api/Players/by-username/{username}` - Buscar jugador
- `POST /api/Players` - Crear jugador

### Ejemplo de Response para Top Scores:
```json
[
  {
    "gameSessionId": 1,
    "playerId": 1,
    "score": 15000,
    "maxLevelReached": 5,
    "playedAt": "2024-01-15T10:30:00Z",
    "player": {
      "playerId": 1,
      "username": "PlayerOne",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
]
```

## 🔧 Solución de Problemas

### ❌ Error de CORS
Agrega en tu API:
```csharp
// En Program.cs o Startup.cs
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

### ❌ API no responde
- Verifica que la URL en `api.config.ts` sea correcta
- Verifica que tu API esté ejecutándose
- La aplicación funcionará con localStorage automáticamente

### ❌ Datos no se guardan
- Revisa la consola del navegador para errores
- Verifica que los endpoints POST funcionen
- El sistema usará localStorage como fallback

## 🎯 Estados del Sistema

| Indicador | Significado | Acción |
|-----------|-------------|---------|
| 🟢 Conectado a BD | API funcionando | Datos se guardan en BD |
| 🔴 Sin conexión BD | API no disponible | Datos se guardan localmente |
| ⏳ Cargando... | Obteniendo datos | Esperar |
| ❌ Error | Error temporal | Se reintenta automáticamente |

## 🎮 ¡Listo para Jugar!

Una vez configurado:
1. **Juega una partida** - Los puntajes se guardarán automáticamente
2. **Ve a High Scores** - Verás los puntajes de la base de datos
3. **Sin API** - El juego funciona igual con localStorage

¡La integración es completamente transparente para el usuario! 🏆
