# 🔗 Prueba de Conexión - Backend https://localhost:7019

## ✅ Configuración Actualizada

La aplicación está configurada para conectarse a tu backend en:
**`https://localhost:7019/api`**

## 🧪 Verificar Conexión

### 1. Verificar que tu API esté ejecutándose
Abre tu navegador y ve a:
```
https://localhost:7019/api/Health
```

**Respuesta esperada:**
```json
{
  "status": "Healthy",
  "databaseStatus": "Connected",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "statistics": {
    "totalPlayers": 0,
    "totalGameSessions": 0
  }
}
```

### 2. Probar desde la aplicación Angular

**Ejecutar la aplicación:**
```bash
ng serve
```

**Verificar en la consola del navegador:**
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Ejecuta:
```javascript
// Verificar configuración
console.log('API Base URL:', window.location.origin);

// Probar conexión (después de que cargue la app)
window.testPacmanApi();
```

### 3. Verificar visualmente

1. **Ejecuta la aplicación** con `ng serve`
2. **Ve a "PUNTUACIONES ALTAS"**
3. **Observa el indicador:**
   - 🟢 **Conectado a BD** = API funcionando
   - 🔴 **Sin conexión BD** = API no disponible

## 🔧 Solución de Problemas

### ❌ Error de Certificado SSL
Si ves errores de certificado SSL, puedes:

1. **Aceptar el certificado** en el navegador yendo a `https://localhost:7019`
2. **O configurar tu API** para usar HTTP en desarrollo

### ❌ Error de CORS
Si ves errores de CORS, agrega en tu API:

```csharp
// En Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Después de var app = builder.Build();
app.UseCors("AllowAngularApp");
```

### ❌ API no responde
1. Verifica que tu API esté ejecutándose
2. Verifica que el puerto sea 7019
3. Verifica que use HTTPS

## 📊 Endpoints que debes implementar

### Mínimos para funcionar:
- `GET /api/Health` ✅ Health check
- `GET /api/GameSessions/top-scores/10` ✅ Top scores
- `POST /api/GameSessions` ✅ Crear sesión
- `GET /api/Players/by-username/{username}` ✅ Buscar jugador
- `POST /api/Players` ✅ Crear jugador

### Ejemplo de GameSession POST:
```json
{
  "playerId": 1,
  "score": 15000,
  "maxLevelReached": 5
}
```

## 🎮 Flujo de Prueba Completo

1. **Inicia tu API** en `https://localhost:7019`
2. **Ejecuta Angular** con `ng serve`
3. **Juega una partida** del Pacman
4. **Ve a High Scores** y verifica:
   - Indicador de conexión
   - Que aparezca tu puntaje
5. **Detén tu API** y verifica:
   - Indicador cambie a desconectado
   - Aplicación siga funcionando con localStorage

## ✅ Todo Listo

Si ves 🟢 **Conectado a BD** en la pantalla de High Scores, ¡la integración está funcionando perfectamente!

Los puntajes se guardarán automáticamente en tu base de datos. 🏆
