# 🔧 Documentación Técnica - Sistema Alimentika

## 📐 Arquitectura del Sistema

### Estructura de Archivos

```
Pagina Web/
├── index.html              # Página principal con estructura de pestañas
├── styles.css              # Estilos CSS del sistema
├── script.js               # Lógica JavaScript principal
├── COMO_INICIAR_SERVIDOR.md
├── INSTRUCCIONES.md
├── GUIA_USUARIO.md        # Guía de usuario del sistema
├── DOCUMENTACION_TECNICA.md # Este archivo
└── Excel/
    ├── SKU.xlsx           # Catálogo de productos
    ├── Proveedores.xlsx   # Información de proveedores
    ├── Stock Actual.xlsx  # Stock en bodegas
    └── BBDD.xlsx         # Base de datos consolidada
```

---

## 🏗️ Componentes del Sistema

### 1. HTML (index.html)

#### Estructura del DOM
```html
<div class="container">
  <header>...</header>
  <div class="tabs">...</div>       <!-- Navegación -->
  <div id="sku" class="ventana">...</div>
  <div id="proveedores" class="ventana">...</div>
  <div id="stock-actual" class="ventana">...</div>
  <div id="consolidado" class="ventana">...</div>
  <div id="consumo" class="ventana">...</div>
  <div id="analisis-ventas" class="ventana">...</div>
  <div id="ingreso-productos" class="ventana">...</div>
</div>
```

#### Librerías Externas (CDN)
- **SheetJS**: `https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js`
- **Chart.js**: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
- **EmailJS**: `https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js`

---

### 2. JavaScript (script.js)

#### Variables Globales

```javascript
let datosSKU = [];          // Array con datos del Excel SKU
let datosProveedores = [];  // Array con datos del Excel Proveedores
let datosStockActual = [];  // Array con datos del Excel Stock Actual
let datosBBDD = [];         // Array con datos consolidados BBDD
let chartConsumo = null;    // Instancia de Chart.js para Consumo
let chartVentas = null;     // Instancia de Chart.js para Ventas
```

#### Funciones Principales

##### Navegación
```javascript
cambiarVentana(ventanaId)
  - Oculta todas las ventanas
  - Muestra ventana seleccionada
  - Carga datos si es necesario
  - Actualiza estados de botones
```

##### Carga de Datos
```javascript
// Ventana SKU
cargarDatosSKU()
  - Fetch: Excel/SKU.xlsx
  - XLSX.read() para parsear
  - Almacena en datosSKU[]
  - Llama a mostrarTablaSKU()

mostrarTablaSKU(datos)
  - Crea tabla HTML dinámica
  - Agrega filtros en encabezados
  - Aplica formatos especiales:
    * Costo Neto: $#,###
    * Margen: ##%
    * Costo Venta: $#,###.##

// Ventana Proveedores
cargarDatosProveedores()
  - Similar a cargarDatosSKU()
  - Usa mostrarTablaGenericaConFiltros()

// Ventana Stock Actual
cargarDatosStockActual()
  - Carga Excel/Stock Actual.xlsx
  - Procesa columnas específicas:
    * Código → SKU
    * Nombre → Nombre
    * UM → UM
    * Cd Ñuñoa → Stock Actual
  - Crea nueva estructura de datos
```

##### Consolidado
```javascript
consolidarArchivos()
  - Lee múltiples archivos Excel
  - Une todas las filas
  - Agrega columnas calculadas:
    * Fecha Entero = INT(Fecha Excel)
    * ID Entero = INT(IDProducto)
  - Genera BBDD.xlsx
  - Descarga automáticamente
```

##### Consumo
```javascript
cargarDatosConsumo()
  - Carga BBDD y SKU si no existen
  - Llama a actualizarConsumo()

actualizarConsumo()
  - Lee filtros de agrupación y año
  - Crea columnas dinámicas según filtros
  - Agrupa datos de BBDD por SKU y período
  - Suma cantidades por período
  - Genera tabla y gráfico

obtenerSemanaDelAnio(fecha)
  - Calcula número de semana (1-52)
  - Basado en primer día del año

crearGraficoConsumo(datos, columnas)
  - Destruye gráfico anterior si existe
  - Crea Chart.js tipo 'bar'
  - Suma cantidades por columna
  - Configura auto-rotación de etiquetas
```

