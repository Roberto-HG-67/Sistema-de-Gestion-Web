# 📊 Sistema de Gestión Alimentika - Guía de Usuario

## 🎯 Descripción General

Sistema web integrado para la gestión de inventario, análisis de ventas y control de productos de Alimentika. El sistema incluye 7 módulos principales con carga automática de datos, filtros avanzados, gráficos interactivos y funciones de exportación.

---

## 🚀 Inicio Rápido

1. **Iniciar el servidor web:**
   - Abrir terminal en la carpeta del proyecto
   - Ejecutar: `python -m http.server 8000`
   - Abrir navegador en: `http://localhost:8000`

2. **Usar la tarea de VS Code:**
   - Presionar `Ctrl+Shift+B`
   - Seleccionar: "🚀 Iniciar Servidor Web"
   - Abrir navegador en: `http://localhost:8000`

---

## 📑 Módulos del Sistema

### 1️⃣ **SKU - Listado de Productos**

**Función:** Visualización completa del catálogo de productos con formatos especiales.

**Características:**
- ✅ Carga automática del archivo `Excel/SKU.xlsx`
- ✅ Filtros en cada columna para búsqueda rápida
- ✅ Formateo automático de números:
  - **Costo Neto**: Formato miles con símbolo $ (ej: $1.500)
  - **Margen**: Formato porcentaje sin decimales (ej: 25%)
  - **Costo Venta**: Formato miles con $ y 2 decimales (ej: $1.250,50)
- ✅ Títulos de columnas optimizados para caber en una fila
- ✅ Texto reducido para evitar scroll horizontal

**Uso:**
1. La ventana carga automáticamente al iniciar
2. Usar los campos de filtro bajo cada columna para buscar
3. Los datos se actualizan en tiempo real

---

### 2️⃣ **Proveedores**

**Función:** Gestión y consulta de información de proveedores.

**Características:**
- ✅ Carga automática del archivo `Excel/Proveedores.xlsx`
- ✅ Filtros en cada columna
- ✅ Incluye RUT y Razón Social para autocompletado
- ✅ Datos disponibles para el módulo de Ingreso de Productos

**Uso:**
1. Cambiar a la pestaña "Proveedores"
2. Los datos se cargan automáticamente
3. Usar filtros para buscar proveedores específicos

---

### 3️⃣ **Stock Actual**

**Función:** Visualización del stock actual en bodega Ñuñoa.

**Características:**
- ✅ Carga automática del archivo `Excel/Stock Actual.xlsx`
- ✅ Muestra: SKU, Nombre, UM, Stock Actual (Cd Ñuñoa)
- ✅ Filtros en cada columna
- ✅ Datos procesados automáticamente

**Uso:**
1. Cambiar a la pestaña "Stock Actual"
2. Los datos se procesan y muestran automáticamente
3. El stock mostrado corresponde a la columna "Cd Ñuñoa" del Excel original

---

### 4️⃣ **Consolidado**

**Función:** Unificación de múltiples archivos Excel en uno solo (BBDD).

**Características:**
- ✅ Permite seleccionar hasta 5 archivos Excel
- ✅ Unifica todos los archivos en uno solo
- ✅ Agrega columnas calculadas:
  - **Fecha Entero**: Función ENTERO aplicada a la columna Fecha
  - **ID Entero**: Función ENTERO aplicada a la columna IDProducto
- ✅ Genera archivo `BBDD.xlsx` con hoja "Hoja 1"
- ✅ Descarga automática del archivo consolidado

**Uso:**
1. Cambiar a la pestaña "Consolidado"
2. Hacer clic en el selector de archivos
3. Seleccionar los archivos Excel a consolidar (pueden ser menos de 5)
4. Hacer clic en "🔄 Consolidar y Crear BBDD"
5. El archivo se descarga automáticamente

---

### 5️⃣ **Consumo**

**Función:** Análisis de consumo de productos con agrupaciones temporales y gráficos.

**Características:**
- ✅ Carga automática de datos de BBDD y SKU
- ✅ Filtros dinámicos:
  - **Agrupación**: Anual, Mensual, Semanal
  - **Año**: 2024, 2025, 2026
- ✅ Columnas dinámicas según filtros:
  - **Anual**: 2024, 2025, 2026
  - **Mensual**: 2024-ENE, 2024-FEB, etc.
  - **Semanal**: 2026-SEM 1, 2026-SEM 2, etc.
- ✅ Gráfico de barras interactivo
- ✅ Etiquetas auto-ajustables en ambos ejes
- ✅ Filtros en columnas de la tabla

**Uso:**
1. Cambiar a la pestaña "Consumo"
2. Seleccionar tipo de agrupación (Anual/Mensual/Semanal)
3. Seleccionar año de análisis
4. Los datos y gráfico se actualizan automáticamente
5. Usar filtros de columna para búsquedas específicas

**Nota sobre semanas:**
- Semana 1: 29/12/25 - 04/01/26
- Semana 2: 05/01/26 - 11/01/26
- Y así sucesivamente...

---

### 6️⃣ **Análisis de Ventas**

**Función:** Análisis detallado de ventas por producto con filtros avanzados.

**Características:**
- ✅ Carga automática de datos de BBDD y SKU
- ✅ Columnas calculadas:
  - **Número de ventas**: Cantidad de transacciones por SKU
  - **Cantidad Vendida**: Suma total de unidades vendidas
- ✅ Filtros avanzados:
  - **Fecha Inicio**: Fecha inicial del período
  - **Fecha Fin**: Fecha final del período
  - **Vendedor**: Filtro por vendedor específico o todos
