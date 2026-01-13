# Trading App Frontend

Aplicación web para consumir la API de Trading creada con FastAPI.

## Características

- 📊 Resumen del mercado con top ganadores, perdedores y más activos
- 📈 Lista de activos con búsqueda y paginación
- 🎨 Interfaz moderna con TailwindCSS
- ⚡ Construida con React y Vite

## Requisitos

- Node.js 16+
- API de Trading corriendo en `http://localhost:8000`

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Uso

1. Asegúrate de que la API de Trading esté corriendo en el puerto 8000
2. Inicia la aplicación con `npm run dev`
3. Abre `http://localhost:3000` en tu navegador

## Endpoints Utilizados

- `GET /api/v1/markets` - Lista de mercados
- `GET /api/v1/markets/stocks/overview` - Resumen del mercado
- `GET /api/v1/markets/stocks/assets` - Lista de activos