##### Análisis de Ventas
```javascript
cargarDatosAnalisisVentas()
  - Carga BBDD y SKU
  - Llena selector de vendedores
  - Establece fechas por defecto (último mes)
  - Llama a actualizarAnalisisVentas()

llenarSelectoresVendedores()
  - Extrae vendedores únicos de BBDD
  - Agrega opciones al select

actualizarAnalisisVentas()
  - Lee filtros: fechas y vendedor
  - Por cada SKU:
    * Cuenta número de transacciones
    * Suma cantidad total vendida
    * Aplica filtros de fecha y vendedor
  - Genera tabla y gráfico Top 20

crearGraficoVentas(datos)
  - Ordena por cantidad descendente
  - Toma top 20 productos
  - Crea gráfico de barras
```

##### Ingreso de Productos
```javascript
autocompletarComercializadora()
  - Lee RUT ingresado
  - Busca en datosProveedores[]
  - Completa Razón Social

autocompletarProducto(input)
  - Lee SKU ingresado
  - Busca en datosSKU[]
  - Completa Nombre del producto

formatearTotalNeto(input)
  - Elimina caracteres no numéricos
  - Aplica formato de miles

calcularCostoUnitario(input)
  - Lee Cantidad y Total Neto
  - Calcula: Total / Cantidad
  - Formatea resultado

agregarFilaProducto()
  - Crea nueva fila en tabla
  - Agrega event listeners

eliminarFila(btn)
  - Verifica mínimo 1 fila
  - Elimina fila del DOM

enviarCorreo()
  - Valida campos requeridos
  - Recolecta datos de productos
  - Genera tabla HTML
  - Simula envío (console.log)
  - Limpia formulario
```

##### Utilidades
```javascript
formatearMiles(numero)
  - Formatea con separador de miles
  - Usa locale 'es-CL'
  - 0-2 decimales

mostrarTablaGenericaConFiltros(datos, containerId)
  - Crea tabla HTML con filtros
  - Agrega inputs de filtro en headers
  - Vincula a filtrarTabla()

filtrarTabla(containerId, columnaIndex, filtro)
  - Filtra filas según input
  - Considera todos los filtros activos
  - Muestra/oculta filas con display
```

#### Event Listeners

```javascript
window.addEventListener('DOMContentLoaded', () => {
  - Carga automática de SKU
  - Precarga de Proveedores
})
```

---

### 3. CSS (styles.css)

#### Estructura de Estilos

##### Variables Principales
```css
/* Colores */
--primary-color: #667eea
--secondary-color: #764ba2
--text-color: #333
--border-color: #e0e0e0

/* Gradientes */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

##### Componentes Principales

**Tabs (Pestañas)**
```css
.tabs
  - Flexbox layout
  - Border-bottom separador
  
.tab-button
  - Estado normal: blanco con borde
  - Estado active: gradiente morado
  - Hover: fondo claro
```

**Tablas**
```css
.excel-table
  - Font-size: 11px (optimizado)
  - Sticky header
  - Hover effects en filas
  
.header-cell
  - Flex-direction: column
  - Gap para filtro
  
.column-filter
  - Font-size: 9px
  - Background semi-transparente
```

**Filtros de Ventanas**
```css
.filtros-consumo, .filtros-ventas
  - Flexbox wrap
  - Background gris claro
  - Padding 15px
```

**Gráficos**
```css
.chart-container
  - Background: #f9f9f9
  - Max-height: 500px
  - Padding: 20px
```

**Formularios**
```css
.form-ingreso
  - Grid layout para form-row
  - Background: #f9f9f9

.productos-table
  - Width: 100%
  - Input dentro de celdas