- ✅ Filtros en cada columna de la tabla
- ✅ Gráfico de barras: Top 20 productos más vendidos
- ✅ Actualización dinámica según filtros

**Uso:**
1. Cambiar a la pestaña "Análisis de Ventas"
2. Seleccionar rango de fechas (por defecto: último mes)
3. Opcionalmente, seleccionar un vendedor específico
4. Los datos y gráfico se actualizan automáticamente
5. Usar filtros de columna para análisis detallado

---

### 7️⃣ **Ingreso de Productos**

**Función:** Formulario para registrar ingresos de productos y enviar por correo.

**Características:**
- ✅ Autocompletado inteligente:
  - **RUT → Comercializadora**: Busca automáticamente en Proveedores
  - **SKU → Producto**: Busca automáticamente en SKU
- ✅ Campos del formulario:
  - RUT
  - Comercializadora (autocompletado)
  - Factura
  - Tabla de productos:
    - SKU (con autocompletado)
    - Producto (autocompletado)
    - Cantidad
    - Total Neto (formato miles con $)
    - Costo Unitario Neto (calculado automáticamente: Total/Cantidad)
- ✅ Funciones:
  - ➕ Agregar fila: Agregar más productos
  - 🗑️ Eliminar fila: Quitar productos (mínimo 1 fila)
  - 📧 Enviar correo: Envía tabla a inventario@alimentika.cl
- ✅ Formato de correo: Tabla HTML profesional
- ✅ Limpieza automática del formulario tras enviar

**Uso:**
1. Cambiar a la pestaña "Ingreso de Productos"
2. Ingresar RUT del proveedor
3. Al salir del campo RUT, se autocompleta la Comercializadora
4. Ingresar número de Factura
5. En la tabla:
   - Ingresar SKU (al salir del campo, se autocompleta el Producto)
   - Ingresar Cantidad
   - Ingresar Total Neto (se formatea automáticamente)
   - El Costo Unitario se calcula solo
6. Agregar más productos con el botón "➕ Agregar fila"
7. Eliminar productos con el botón "🗑️"
8. Hacer clic en "📧 Enviar correo"
9. Se envía a: inventario@alimentika.cl
10. El formulario se limpia automáticamente

**Nota:** El envío de correo está configurado para simulación. Para implementar el envío real, se necesita configurar EmailJS o un backend.

---

## 🎨 Características Generales

### Filtros de Columnas
- Cada tabla tiene filtros en cada columna
- Búsqueda en tiempo real
- Filtros combinables (varios a la vez)
- Sensibles a mayúsculas/minúsculas

### Formateo de Números
- **Miles**: Separador de miles (1.500)
- **Decimales**: Control de decimales según columna
- **Moneda**: Símbolo $ antes del número
- **Porcentajes**: Sin decimales (25%)

### Gráficos Interactivos
- Basados en Chart.js
- Responsivos y adaptables
- Etiquetas auto-ajustables
- Colores del tema Alimentika

### Navegación por Pestañas
- Interfaz intuitiva
- Carga bajo demanda
- Estado persistente
- 7 módulos integrados

---

## 📋 Requisitos Técnicos

### Archivos Excel Requeridos (en carpeta Excel/):
1. ✅ `SKU.xlsx` - Catálogo de productos
2. ✅ `Proveedores.xlsx` - Información de proveedores
3. ✅ `Stock Actual.xlsx` - Stock en bodegas
4. ✅ `BBDD.xlsx` - Base de datos consolidada (generada o existente)

### Navegadores Compatibles:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### Librerías Incluidas (CDN):
- SheetJS (xlsx) 0.20.1 - Lectura de archivos Excel
- Chart.js 4.4.0 - Gráficos interactivos
- EmailJS 3.x - Envío de correos (requiere configuración)

---

## 🔧 Solución de Problemas

### Los datos no se cargan automáticamente
**Causa**: No se está ejecutando desde un servidor web.
**Solución**: Iniciar servidor con `python -m http.server 8000`

### Error al cargar archivos Excel
**Causa**: Archivos no están en la carpeta `Excel/`
**Solución**: Verificar que todos los archivos Excel estén en `Excel/`

### Filtros no funcionan
**Causa**: JavaScript deshabilitado
**Solución**: Habilitar JavaScript en el navegador

### Gráficos no se muestran
**Causa**: Problema de conexión a CDN de Chart.js
**Solución**: Verificar conexión a internet

### Correos no se envían
**Causa**: EmailJS no configurado
**Solución**: Por ahora es simulado. Para implementar:
1. Crear cuenta en EmailJS
2. Obtener credenciales
3. Actualizar script.js con las credenciales

---

## 📞 Soporte

Para problemas técnicos o dudas:
- Email: inventario@alimentika.cl
- Revise la consola del navegador (F12) para mensajes de error

---

## 🔄 Actualizaciones Futuras

Funcionalidades planificadas:
- [ ] Exportación de tablas a Excel
- [ ] Importación de datos desde formularios web
- [ ] Dashboard con estadísticas generales
- [ ] Sistema de usuarios y permisos
- [ ] Backend para persistencia de datos
- [ ] Configuración real de EmailJS

---

## 📝 Notas Importantes

1. **Backup**: Hacer respaldo de archivos Excel antes de consolidar
2. **Servidor**: Siempre usar servidor web, no abrir HTML directamente
3. **Datos**: Los cambios en tablas no modifican los archivos Excel originales
4. **Compatibilidad**: Probar en Chrome para mejor experiencia
5. **Performance**: Archivos muy grandes pueden tardar en cargar

---

**Versión**: 1.0  
**Fecha**: Febrero 2026  
**Desarrollado para**: Alimentika
