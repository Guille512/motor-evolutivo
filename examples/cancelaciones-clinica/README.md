# Ejemplo: Vigía de Cancelaciones de Clínica

> Caso real sanitizado — inspirado en un consultorio odontológico.

## 🎯 Qué hace

Monitorea las cancelaciones de turnos en una clínica dental y:

1. **Detecta** cancelaciones registradas en una hoja de cálculo.
2. **Notifica** al equipo vía WhatsApp con un resumen.
3. **Activa la lista de espera** — ofrece el turno liberado al siguiente paciente en cola.

## 📊 Flujo

```
Google Sheets (Cancelaciones)
        │
        ▼
  vigía-cancelaciones
        │
        ├──▶ WhatsApp: "Se canceló el turno de las 15:00"
        │
        └──▶ Lista de Espera → Ofrecer turno al siguiente paciente
```

## ⚙️ Configuración

```yaml
# config/vigia.yaml
vigias:
  - name: "cancelaciones-clinica"
    cron: "*/10 * * * *"        # cada 10 minutos
    enabled: true
    source: "google-sheets"     # de dónde lee
    notify: ["whatsapp"]        # a dónde notifica
```

## 🚀 Ejecución

```bash
# Dry-run (no envía mensajes reales)
npm run motevo -- run cancelaciones-clinica --dry-run

# Ejecución real
npm run motevo -- run cancelaciones-clinica
```

## 📝 Notas

- **No contiene datos reales de pacientes.** Todos los nombres y números son ficticios.
- Las credenciales se cargan desde variables de entorno (ver `.env.example` en la raíz).
- Este ejemplo demuestra el patrón "Sheets → Vigía → Notificación" que puede adaptarse a cualquier clínica.