```

##### Responsive Design
```css
@media (max-width: 768px) {
  - Reduce font-sizes
  - Ajusta padding
  - Grid → 1 columna
  - Tabs más pequeños
}
```

---

## 🔄 Flujo de Datos

### Carga Inicial
```
1. DOMContentLoaded
2. cargarDatosSKU()
3. cargarDatosProveedores()
4. Usuario ve ventana SKU
```

### Cambio de Ventana
```
1. Click en tab
2. cambiarVentana(id)
3. Verifica si datos cargados
4. Si no: carga datos
5. Muestra ventana
```

### Aplicación de Filtros
```
1. Usuario escribe en column-filter
2. onkeyup → filtrarTabla()
3. Obtiene todos los filtros activos
4. Itera filas
5. Muestra/oculta según match
```

### Consolidación
```
1. Usuario selecciona archivos
2. consolidarArchivos()
3. For each archivo:
   - Read as ArrayBuffer
   - XLSX.read()
   - Extract rows
4. Merge all rows
5. Calculate new columns
6. Create new workbook
7. XLSX.writeFile()
8. Browser downloads
```

### Análisis con Gráficos
```
1. Carga datos (BBDD + SKU)
2. Usuario cambia filtros
3. actualizarConsumo() / actualizarAnalisisVentas()
4. Procesa datos según filtros
5. Genera array de datos
6. Chart.destroy() anterior
7. new Chart() con datos nuevos
8. Render automático
```

---

## 🎯 Formateo de Datos

### Números
```javascript
// Miles sin decimales
formatearMiles(1500) → "1.500"

// Miles con 2 decimales
formatearMiles(1500.50) → "1.500,50"

// Con símbolo $
'$' + formatearMiles(1500) → "$1.500"
```

### Porcentajes
```javascript
// Margen (0.25 → 25%)
Math.round(valor * 100) + '%'
```

### Fechas (Excel)
```javascript
// Fecha Excel a número entero
const fechaObj = new Date(fechaExcel);
const entero = Math.floor((fechaObj - new Date('1899-12-30')) / (1000*60*60*24));
```

### Semanas
```javascript
// Obtener semana del año (1-52)
function obtenerSemanaDelAnio(fecha) {
  const primerDia = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha - primerDia) / (24*60*60*1000));
  return Math.ceil((dias + primerDia.getDay() + 1) / 7);
}
```

---

## 📊 Estructura de Datos Excel

### SKU.xlsx
```
Columnas esperadas:
- SKU
- Nombre
- Costo Neto
- Margen
- Costo Venta
- ... (otras)
```

### Proveedores.xlsx
```
Columnas esperadas:
- RUT
- Razón Social
- ... (otras)
```

### Stock Actual.xlsx
```
Columnas esperadas:
- Código (se mapea a SKU)
- Nombre
- UM
- Cd Ñuñoa (se mapea a Stock Actual)
- ... (otras)
```

### BBDD.xlsx (Consolidado)
```
Columnas esperadas:
- SKU
- Cantidad
- Fecha
- IDProducto (opcional)
- Vendedor (opcional)
- ... (otras según archivos fuente)

Columnas agregadas:
- Fecha Entero
- ID Entero
```

---

## 🐛 Debugging

### Console.log Estratégicos
```javascript
// Verificar carga de datos
console.log('Datos SKU:', datosSKU);
console.log('Largo:', datosSKU.length);

// Verificar filtros
console.log('Filtro aplicado:', filtro);
console.log('Filas visibles:', filasVisibles);

// Verificar procesamiento
console.log('Headers:', headers);
console.log('Index encontrado:', indexSKU);
```

### Errores Comunes

**"Cannot read property of undefined"**
```javascript
// Mal:
const valor = datos[i][columnIndex];

// Bien:
const valor = datos[i] && datos[i][columnIndex];
```

**"Chart is already defined"**
```javascript
// Destruir antes de crear nuevo
if (chartConsumo) {
  chartConsumo.destroy();
}
chartConsumo = new Chart(...);
```

**"Fetch failed"**
```javascript
// Verificar servidor web activo
// Verificar ruta correcta: Excel/archivo.xlsx
```

---

## 🔐 Seguridad

### XSS Prevention
```javascript
// Al insertar HTML, usar textContent cuando sea posible
th.textContent = header;  // ✅ Seguro

