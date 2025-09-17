# 🧪 Prueba del Flujo Completo - Registro de Usuario y Score

## ✅ Flujo Corregido Implementado

He corregido el flujo para seguir exactamente la documentación de tu API:

### 📋 **Flujo Correcto:**
```
1. 🔍 Buscar Usuario por username (GET /api/Players/by-username/{username})
   ↓ Si no existe (404)
2. 🆕 Crear Usuario (POST /api/Players)
   ↓ Usuario obtenido/creado
3. 🎮 Crear Sesión de Juego (POST /api/GameSessions)
   ↓ Sesión creada con score
4. 📊 Actualizar High Scores (GET /api/GameSessions/top-scores/10)
```

## 🔍 **Logging Detallado Implementado**

Ahora verás estos logs en la consola:

### **Paso 1: Búsqueda de Usuario**
```
🔍 PASO 1: Buscando jugador existente: PlayerName
ℹ️ PASO 1: Jugador no encontrado (404)
```

### **Paso 2: Creación de Usuario**
```
🆕 PASO 2: Creando nuevo jugador: PlayerName
📝 Request para crear jugador: {username: "PlayerName"}
✅ PASO 2 COMPLETADO: Jugador creado exitosamente: {playerId: 1, username: "PlayerName"}
👤 Nuevo ID: 1, Username: PlayerName
```

### **Paso 3: Creación de Sesión**
```
🎮 INICIANDO registro completo de sesión: {username: "PlayerName", score: 1500, maxLevel: 1}
👤 Usuario obtenido/creado: {playerId: 1, username: "PlayerName"}
📝 Creando sesión de juego: {playerId: 1, score: 1500, maxLevelReached: 1}
✅ Sesión de juego creada exitosamente: {gameSessionId: 1, playerId: 1, score: 1500}
🏆 Score 1500 registrado para PlayerName (Nivel 1)
```

### **Paso 4: Actualización de High Scores**
```
📊 Actualizando lista de high scores...
📈 High scores actualizados (10 scores): [...]
🏆 ¡NUEVO HIGH SCORE! Posición #3 para PlayerName
```

## 🧪 **Cómo Probar**

### **1. Ejecutar la Aplicación**
```bash
ng serve
```

### **2. Abrir DevTools**
- Presiona F12
- Ve a la pestaña "Console"

### **3. Jugar una Partida**
1. Ingresa un nombre de jugador
2. Juega hasta obtener un score
3. Observa los logs en la consola

### **4. Verificar Endpoints Manualmente**

**Health Check:**
```bash
curl -X GET "https://localhost:7019/api/Health" -k
```

**Crear Usuario:**
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

**Ver Top Scores:**
```bash
curl -X GET "https://localhost:7019/api/GameSessions/top-scores/10" -k
```

## 🔧 **Verificaciones de la API**

### **Endpoint POST /api/Players debe aceptar:**
```json
{
  "username": "PlayerName"
}
```

### **Endpoint POST /api/GameSessions debe aceptar:**
```json
{
  "playerId": 1,
  "score": 1500,
  "maxLevelReached": 1
}
```

### **Respuestas Esperadas:**

**Player creado (201):**
```json
{
  "playerId": 1,
  "username": "PlayerName",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**GameSession creada (201):**
```json
{
  "gameSessionId": 1,
  "playerId": 1,
  "score": 1500,
  "maxLevelReached": 1,
  "playedAt": "2024-01-15T10:30:00Z",
  "player": {
    "playerId": 1,
    "username": "PlayerName"
  }
}
```

## 🚨 **Posibles Errores y Soluciones**

### **❌ Error 400 en POST /api/Players**
**Posibles causas:**
- Username vacío o nulo
- Username ya existe (si tu API no permite duplicados)
- Formato de request incorrecto

**Verificar:**
```json
{
  "username": "PlayerName"  // ← Debe ser string no vacío
}
```

### **❌ Error 400 en POST /api/GameSessions**
**Posibles causas:**
- playerId no existe
- score o maxLevelReached inválidos
- Formato de request incorrecto

**Verificar:**
```json
{
  "playerId": 1,           // ← Debe existir en tabla Players
  "score": 1500,           // ← Debe ser número positivo
  "maxLevelReached": 1     // ← Debe ser número positivo
}
```

### **❌ Error de CORS**
Agregar en tu API:
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

## 🎯 **Resultado Esperado**

Después de jugar una partida, deberías ver:

1. ✅ Usuario creado/encontrado en la base de datos
2. ✅ Sesión de juego registrada con el score
3. ✅ Score aparece en la lista de high scores (si está en el top 10)
4. ✅ Indicador 🟢 "Conectado a BD" en la pantalla de High Scores

¡El flujo ahora sigue exactamente la documentación de tu API! 🚀
