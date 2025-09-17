# 🔍 Debug - Registro de Usuarios

## 🚨 Problema Identificado
El registro de usuarios no se está realizando correctamente en la API.

## ✅ Mejoras Implementadas

### 1. **Logging Detallado Agregado**
He añadido logging completo en todo el flujo:

```typescript
// En ApiService.findOrCreatePlayer()
🔍 Buscando jugador: {username}
✅ Jugador encontrado: {player data}
❌ Error buscando jugador (404): Not Found
🆕 Creando nuevo jugador: {username}
✅ Jugador creado: {new player data}

// En ApiService.recordGameSession()
🎮 Registrando sesión de juego: {username, score, maxLevel}
📝 Request para crear sesión: {playerId, score, maxLevelReached}
✅ Sesión creada exitosamente: {session data}

// En HighScoreService.addScore()
🎯 Añadiendo score: {score, playerName, maxLevel, useApi}
💾 Guardando score en API: {playerName, score, maxLevel}
🏆 ¿Es nuevo high score? {boolean}
```

### 2. **Manejo Mejorado de Niveles**
- Ahora se pasa el nivel actual del juego (`this.level`) en lugar de un valor fijo
- El GameComponent envía el nivel correcto al HighScoreService

### 3. **Detección Mejorada de Errores 404**
- Mejor detección cuando un usuario no existe
- Manejo robusto de diferentes formatos de error 404

## 🧪 Cómo Debuggear

### 1. **Abrir DevTools (F12)**
```javascript
// En la consola del navegador, ejecutar:

// Verificar configuración actual
console.log('API Base URL:', 'https://localhost:7019/api');

// Probar conexión básica
fetch('https://localhost:7019/api/Health')
  .then(r => r.json())
  .then(data => console.log('✅ API Health:', data))
  .catch(err => console.error('❌ API Error:', err));
```

### 2. **Jugar una Partida y Observar Logs**
1. Juega una partida del Pacman
2. Cuando termine, observa la consola
3. Deberías ver esta secuencia:

```
🎮 Guardando high score: {score: 1500, player: "PlayerName", level: 1}
🎯 Añadiendo score: {score: 1500, playerName: "PlayerName", maxLevel: 1, useApi: true}
💾 Guardando score en API: {playerName: "PlayerName", score: 1500, maxLevel: 1}
🎮 Registrando sesión de juego: {username: "PlayerName", score: 1500, maxLevel: 1}
🔍 Buscando jugador: PlayerName
❌ Error buscando jugador (404): Not Found
🆕 Creando nuevo jugador: PlayerName
✅ Jugador creado: {playerId: 1, username: "PlayerName", ...}
📝 Request para crear sesión: {playerId: 1, score: 1500, maxLevelReached: 1}
✅ Sesión creada exitosamente: {gameSessionId: 1, ...}
```

### 3. **Verificar Endpoints Manualmente**

**Verificar Health:**
```bash
curl -X GET "https://localhost:7019/api/Health" -k
```

**Crear Usuario Manualmente:**
```bash
curl -X POST "https://localhost:7019/api/Players" \
  -H "Content-Type: application/json" \
  -d '{"username": "TestUser"}' -k
```

**Buscar Usuario:**
```bash
curl -X GET "https://localhost:7019/api/Players/by-username/TestUser" -k
```

**Crear Sesión:**
```bash
curl -X POST "https://localhost:7019/api/GameSessions" \
  -H "Content-Type: application/json" \
  -d '{"playerId": 1, "score": 1500, "maxLevelReached": 1}' -k
```

## 🔧 Posibles Problemas y Soluciones

### ❌ Error: "CORS policy"
**Solución:** Agregar en tu API:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowAngularApp");
```

### ❌ Error: "SSL certificate"
**Solución:** 
1. Ve a `https://localhost:7019` en el navegador
2. Acepta el certificado SSL
3. O configura tu API para usar HTTP en desarrollo

### ❌ Error: "404 Not Found" en endpoints
**Verificar que tu API tenga estos endpoints:**
- `POST /api/Players`
- `GET /api/Players/by-username/{username}`
- `POST /api/GameSessions`
- `GET /api/GameSessions/top-scores/{count}`

### ❌ Error: "400 Bad Request" al crear usuario
**Posibles causas:**
1. Username vacío o nulo
2. Username ya existe (si tu API no permite duplicados)
3. Formato de request incorrecto

**Verificar formato:**
```json
{
  "username": "PlayerName"
}
```

### ❌ Error: "400 Bad Request" al crear sesión
**Verificar formato:**
```json
{
  "playerId": 1,
  "score": 1500,
  "maxLevelReached": 1
}
```

## 📊 Verificar en Base de Datos

Si tienes acceso directo a tu base de datos:

```sql
-- Ver usuarios creados
SELECT * FROM Players ORDER BY CreatedAt DESC;

-- Ver sesiones de juego
SELECT * FROM GameSessions ORDER BY PlayedAt DESC;

-- Ver top scores
SELECT p.Username, gs.Score, gs.MaxLevelReached, gs.PlayedAt
FROM GameSessions gs
JOIN Players p ON gs.PlayerId = p.PlayerId
ORDER BY gs.Score DESC
LIMIT 10;
```

## 🎯 Próximos Pasos

1. **Ejecuta la aplicación** con `ng serve`
2. **Abre DevTools** (F12) y ve a la pestaña Console
3. **Juega una partida** y observa los logs
4. **Reporta los errores específicos** que veas en la consola
5. **Verifica que tu API esté respondiendo** en los endpoints mencionados

Con el logging detallado que agregué, ahora podremos identificar exactamente dónde está fallando el proceso de registro. 🔍