// Si necesitas HTML, sanitizar input
html += `<td>${sanitize(valor)}</td>`;
```

### CORS
```javascript
// Servidor debe permitir acceso a archivos
// python -m http.server automáticamente permite CORS local
```

---

## ⚡ Optimización

### Performance

**Lazy Loading**
```javascript
// Cargar datos solo cuando se necesitan
if (ventanaId === 'consumo' && datosBBDD.length === 0) {
  await cargarDatosBBDD();
}
```

**Destrucción de Gráficos**
```javascript
// Liberar memoria de gráficos anteriores
if (chart) chart.destroy();
```

**Filtrado Eficiente**
```javascript
// Usar display none en lugar de recrear tabla
fila.style.display = mostrar ? '' : 'none';
```

### Memoria

- Limitar resultados en gráficos (Top 20)
- Destruir gráficos al cambiar ventana
- No duplicar datos en memoria

---

## 🚀 Extensiones Futuras

### Backend Integration
```javascript
// Reemplazar fetch local por API
async function cargarDatosSKU() {
  const response = await fetch('/api/sku');
  const datos = await response.json();
  // ...
}
```

### EmailJS Configuration
```javascript
// En enviarCorreo()
emailjs.send('service_id', 'template_id', {
  to_email: 'inventario@alimentika.cl',
  html_content: tablaHTML
});
```

### Excel Export
```javascript
function exportarTabla(datos, nombreArchivo) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(datos);
  XLSX.utils.book_append_sheet(wb, ws, 'Hoja1');
  XLSX.writeFile(wb, nombreArchivo);
}
```

### Local Storage
```javascript
// Cachear datos
localStorage.setItem('datosSKU', JSON.stringify(datosSKU));

// Recuperar
const cached = localStorage.getItem('datosSKU');
if (cached) datosSKU = JSON.parse(cached);
```

---

## 📝 Convenciones de Código

### Naming
- Variables globales: `camelCase` (datosSKU)
- Funciones: `camelCase` (cargarDatos)
- Constantes: `UPPER_SNAKE_CASE` (MAX_FILAS)
- IDs HTML: `kebab-case` (table-container-sku)

### Comentarios
```javascript
// ===== SECCIÓN PRINCIPAL =====
// Comentario explicativo de función
function miFuncion() {
  // Comentario de línea
}
```

### Estructura de Funciones
```javascript
async function nombreFuncion() {
  // 1. Obtener elementos DOM
  const elemento = document.getElementById('id');
  
  // 2. Validaciones
  if (!dato) return;
  
  // 3. Procesamiento
  const resultado = procesarDato(dato);
  
  // 4. Actualizar UI
  elemento.textContent = resultado;
}
```

---

## 🧪 Testing

### Test Manual Checklist

**Ventana SKU**
- [ ] Carga automática funciona
- [ ] Filtros funcionan en todas las columnas
- [ ] Formatos de números correctos
- [ ] No hay scroll horizontal

**Ventana Proveedores**
- [ ] Carga automática funciona
- [ ] Todos los datos visibles
- [ ] Filtros funcionan

**Ventana Stock Actual**
- [ ] Mapeo de columnas correcto
- [ ] Valores de Cd Ñuñoa correctos

**Ventana Consolidado**
- [ ] Selección de archivos funciona
- [ ] Consolidación correcta
- [ ] Descarga automática
- [ ] Columnas calculadas correctas

**Ventana Consumo**
- [ ] Filtros cambian columnas
- [ ] D atos agrupados correctamente
- [ ] Gráfico se actualiza
- [ ] Etiquetas legibles

**Ventana Análisis**
- [ ] Filtros de fecha funcionan
- [ ] Filtro de vendedor funciona
- [ ] Cálculos correctos
- [ ] Gráfico Top 20 correcto

**Ventana Ingreso**
- [ ] Autocompletado RUT funciona
- [ ] Autocompletado SKU funciona
- [ ] Cálculo de costo unitario correcto
- [ ] Agregar/eliminar filas funciona
- [ ] Validaciones de campo funcionan

---

**Autor**: Desarrollador Alimentika  
**Versión**: 1.0  
**Última Actualización**: Febrero 2026
