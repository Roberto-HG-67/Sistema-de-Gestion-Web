// Variables globales para almacenar datos
let datosSKU = [];
let datosProveedores = [];
let datosStockActual = [];
let datosBBDD = [];
let chartConsumo = null;
let chartVentas = null;
let chartVentasTotal = null;

// Función para cambiar entre ventanas
function cambiarVentana(ventanaId) {
    // Ocultar todas las ventanas
    const ventanas = document.querySelectorAll('.ventana');
    ventanas.forEach(v => v.classList.remove('active'));
    
    // Ocultar todos los botones activos
    const botones = document.querySelectorAll('.tab-button');
    botones.forEach(b => b.classList.remove('active'));
    
    // Mostrar la ventana seleccionada
    document.getElementById(ventanaId).classList.add('active');
    event.target.classList.add('active');
    
    // Cargar datos si es necesario
    if (ventanaId === 'sku' && datosSKU.length === 0) {
        cargarDatosSKU();
    } else if (ventanaId === 'proveedores' && datosProveedores.length === 0) {
        cargarDatosProveedores();
    } else if (ventanaId === 'stock-actual' && datosStockActual.length === 0) {
        cargarDatosStockActual();
    } else if (ventanaId === 'consumo') {
        cargarDatosConsumo();
    } else if (ventanaId === 'analisis-ventas') {
        cargarDatosAnalisisVentas();
    } else if (ventanaId === 'pronostico') {
        cargarDatosPronostico();
    } else if (ventanaId === 'compras') {
        cargarDatosCompras();
    } else if (ventanaId === 'historial-precios') {
        cargarHistorialPrecios();
    } else if (ventanaId === 'control-entradas') {
        inicializarControlEntradas();
    } else if (ventanaId === 'analisis-inventario') {
        cargarAnalisisInventario();
    } else if (ventanaId === 'sku-por-vencer') {
        cargarSKUporVencer();
    }
}

// ===== VENTANA SKU =====
async function cargarDatosSKU() {
    const loading = document.getElementById('loading-sku');
    const error = document.getElementById('error-sku');
    const tableContainer = document.getElementById('tableContainer-sku');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    tableContainer.innerHTML = '';
    
    try {
        const response = await fetch('Excel/SKU.xlsx');
        if (!response.ok) throw new Error('No se pudo cargar Excel/SKU.xlsx');
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const primeraHoja = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[primeraHoja];
        const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        datosSKU = datos;
        mostrarTablaSKU(datos);
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar SKU.xlsx: ' + err.message;
    }
}

function mostrarTablaSKU(datos) {
    const tableContainer = document.getElementById('tableContainer-sku');
    if (!datos || datos.length < 2) {
        tableContainer.innerHTML = '<p class="placeholder">No hay datos para mostrar</p>';
        return;
    }
    
    const headers = datos[0];
    const filas = datos.slice(1);
    
    // Columnas que deben centrarse
    const colsCentrar = ['proveedor 1', 'proveedor 2', 'um', 'mt^3', 'ficha técnica', 'tipo de venta', 'tipo de compra', 'costo neto', 'margen', 'costo venta'];
    const colsReducir = ['ficha técnica'];
    
    let html = '<table class="excel-table"><thead><tr>';
    
    // Encabezados con filtros
    headers.forEach((header, index) => {
        const hLower = (header || '').toLowerCase();
        const clases = [];
        if (colsCentrar.some(c => hLower.includes(c))) clases.push('col-center');
        if (colsReducir.some(c => hLower.includes(c))) clases.push('col-narrow');
        const clsAttr = clases.length ? ` class="${clases.join(' ')}"` : '';
        html += `<th${clsAttr}>
            <div class="header-cell">
                <span class="header-text">${header || 'Col ' + (index + 1)}</span>
                <input type="text" class="column-filter" placeholder="Filtrar..." 
                       onkeyup="filtrarTabla('tableContainer-sku', ${index}, this.value)">
            </div>
        </th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    // Buscar índices de columnas específicas
    const indexCostoNeto = headers.findIndex(h => h && h.toLowerCase().includes('costo') && h.toLowerCase().includes('neto'));
    const indexMargen = headers.findIndex(h => h && h.toLowerCase().includes('margen'));
    const indexCostoVenta = headers.findIndex(h => h && h.toLowerCase().includes('costo') && h.toLowerCase().includes('venta'));
    
    // Filas de datos
    filas.forEach(fila => {
        html += '<tr>';
        headers.forEach((header, colIndex) => {
            let valor = fila[colIndex] !== undefined ? fila[colIndex] : '';
            const hLower = (header || '').toLowerCase();
            const clases = [];
            if (colsCentrar.some(c => hLower.includes(c))) clases.push('col-center');
            if (colsReducir.some(c => hLower.includes(c))) clases.push('col-narrow');
            const clsAttr = clases.length ? ` class="${clases.join(' ')}"` : '';
            
            // Formatear según columna
            if (colIndex === indexCostoNeto && valor) {
                valor = '$' + formatearMiles(valor);
            } else if (colIndex === indexMargen && valor) {
                valor = Math.round(valor * 100) + '%';
            } else if (colIndex === indexCostoVenta && valor) {
                valor = '$' + formatearMiles(Number(valor).toFixed(2));
            }
            
            html += `<td${clsAttr}>${valor}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

// ===== VENTANA PROVEEDORES =====
async function cargarDatosProveedores() {
    const loading = document.getElementById('loading-proveedores');
    const error = document.getElementById('error-proveedores');
    const tableContainer = document.getElementById('tableContainer-proveedores');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    tableContainer.innerHTML = '';
    
    try {
        const response = await fetch('Excel/Proveedores.xlsx');
        if (!response.ok) throw new Error('No se pudo cargar Excel/Proveedores.xlsx');
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const primeraHoja = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[primeraHoja];
        const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        datosProveedores = datos;
        mostrarTablaGenericaConFiltros(datos, 'tableContainer-proveedores');
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar Proveedores.xlsx: ' + err.message;
    }
}

// ===== VENTANA STOCK ACTUAL =====
async function cargarDatosStockActual() {
    const loading = document.getElementById('loading-stock-actual');
    const error = document.getElementById('error-stock-actual');
    const tableContainer = document.getElementById('tableContainer-stock-actual');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    tableContainer.innerHTML = '';
    
    try {
        // Cargar Stock Actual y SKU
        const responseStock = await fetch('Excel/Stock Actual.xlsx');
        if (!responseStock.ok) throw new Error('No se pudo cargar Excel/Stock Actual.xlsx');
        
        const arrayBufferStock = await responseStock.arrayBuffer();
        const workbookStock = XLSX.read(arrayBufferStock, { type: 'array' });
        const hojaStock = workbookStock.SheetNames[0];
        const worksheetStock = workbookStock.Sheets[hojaStock];
        const datosStock = XLSX.utils.sheet_to_json(worksheetStock, { header: 1 });
        
        datosStockActual = datosStock;
        
        // Cargar SKU si no está cargado
        if (datosSKU.length === 0) {
            const responseSKU = await fetch('Excel/SKU.xlsx');
            if (!responseSKU.ok) throw new Error('No se pudo cargar Excel/SKU.xlsx');
            const arrayBufferSKU = await responseSKU.arrayBuffer();
            const workbookSKU = XLSX.read(arrayBufferSKU, { type: 'array' });
            const hojaSKU = workbookSKU.SheetNames[0];
            const worksheetSKU = workbookSKU.Sheets[hojaSKU];
            datosSKU = XLSX.utils.sheet_to_json(worksheetSKU, { header: 1 });
        }
        
        // Obtener índices de Stock Actual
        const headersStock = datosStock[0];
        const indexCodigoStock = headersStock.findIndex(h => h && (h.toLowerCase().includes('código') || h.toLowerCase().includes('codigo')));
        const indexCdNunoa = headersStock.findIndex(h => h && h.toLowerCase().includes('ñuñoa'));
        
        // Obtener índices de SKU
        const headersSKU = datosSKU[0];
        const indexSKU_SKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'sku');
        const indexNombre_SKU = headersSKU.findIndex(h => h && h.toLowerCase().includes('nombre'));
        const indexUM_SKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'um');
        
        // Crear nueva estructura de datos usando SKU como base
        const nuevosDatos = [['SKU', 'Nombre', 'UM', 'Stock Actual']];
        
        for (let i = 1; i < datosSKU.length; i++) {
            const filaSKU = datosSKU[i];
            const sku = filaSKU[indexSKU_SKU];
            const nombre = filaSKU[indexNombre_SKU];
            const um = filaSKU[indexUM_SKU];
            
            // Buscar stock en Stock Actual
            let stockActual = 0;
            for (let j = 1; j < datosStock.length; j++) {
                const filaStock = datosStock[j];
                if (filaStock[indexCodigoStock] && filaStock[indexCodigoStock].toString() === sku.toString()) {
                    stockActual = filaStock[indexCdNunoa] || 0;
                    break;
                }
            }
            
            nuevosDatos.push([sku, nombre, um, stockActual]);
        }
        
        // Actualizar contador de SKUs
        const skuCountEl = document.getElementById('skuCountStockActual');
        if (skuCountEl) {
            const skuCount = nuevosDatos.length - 1;
            skuCountEl.textContent = `${skuCount} SKU analizando`;
            skuCountEl.style.display = 'inline-flex';
        }
        
        mostrarTablaGenericaConFiltros(nuevosDatos, 'tableContainer-stock-actual');
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar Stock Actual.xlsx: ' + err.message;
    }
}

// ===== VENTANA CONSOLIDADO =====
async function consolidarArchivos() {
    const fileInput = document.getElementById('fileInputConsolidado');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Por favor, selecciona al menos un archivo Excel');
        return;
    }
    
    const loading = document.getElementById('loading-consolidado');
    const error = document.getElementById('error-consolidado');
    const info = document.getElementById('info-consolidado');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    info.style.display = 'none';
    
    try {
        let datosConsolidados = [];
        let headers = null;
        
        // Leer todos los archivos
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const primeraHoja = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeraHoja];
            const datos = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (i === 0) {
                headers = datos[0];
                datosConsolidados.push(headers);
            }
            
            // Agregar todas las filas excepto el encabezado
            for (let j = 1; j < datos.length; j++) {
                datosConsolidados.push(datos[j]);
            }
        }
        
        // PASO 4: Eliminar filas con "Envio" o "ENVIO" en columna IDProducto
        const indexIDProductoTemp = headers.findIndex(h => h && (
            h.toLowerCase().includes('idproducto') || 
            h.toLowerCase().includes('id producto') ||
            h.toLowerCase() === 'id'
        ));
        
        if (indexIDProductoTemp >= 0) {
            const filasOriginales = datosConsolidados.length - 1;
            datosConsolidados = datosConsolidados.filter((fila, index) => {
                // Mantener el header (índice 0)
                if (index === 0) return true;
                
                const valorIDProducto = fila[indexIDProductoTemp];
                
                // Eliminar si es "Envio" o "ENVIO" (case insensitive)
                if (valorIDProducto && typeof valorIDProducto === 'string') {
                    const valorLower = valorIDProducto.toLowerCase().trim();
                    if (valorLower === 'envio') {
                        return false; // Eliminar esta fila
                    }
                }
                
                return true; // Mantener la fila
            });
            
            const filasEliminadas = filasOriginales - (datosConsolidados.length - 1);
            console.log(`Filas eliminadas con "Envio": ${filasEliminadas}`);
        }
        
        // Agregar columnas "Fecha Entero" e "ID Entero" al final
        const indexFecha = headers.findIndex(h => h && h.toLowerCase().includes('fecha'));
        const indexIDProducto = headers.findIndex(h => h && (
            h.toLowerCase().includes('idproducto') || 
            h.toLowerCase().includes('id producto') ||
            h.toLowerCase() === 'id'
        ));
        
        console.log('Índice Fecha:', indexFecha, '- Columna:', headers[indexFecha]);
        console.log('Índice IDProducto:', indexIDProducto, '- Columna:', headers[indexIDProducto]);
        
        // Asegurar que haya espacio para las columnas 18 y 19 (índices 17 y 18)
        while (headers.length < 17) {
            headers.push('');
        }
        
        // Insertar columnas en posiciones 18 y 19 (índices 17 y 18)
        headers[17] = 'Fecha Entero';
        headers[18] = 'ID Entero';
        
        // Procesar filas
        for (let i = 1; i < datosConsolidados.length; i++) {
            const fila = datosConsolidados[i];
            
            // Fecha Entero
            let fechaEntero = '';
            if (indexFecha >= 0 && fila[indexFecha] !== undefined && fila[indexFecha] !== null && fila[indexFecha] !== '') {
                const valorFecha = fila[indexFecha];
                
                // Debug primeras 3 filas
                if (i <= 3) {
                    console.log(`Fila ${i} - Fecha original:`, valorFecha, 'Tipo:', typeof valorFecha);
                }
                
                // Si ya es un número serial de Excel, usarlo directamente
                if (typeof valorFecha === 'number') {
                    fechaEntero = Math.floor(valorFecha);
                    if (i <= 3) console.log(`Fila ${i} - Fecha es número serial:`, fechaEntero);
                } else {
                    // Si es string o Date, convertir a serial de Excel
                    const fecha = new Date(valorFecha);
                    if (!isNaN(fecha.getTime())) {
                        fechaEntero = Math.floor((fecha - new Date('1899-12-30')) / (1000 * 60 * 60 * 24));
                        if (i <= 3) console.log(`Fila ${i} - Fecha convertida a serial:`, fechaEntero);
                    }
                }
            }
            
            // ID Entero - Aplicar función ENTERO de Excel
            let idEntero = '';
            if (indexIDProducto >= 0) {
                const valorOriginal = fila[indexIDProducto];
                
                if (valorOriginal !== undefined && valorOriginal !== null && valorOriginal !== '') {
                    const valorNumerico = Number(valorOriginal);
                    if (!isNaN(valorNumerico)) {
                        idEntero = Math.floor(valorNumerico);
                    }
                }
            }
            
            // Asegurar que la fila tenga espacio para las columnas 18 y 19
            while (fila.length < 17) {
                fila.push('');
            }
            
            // Insertar valores en posiciones 18 y 19 (índices 17 y 18)
            fila[17] = fechaEntero;
            fila[18] = idEntero;
        }
        
        datosBBDD = datosConsolidados;
        
        // Crear archivo Excel con filtros
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(datosConsolidados);
        
        // Agregar autofiltro a todas las columnas
        const rango = XLSX.utils.decode_range(ws['!ref']);
        ws['!autofilter'] = { ref: XLSX.utils.encode_range(rango) };
        
        XLSX.utils.book_append_sheet(wb, ws, 'Hoja 1');
        
        // Descargar archivo
        XLSX.writeFile(wb, 'BBDD.xlsx');
        
        loading.style.display = 'none';
        info.style.display = 'block';
        info.textContent = `✅ Archivos consolidados exitosamente. Se procesaron ${datosConsolidados.length - 1} filas. Archivo BBDD.xlsx descargado.`;
        
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al consolidar archivos: ' + err.message;
    }
}

// ===== VENTANA CONSUMO =====
async function cargarDatosConsumo() {
    const loading = document.getElementById('loading-consumo');
    const error = document.getElementById('error-consumo');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    
    try {
        // Cargar BBDD si no está cargado
        if (datosBBDD.length === 0) {
            const response = await fetch('Excel/BBDD.xlsx');
            if (!response.ok) throw new Error('No se pudo cargar BBDD.xlsx');
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const primeraHoja = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeraHoja];
            datosBBDD = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }
        
        // Cargar SKU si no está cargado
        if (datosSKU.length === 0) {
            await cargarDatosSKU();
        }
        
        actualizarConsumo();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar datos de consumo: ' + err.message;
    }
}

function actualizarConsumo() {
    const agrupacion = document.getElementById('filtroAgrupacion').value;
    const anio = parseInt(document.getElementById('filtroAnio').value);
    
    if (datosSKU.length === 0 || datosBBDD.length === 0) return;
    
    const headersSKU = datosSKU[0];
    const headersBBDD = datosBBDD[0];
    
    const indexSKU_SKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'sku');
    const indexNombre_SKU = headersSKU.findIndex(h => h && h.toLowerCase().includes('nombre'));
    
    // Buscar columna IDProducto en BBDD
    let indexIDProducto_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'idproducto');
    if (indexIDProducto_BBDD < 0) {
        indexIDProducto_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'id entero');
    }
    const indexCantidad_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('cantidad'));
    let indexFechaEntero_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'fecha entero');
    if (indexFechaEntero_BBDD < 0) {
        indexFechaEntero_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('fecha'));
    }
    
    console.log('DEBUG CONSUMO - Headers BBDD:', headersBBDD);
    console.log('DEBUG CONSUMO - indexIDProducto_BBDD:', indexIDProducto_BBDD, '- Columna:', headersBBDD[indexIDProducto_BBDD]);
    console.log('DEBUG CONSUMO - indexCantidad_BBDD:', indexCantidad_BBDD, '- Columna:', headersBBDD[indexCantidad_BBDD]);
    console.log('DEBUG CONSUMO - indexFechaEntero_BBDD:', indexFechaEntero_BBDD, '- Columna:', headersBBDD[indexFechaEntero_BBDD]);
    
    // Crear mapa de SKU -> Nombre y set de SKU válidos desde SKU.xlsx
    const mapaSKU = {};
    const skuValidos = new Set();
    const filasSKU = datosSKU.slice(1);
    filasSKU.forEach(filaSKU => {
        const sku = filaSKU[indexSKU_SKU];
        const nombre = filaSKU[indexNombre_SKU];
        if (sku !== undefined && sku !== null) {
            const skuStr = String(sku).trim();
            const skuInt = String(Math.floor(Number(sku)));
            mapaSKU[skuStr] = nombre || '';
            if (!isNaN(Number(sku))) {
                mapaSKU[skuInt] = nombre || '';
            }
            skuValidos.add(skuStr);
            if (!isNaN(Number(sku))) skuValidos.add(skuInt);
        }
    });
    
    // Función auxiliar para convertir fecha serial de Excel a Date
    const EXCEL_EPOCH = new Date('1899-12-30').getTime();
    function excelSerialToDate(serial) {
        const num = Number(serial);
        if (isNaN(num) || num <= 0) return null;
        return new Date(EXCEL_EPOCH + num * 86400000);
    }
    
    // Determinar columnas según agrupación
    let columnas = [];
    if (agrupacion === 'anual') {
        columnas = ['2024', '2025', '2026'];
    } else if (agrupacion === 'mensual') {
        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        columnas = meses.map(m => `${anio}-${m}`);
    } else if (agrupacion === 'semanal') {
        columnas = [];
        for (let i = 1; i <= 52; i++) {
            columnas.push(`${anio}-SEM ${i}`);
        }
    }
    
    const headers = ['SKU', 'Nombre', ...columnas];
    const datosConsumo = [headers];
    
    // Solo procesar SKUs que existan en SKU.xlsx
    let skuCount = 0;
    filasSKU.forEach(filaSKU => {
        const skuOrig = filaSKU[indexSKU_SKU];
        if (skuOrig === undefined || skuOrig === null) return;
        const skuStr = String(skuOrig).trim();
        const skuInt = String(Math.floor(Number(skuOrig)));
        const nombre = filaSKU[indexNombre_SKU] || '';
        
        const fila = [skuOrig, nombre];
        
        columnas.forEach((col, index) => {
            let suma = 0;
            for (let i = 1; i < datosBBDD.length; i++) {
                const filaBBDD = datosBBDD[i];
                const idProdBBDD = String(filaBBDD[indexIDProducto_BBDD]).trim();
                
                // IDProducto en BBDD debe coincidir con SKU de SKU.xlsx
                if (idProdBBDD !== skuStr && idProdBBDD !== skuInt) continue;
                
                const cantidad = Number(filaBBDD[indexCantidad_BBDD]) || 0;
                const fechaEnteroVal = filaBBDD[indexFechaEntero_BBDD];
                
                if (fechaEnteroVal) {
                    const fechaObj = excelSerialToDate(fechaEnteroVal);
                    if (!fechaObj) continue;
                    const anioFecha = fechaObj.getUTCFullYear();
                    
                    let incluir = false;
                    if (agrupacion === 'anual') {
                        incluir = anioFecha === parseInt(col);
                    } else if (agrupacion === 'mensual') {
                        incluir = anioFecha === anio && fechaObj.getUTCMonth() === index;
                    } else if (agrupacion === 'semanal') {
                        incluir = anioFecha === anio && obtenerSemanaDelAnio(fechaObj) === index + 1;
                    }
                    
                    if (incluir) suma += cantidad;
                }
            }
            fila.push(suma);
        });
        
        datosConsumo.push(fila);
        skuCount++;
    });
    
    // Actualizar contador de SKU
    const skuCountEl = document.getElementById('skuCountConsumo');
    if (skuCountEl) skuCountEl.textContent = `${skuCount} SKU analizados`;
    
    // Guardar datos de consumo globalmente para filtrado/ordenamiento
    window._datosConsumoCompletos = datosConsumo;
    window._columnasConsumo = columnas;
    filtrarTablaConsumo();
    crearGraficoConsumo(datosConsumo, columnas);
}

function obtenerSemanaDelAnio(fecha) {
    const primerDia = new Date(Date.UTC(fecha.getUTCFullYear(), 0, 1));
    const dias = Math.floor((fecha - primerDia) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + primerDia.getUTCDay() + 1) / 7);
}

// Función para calcular regresión lineal
function calcularRegresionLineal(datos) {
    const n = datos.length;
    if (n < 2) return datos.map(() => 0);
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += datos[i];
        sumXY += i * datos[i];
        sumX2 += i * i;
    }
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    return datos.map((_, i) => m * i + b);
}

// Función para calcular media móvil (tendencia)
function calcularMediaMovil(datos, ventana) {
    const resultado = [];
    for (let i = 0; i < datos.length; i++) {
        const inicio = Math.max(0, i - Math.floor(ventana / 2));
        const fin = Math.min(datos.length, i + Math.ceil(ventana / 2));
        let suma = 0, count = 0;
        for (let j = inicio; j < fin; j++) {
            suma += datos[j];
            count++;
        }
        resultado.push(suma / count);
    }
    return resultado;
}

function crearGraficoConsumo(datos, columnas) {
    const ctx = document.getElementById('chartConsumo');
    
    if (chartConsumo) {
        chartConsumo.destroy();
    }
    
    // Sumar por columna (período)
    const sumas = new Array(columnas.length).fill(0);
    for (let i = 1; i < datos.length; i++) {
        for (let j = 2; j < datos[i].length; j++) {
            sumas[j - 2] += Number(datos[i][j]) || 0;
        }
    }
    
    const datasets = [{
        label: 'Cantidad Total',
        data: sumas,
        backgroundColor: 'rgba(102, 126, 234, 0.7)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        order: 2
    }];
    
    // Línea de tendencia (media móvil)
    const mostrarTendencia = document.getElementById('toggleTendenciaConsumo') && document.getElementById('toggleTendenciaConsumo').checked;
    if (mostrarTendencia) {
        const ventana = Math.max(2, Math.floor(columnas.length / 4));
        const tendencia = calcularMediaMovil(sumas, ventana);
        datasets.push({
            label: 'Tendencia',
            data: tendencia,
            type: 'line',
            borderColor: 'rgba(255, 152, 0, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [6, 3],
            pointRadius: 0,
            tension: 0.4,
            order: 1
        });
    }
    
    // Línea de regresión
    const mostrarRegresion = document.getElementById('toggleRegresionConsumo') && document.getElementById('toggleRegresionConsumo').checked;
    if (mostrarRegresion) {
        const regresion = calcularRegresionLineal(sumas);
        datasets.push({
            label: 'Regresión lineal',
            data: regresion,
            type: 'line',
            borderColor: 'rgba(244, 67, 54, 1)',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [10, 5],
            pointRadius: 0,
            tension: 0,
            order: 0
        });
    }
    
    chartConsumo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: columnas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        autoSkip: true,
                        callback: function(value) {
                            return formatearMiles(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatearMiles(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

// ===== VENTANA ANÁLISIS DE VENTAS =====
async function cargarDatosAnalisisVentas() {
    const loading = document.getElementById('loading-analisis-ventas');
    const error = document.getElementById('error-analisis-ventas');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    
    try {
        // Cargar BBDD si no está cargado
        if (datosBBDD.length === 0) {
            const response = await fetch('Excel/BBDD.xlsx');
            if (!response.ok) throw new Error('No se pudo cargar BBDD.xlsx');
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const primeraHoja = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeraHoja];
            datosBBDD = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }
        
        // Cargar SKU si no está cargado
        if (datosSKU.length === 0) {
            await cargarDatosSKU();
        }
        
        // Llenar selector de vendedores
        llenarSelectoresVendedores();
        
        // Establecer fechas por defecto
        const hoy = new Date();
        const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        document.getElementById('filtroFechaInicio').value = mesAnterior.toISOString().split('T')[0];
        document.getElementById('filtroFechaFin').value = hoy.toISOString().split('T')[0];
        
        actualizarAnalisisVentas();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar análisis de ventas: ' + err.message;
    }
}

function llenarSelectoresVendedores() {
    const headersBBDD = datosBBDD[0];
    const indexVendedor = headersBBDD.findIndex(h => h && h.toLowerCase().includes('vendedor'));
    
    if (indexVendedor < 0) return;
    
    const vendedores = new Set();
    for (let i = 1; i < datosBBDD.length; i++) {
        const vendedor = datosBBDD[i][indexVendedor];
        if (vendedor) vendedores.add(vendedor);
    }
    
    const select = document.getElementById('filtroVendedor');
    vendedores.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
    });
}

function actualizarAnalisisVentas() {
    const fechaInicio = new Date(document.getElementById('filtroFechaInicio').value);
    const fechaFin = new Date(document.getElementById('filtroFechaFin').value);
    // Incluir el día completo de la fecha fin (hasta las 23:59:59 UTC)
    if (!isNaN(fechaFin.getTime())) fechaFin.setUTCHours(23, 59, 59, 999);
    const vendedorFiltro = document.getElementById('filtroVendedor').value;
    
    if (datosSKU.length === 0 || datosBBDD.length === 0) return;
    
    const headersSKU = datosSKU[0];
    const headersBBDD = datosBBDD[0];
    
    const indexSKU_SKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'sku');
    const indexNombre_SKU = headersSKU.findIndex(h => h && h.toLowerCase().includes('nombre'));
    
    let indexIDProducto_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'idproducto');
    if (indexIDProducto_BBDD < 0) {
        indexIDProducto_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'id entero');
    }
    const indexCantidad_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('cantidad'));
    let indexFechaEntero_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'fecha entero');
    if (indexFechaEntero_BBDD < 0) {
        indexFechaEntero_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('fecha'));
    }
    const indexVendedor_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('vendedor'));
    const indexPrecio_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'precio');
    
    const EXCEL_EPOCH = new Date('1899-12-30').getTime();
    function excelSerialToDate(serial) {
        const num = Number(serial);
        if (isNaN(num) || num <= 0) return null;
        return new Date(EXCEL_EPOCH + num * 86400000);
    }
    
    const filasSKU = datosSKU.slice(1);
    
    const datosAnalisis = [['SKU', 'Nombre', 'Número de ventas', 'Cantidad Vendida', 'Total Vendido ($)']];
    const datosGrafico = [];
    let skuCount = 0;
    
    // Guardar datos para descarga
    window._datosAnalisisVentas = [];
    
    filasSKU.forEach(filaSKU => {
        const skuOrig = filaSKU[indexSKU_SKU];
        if (skuOrig === undefined || skuOrig === null) return;
        const skuStr = String(skuOrig).trim();
        const skuInt = String(Math.floor(Number(skuOrig)));
        const nombre = filaSKU[indexNombre_SKU] || '';
        
        let numeroVentas = 0;
        let cantidadVendida = 0;
        let totalVendido = 0;
        
        for (let i = 1; i < datosBBDD.length; i++) {
            const filaBBDD = datosBBDD[i];
            const idProdBBDD = String(filaBBDD[indexIDProducto_BBDD]).trim();
            
            if (idProdBBDD !== skuStr && idProdBBDD !== skuInt) continue;
            
            const cantidad = Number(filaBBDD[indexCantidad_BBDD]) || 0;
            const precio = indexPrecio_BBDD >= 0 ? (Number(filaBBDD[indexPrecio_BBDD]) || 0) : 0;
            const fechaEnteroVal = filaBBDD[indexFechaEntero_BBDD];
            const vendedor = filaBBDD[indexVendedor_BBDD];
            
            let incluir = false;
            if (fechaEnteroVal) {
                const fechaObj = excelSerialToDate(fechaEnteroVal);
                if (fechaObj) {
                    incluir = true;
                    if (!isNaN(fechaInicio.getTime())) incluir = fechaObj >= fechaInicio;
                    if (incluir && !isNaN(fechaFin.getTime())) incluir = fechaObj <= fechaFin;
                }
            }
            if (incluir && vendedorFiltro) incluir = vendedor === vendedorFiltro;
            
            if (incluir) {
                numeroVentas++;
                cantidadVendida += cantidad;
                totalVendido += precio * cantidad;
            }
        }
        
        datosAnalisis.push([skuOrig, nombre, numeroVentas, cantidadVendida, Math.round(totalVendido)]);
        window._datosAnalisisVentas.push([skuOrig, nombre, numeroVentas, cantidadVendida, Math.round(totalVendido)]);
        if (cantidadVendida > 0 || totalVendido > 0) {
            datosGrafico.push({ nombre: nombre || String(skuOrig), cantidad: cantidadVendida, total: Math.round(totalVendido) });
        }
        skuCount++;
    });
    
    // Actualizar contador de SKU
    const skuCountEl = document.getElementById('skuCountVentas');
    if (skuCountEl) skuCountEl.textContent = `${skuCount} SKU analizados`;
    
    mostrarTablaVentasSinFiltrosNumericos(datosAnalisis, 'tableContainer-analisis-ventas');
    crearGraficoVentas(datosGrafico);
}

// Estado de ordenamiento para Análisis de Ventas
window._sortEstadoVentas = { col: -1, asc: true };

// Ordenar tabla de Análisis de Ventas
function ordenarTablaVentas(colIndex) {
    if (!window._datosTablaVentas || window._datosTablaVentas.length < 2) return;
    
    const estado = window._sortEstadoVentas;
    if (estado.col === colIndex) {
        estado.asc = !estado.asc;
    } else {
        estado.col = colIndex;
        estado.asc = true;
    }
    
    const headers = window._datosTablaVentas[0];
    const filas = window._datosTablaVentas.slice(1);
    
    filas.sort((a, b) => {
        let valA = a[colIndex];
        let valB = b[colIndex];
        // Intentar comparar como número
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return estado.asc ? numA - numB : numB - numA;
        }
        // Comparar como texto
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
        if (valA < valB) return estado.asc ? -1 : 1;
        if (valA > valB) return estado.asc ? 1 : -1;
        return 0;
    });
    
    const datosOrdenados = [headers, ...filas];
    mostrarTablaVentasSinFiltrosNumericos(datosOrdenados, 'tableContainer-analisis-ventas');
}

// Tabla para Análisis de Ventas: filtros solo en SKU y Nombre, no en columnas numéricas
function mostrarTablaVentasSinFiltrosNumericos(datos, containerId) {
    const tableContainer = document.getElementById(containerId);
    if (!datos || datos.length < 2) {
        tableContainer.innerHTML = '<p class="placeholder">No hay datos para mostrar</p>';
        return;
    }
    
    const headers = datos[0];
    const filas = datos.slice(1);
    
    // Guardar datos para poder reordenar
    window._datosTablaVentas = datos;
    
    // Columnas a centrar
    const colsCentrar = ['número de ventas', 'cantidad vendida', 'total vendido'];
    // Columnas que son ordenables (por índice: 0=SKU, 2=Nro ventas, 3=Cantidad, 4=Total)
    const colsOrdenables = [0, 2, 3, 4];
    
    const estado = window._sortEstadoVentas;
    
    let html = '<table class="excel-table"><thead><tr>';
    headers.forEach((header, index) => {
        const hLower = (header || '').toLowerCase();
        const centrar = colsCentrar.some(c => hLower.includes(c));
        const clsAttr = centrar ? ' class="col-center"' : '';
        const esOrdenable = colsOrdenables.includes(index);
        
        // Determinar ícono de orden
        let sortIcon = '';
        if (esOrdenable) {
            if (estado.col === index) {
                sortIcon = estado.asc ? '&#9650;' : '&#9660;';
            } else {
                sortIcon = '&#8693;';
            }
        }
        
        // Solo mostrar filtro en las primeras 2 columnas (SKU, Nombre)
        const sortBtn = esOrdenable ? `<span class="sort-btn" onclick="ordenarTablaVentas(${index})" title="Ordenar">${sortIcon}</span>` : '';
        if (index < 2) {
            html += `<th${clsAttr}>
                <div class="header-cell">
                    <div class="header-title-row"><span class="header-text">${header || 'Col ' + (index + 1)}</span>${sortBtn}</div>
                    <input type="text" class="column-filter" placeholder="Filtrar..." 
                           onkeyup="filtrarTabla('${containerId}', ${index}, this.value)">
                </div>
            </th>`;
        } else {
            html += `<th${clsAttr}><div class="header-title-row"><span class="header-text">${header || 'Col ' + (index + 1)}</span>${sortBtn}</div></th>`;
        }
    });
    html += '</tr></thead><tbody>';
    filas.forEach(fila => {
        html += '<tr>';
        headers.forEach((header, colIndex) => {
            let valor = fila[colIndex] !== undefined ? fila[colIndex] : '';
            const hLower = (header || '').toLowerCase();
            const centrar = colsCentrar.some(c => hLower.includes(c));
            const clsAttr = centrar ? ' class="col-center"' : '';
            
            // Formatear números con separador de miles (excepto SKU y Nombre que están en col 0 y 1)
            if (colIndex > 1 && valor !== '' && !isNaN(valor) && valor !== null) {
                valor = formatearMiles(valor);
            }
            
            html += `<td${clsAttr}>${valor}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

// Función para descargar datos de Análisis de Ventas como Excel
function descargarDataAnalisis() {
    if (!window._datosAnalisisVentas || window._datosAnalisisVentas.length === 0) {
        alert('No hay datos para descargar');
        return;
    }
    const headers = ['SKU', 'Nombre', 'Número de ventas', 'Cantidad Vendida', 'Total Vendido ($)'];
    const datosExport = [headers, ...window._datosAnalisisVentas];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datosExport);
    XLSX.utils.book_append_sheet(wb, ws, 'Análisis de Ventas');
    XLSX.writeFile(wb, 'Analisis_Ventas.xlsx');
}

function crearGraficoVentas(datos) {
    if (chartVentas) chartVentas.destroy();
    if (chartVentasTotal) chartVentasTotal.destroy();
    
    if (!datos || datos.length === 0) return;
    
    // Ordenar por cantidad y tomar top 20
    const porCantidad = [...datos].sort((a, b) => b.cantidad - a.cantidad).slice(0, 20);
    
    // Gráfico 1: Cantidad Vendida
    chartVentas = new Chart(document.getElementById('chartVentas'), {
        type: 'bar',
        data: {
            labels: porCantidad.map(d => d.nombre),
            datasets: [{
                label: 'Cantidad Vendida',
                data: porCantidad.map(d => d.cantidad),
                backgroundColor: 'rgba(118, 75, 162, 0.7)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 45, font: { size: 9 } } },
                y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } }
            },
            plugins: {
                title: { display: true, text: 'Top 20 - Cantidad Vendida' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            var v = ctx.parsed.y;
                            return ctx.dataset.label + ': ' + (v >= 1000 ? v.toLocaleString('es-CL') : v);
                        }
                    }
                }
            }
        }
    });
    
    // Ordenar por total vendido y tomar top 20
    const porTotal = [...datos].sort((a, b) => b.total - a.total).slice(0, 20);
    
    // Gráfico 2: Total Vendido ($)
    chartVentasTotal = new Chart(document.getElementById('chartVentasTotal'), {
        type: 'bar',
        data: {
            labels: porTotal.map(d => d.nombre),
            datasets: [{
                label: 'Total Vendido ($)',
                data: porTotal.map(d => d.total),
                backgroundColor: 'rgba(14, 165, 233, 0.7)',
                borderColor: 'rgba(14, 165, 233, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 45, font: { size: 9 } } },
                y: { beginAtZero: true, title: { display: true, text: 'Total ($)' } }
            },
            plugins: {
                title: { display: true, text: 'Top 20 - Total Vendido ($)' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            var v = ctx.parsed.y;
                            return ctx.dataset.label + ': ' + (v >= 1000 ? v.toLocaleString('es-CL') : v);
                        }
                    }
                }
            }
        }
    });
}

// ===== VENTANA INGRESO DE PRODUCTOS =====
function formatearRUT(input) {
    let valor = input.value.replace(/[^0-9kK]/g, ''); // Solo números y K
    
    if (valor.length === 0) {
        input.value = '';
        return;
    }
    
    // Separar dígito verificador
    let dv = '';
    if (valor.length > 1) {
        dv = valor.slice(-1);
        valor = valor.slice(0, -1);
    }
    
    // Formatear con puntos
    let formateado = '';
    let contador = 0;
    for (let i = valor.length - 1; i >= 0; i--) {
        if (contador === 3) {
            formateado = '.' + formateado;
            contador = 0;
        }
        formateado = valor[i] + formateado;
        contador++;
    }
    
    // Agregar dígito verificador
    if (dv) {
        formateado = formateado + '-' + dv.toUpperCase();
    }
    
    input.value = formateado;
    
    // Autocompletar comercializadora
    autocompletarComercializadora();
}

function autocompletarComercializadora() {
    const rut = document.getElementById('inputRut').value.replace(/[^0-9kK]/g, ''); // RUT sin formato
    
    if (!rut || datosProveedores.length === 0) return;
    
    const headers = datosProveedores[0];
    const indexRUT = headers.findIndex(h => h && h.toLowerCase().includes('rut'));
    const indexRazonSocial = headers.findIndex(h => h && h.toLowerCase().includes('razón social'));
    
    for (let i = 1; i < datosProveedores.length; i++) {
        const fila = datosProveedores[i];
        const rutProveedor = fila[indexRUT] ? fila[indexRUT].toString().replace(/[^0-9kK]/g, '') : '';
        if (rutProveedor === rut) {
            document.getElementById('inputComercializadora').value = fila[indexRazonSocial] || '';
            break;
        }
    }
}

function autocompletarProducto(input) {
    const sku = input.value.trim();
    const row = input.closest('tr');
    const inputProducto = row.querySelector('.input-producto');
    
    if (!sku || datosSKU.length === 0) {
        inputProducto.value = '';
        return;
    }
    
    const headers = datosSKU[0];
    const indexSKU = headers.findIndex(h => h && h.toLowerCase() === 'sku');
    const indexNombre = headers.findIndex(h => h && h.toLowerCase().includes('nombre'));
    
    let encontrado = false;
    for (let i = 1; i < datosSKU.length; i++) {
        const fila = datosSKU[i];
        const skuExcel = fila[indexSKU];
        if (skuExcel === undefined || skuExcel === null) continue;
        
        // Comparar como string directo y también como entero
        const skuExcelStr = String(skuExcel).trim();
        const skuExcelInt = String(Math.floor(Number(skuExcel)));
        
        if (skuExcelStr === sku || skuExcelInt === sku) {
            inputProducto.value = fila[indexNombre] || '';
            encontrado = true;
            break;
        }
    }
    
    if (!encontrado) {
        inputProducto.value = '';
    }
}

function formatearTotalNeto(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    if (valor) {
        input.value = '$' + formatearMiles(valor);
    }
}

function calcularCostoUnitario(input) {
    const row = input.closest('tr');
    const cantidad = Number(row.querySelector('.input-cantidad').value) || 0;
    const totalNetoStr = row.querySelector('.input-total-neto').value.replace(/[^\d]/g, '');
    const totalNeto = Number(totalNetoStr) || 0;
    const inputCostoUnitario = row.querySelector('.input-costo-unitario');
    
    if (cantidad > 0 && totalNeto > 0) {
        const costoUnitario = totalNeto / cantidad;
        inputCostoUnitario.value = '$' + formatearMiles(costoUnitario.toFixed(2));
    } else {
        inputCostoUnitario.value = '';
    }
}

function agregarFilaProducto() {
    const tbody = document.getElementById('productosBody');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td><input type="text" class="input-sku" onblur="autocompletarProducto(this)"></td>
        <td><input type="text" class="input-producto" readonly></td>
        <td><input type="number" class="input-cantidad" oninput="calcularCostoUnitario(this)"></td>
        <td><input type="text" class="input-total-neto" oninput="formatearTotalNeto(this); calcularCostoUnitario(this)"></td>
        <td><input type="text" class="input-costo-unitario" readonly></td>
        <td><button class="btn-eliminar" onclick="eliminarFila(this)">🗑️</button></td>
    `;
    tbody.appendChild(nuevaFila);
}

function eliminarFila(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    
    if (tbody.children.length > 1) {
        row.remove();
    } else {
        alert('Debe haber al menos una fila');
    }
}

async function enviarCorreo() {
    const rut = document.getElementById('inputRut').value.trim();
    const comercializadora = document.getElementById('inputComercializadora').value.trim();
    const factura = document.getElementById('inputFactura').value.trim();
    
    if (!rut || !comercializadora || !factura) {
        alert('Por favor, completa RUT, Comercializadora y Factura');
        return;
    }
    
    const tbody = document.getElementById('productosBody');
    const filas = tbody.querySelectorAll('tr');
    
    let productos = [];
    for (let fila of filas) {
        const sku = fila.querySelector('.input-sku').value.trim();
        const producto = fila.querySelector('.input-producto').value.trim();
        const cantidad = fila.querySelector('.input-cantidad').value.trim();
        const totalNeto = fila.querySelector('.input-total-neto').value.trim();
        const costoUnitario = fila.querySelector('.input-costo-unitario').value.trim();
        
        if (sku && producto && cantidad && totalNeto) {
            productos.push({ sku, producto, cantidad, totalNeto, costoUnitario });
        }
    }
    
    if (productos.length === 0) {
        alert('Por favor, ingresa al menos un producto');
        return;
    }
    
    // Crear tabla HTML para el correo (sin encabezado duplicado)
    let tablaHTML = `
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #0ea5e9; color: white;">
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Total Neto</th>
                    <th>Costo Unitario Neto</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    productos.forEach(p => {
        tablaHTML += `
            <tr>
                <td>${p.sku}</td>
                <td>${p.producto}</td>
                <td>${p.cantidad}</td>
                <td>${p.totalNeto}</td>
                <td>${p.costoUnitario}</td>
            </tr>
        `;
    });
    
    tablaHTML += `
            </tbody>
        </table>
    `;
    
    const loading = document.getElementById('loading-ingreso');
    const error = document.getElementById('error-ingreso');
    const success = document.getElementById('success-ingreso');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    success.style.display = 'none';
    
    // Simular envío de correo (requiere configuración de EmailJS o backend)
    try {
        // Configuración de EmailJS
        // IMPORTANTE: Debes registrarte en https://www.emailjs.com/ y obtener tus credenciales
        
        // Inicializar EmailJS (reemplaza 'YOUR_PUBLIC_KEY' con tu clave pública de EmailJS)
        if (typeof emailjs !== 'undefined') {
            emailjs.init('VFYHp2vte2ZfWPxN-'); // Public Key de EmailJS
            
            // Parámetros del email
            const templateParams = {
                to_email: 'inventario@alimentika.cl',
                from_email: 'sistema@asap.cl',
                subject: `RECEPCION PRODUCTOS: ${comercializadora} - ${factura}`,
                message: tablaHTML,
                rut: rut,
                comercializadora: comercializadora,
                factura: factura
            };
            
            // Enviar email (reemplaza 'YOUR_SERVICE_ID' y 'YOUR_TEMPLATE_ID')
            await emailjs.send('service_vwuajvh', 'template_xmd7k5o', templateParams);
            
            loading.style.display = 'none';
            success.style.display = 'block';
            success.textContent = '✅ Correo enviado exitosamente';
            
            // Limpiar formulario
            document.getElementById('inputRut').value = '';
            document.getElementById('inputComercializadora').value = '';
            document.getElementById('inputFactura').value = '';
            tbody.innerHTML = `
                <tr>
                    <td><input type="text" class="input-sku" onblur="autocompletarProducto(this)"></td>
                    <td><input type="text" class="input-producto" readonly></td>
                    <td><input type="number" class="input-cantidad" oninput="calcularCostoUnitario(this)"></td>
                    <td><input type="text" class="input-total-neto" oninput="formatearTotalNeto(this); calcularCostoUnitario(this)"></td>
                    <td><input type="text" class="input-costo-unitario" readonly></td>
                    <td><button class="btn-eliminar" onclick="eliminarFila(this)">🗑️</button></td>
                </tr>
            `;
        } else {
            throw new Error('EmailJS no está cargado. Verifica tu conexión a internet.');
        }
        
    } catch (err) {
        console.error('Error al enviar correo:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
        error.innerHTML = `
            ❌ Error al enviar correo: ${err.message || err.text || 'Error desconocido'}<br><br>
            <strong>Instrucciones para configurar EmailJS:</strong><br>
            1. Regístrate en <a href="https://www.emailjs.com/" target="_blank">EmailJS.com</a><br>
            2. Crea un servicio de email<br>
            3. Crea un template de email<br>
            4. Copia tu Public Key, Service ID y Template ID<br>
            5. Actualiza el archivo script.js con tus credenciales<br><br>
            <em>Datos del formulario guardados en consola para referencia</em>
        `;
        
        // Guardar en consola para referencia
        console.log('Datos del correo a enviar:', {
            to: 'inventario@alimentika.cl',
            from: 'sistema@asap.cl',
            subject: `Ingreso de Productos - Factura ${factura}`,
            html: tablaHTML
        });
    }
}

// ===== VENTANA PRONÓSTICO (Calculado) =====
async function cargarDatosPronostico() {
    const loading = document.getElementById('loading-pronostico');
    const error = document.getElementById('error-pronostico');

    loading.style.display = 'block';
    error.style.display = 'none';

    try {
        // Cargar BBDD si no está cargado
        if (datosBBDD.length === 0) {
            const response = await fetch('Excel/BBDD.xlsx');
            if (!response.ok) throw new Error('No se pudo cargar BBDD.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const primeraHoja = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeraHoja];
            datosBBDD = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        // Cargar SKU si no está cargado
        if (datosSKU.length === 0) {
            await cargarDatosSKU();
        }

        actualizarPronostico();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al calcular pronóstico: ' + err.message;
    }
}

function actualizarPronostico() {
    const anio = parseInt(document.getElementById('filtroAnioPronostico').value);
    const error = document.getElementById('error-pronostico');
    error.style.display = 'none';

    if (datosSKU.length === 0 || datosBBDD.length === 0) return;

    const headersSKU = datosSKU[0];
    const headersBBDD = datosBBDD[0];

    const indexSKU_SKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'sku');
    const indexNombre_SKU = headersSKU.findIndex(h => h && h.toLowerCase().includes('nombre'));

    let indexIDProducto_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'idproducto');
    if (indexIDProducto_BBDD < 0) {
        indexIDProducto_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'id entero');
    }
    const indexCantidad_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('cantidad'));
    let indexFechaEntero_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'fecha entero');
    if (indexFechaEntero_BBDD < 0) {
        indexFechaEntero_BBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('fecha'));
    }

    const EXCEL_EPOCH = new Date('1899-12-30').getTime();
    function excelSerialToDate(serial) {
        const num = Number(serial);
        if (isNaN(num) || num <= 0) return null;
        return new Date(EXCEL_EPOCH + num * 86400000);
    }

    const filasSKU = datosSKU.slice(1);

    // === FUNCIONES AUXILIARES DE FECHA ===
    // Obtener el lunes de la semana ISO 1 de un año dado
    function lunesSemanaISO1(year) {
        // El 4 de enero siempre está en la semana ISO 1
        const ene4 = new Date(Date.UTC(year, 0, 4));
        // Retroceder al lunes de esa semana (lunes=1, domingo=0→7)
        const diaSemana = ene4.getUTCDay() || 7; // convertir domingo(0) a 7
        return new Date(Date.UTC(year, 0, 4 - (diaSemana - 1)));
    }

    // Generar rangos de fecha para 52 semanas ISO de un año
    function generarRangosSemanas(year) {
        const lunes1 = lunesSemanaISO1(year);
        const rangos = [];
        for (let i = 0; i < 52; i++) {
            const inicio = new Date(lunes1.getTime() + i * 7 * 86400000);
            const fin = new Date(inicio.getTime() + 6 * 86400000); // domingo
            rangos.push({ inicio: inicio.getTime(), fin: fin.getTime() + 86400000 - 1 }); // fin incluye todo el domingo
        }
        return rangos;
    }

    // Generar rangos de fecha para 12 meses de un año
    function generarRangosMeses(year) {
        const rangos = [];
        for (let m = 0; m < 12; m++) {
            const inicio = new Date(Date.UTC(year, m, 1));
            const fin = new Date(Date.UTC(year, m + 1, 0)); // último día del mes
            rangos.push({ inicio: inicio.getTime(), fin: fin.getTime() + 86400000 - 1 });
        }
        return rangos;
    }

    // Generar rangos mensuales para 3 años (36 meses): anio-2, anio-1, anio
    const rangosMensuales36 = [];
    for (let a = anio - 2; a <= anio; a++) {
        rangosMensuales36.push(...generarRangosMeses(a));
    }

    // Generar rangos semanales para 2 años (104 semanas): anio-1, anio
    const rangosSemanales104 = [];
    rangosSemanales104.push(...generarRangosSemanas(anio - 1));
    rangosSemanales104.push(...generarRangosSemanas(anio));

    // Pre-convertir todas las fechas de BBDD a timestamps para comparar rápido
    const bbddConFechas = [];
    for (let i = 1; i < datosBBDD.length; i++) {
        const filaBBDD = datosBBDD[i];
        const fechaEnteroVal = filaBBDD[indexFechaEntero_BBDD];
        if (!fechaEnteroVal) continue;
        const fechaObj = excelSerialToDate(fechaEnteroVal);
        if (!fechaObj) continue;
        bbddConFechas.push({
            idProd: String(filaBBDD[indexIDProducto_BBDD]).trim(),
            cantidad: Number(filaBBDD[indexCantidad_BBDD]) || 0,
            timestamp: fechaObj.getTime()
        });
    }

    // === CÁLCULO MENSUAL ===
    const datosMensual = [];
    filasSKU.forEach(filaSKU => {
        const skuOrig = filaSKU[indexSKU_SKU];
        if (skuOrig === undefined || skuOrig === null) return;
        const skuStr = String(skuOrig).trim();
        const skuInt = String(Math.floor(Number(skuOrig)));
        const nombre = filaSKU[indexNombre_SKU] || '';

        // Consumo para 36 meses usando rangos de fecha explícitos
        const consumoHistorico = new Array(36).fill(0);
        bbddConFechas.forEach(reg => {
            if (reg.idProd !== skuStr && reg.idProd !== skuInt) return;
            for (let p = 0; p < 36; p++) {
                if (reg.timestamp >= rangosMensuales36[p].inicio && reg.timestamp <= rangosMensuales36[p].fin) {
                    consumoHistorico[p] += reg.cantidad;
                    break; // Una fecha solo puede caer en un mes
                }
            }
        });

        const consumoAnio = consumoHistorico.slice(24, 36);

        const pronostico = [];
        const ici = [];
        const ics = [];

        for (let m = 0; m < 12; m++) {
            const idxGlobal = 24 + m;
            const ct_1 = idxGlobal >= 1 ? consumoHistorico[idxGlobal - 1] : 0;
            const ct_2 = idxGlobal >= 2 ? consumoHistorico[idxGlobal - 2] : 0;

            let pron = 0;
            if (idxGlobal >= 2) {
                pron = (ct_1 + ct_2) / 2;
            } else if (idxGlobal >= 1) {
                pron = ct_1;
            }
            pronostico.push(pron);

            const historicosDisponibles = consumoHistorico.slice(0, idxGlobal).filter(v => v > 0);
            let sigma = 0;
            if (historicosDisponibles.length >= 2) {
                const media = historicosDisponibles.reduce((a, b) => a + b, 0) / historicosDisponibles.length;
                const varianza = historicosDisponibles.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (historicosDisponibles.length - 1);
                sigma = Math.sqrt(varianza);
            }

            ici.push(Math.max(0, Math.round(pron - 1.96 * sigma)));
            ics.push(Math.round(pron + 1.96 * sigma));
        }

        datosMensual.push({
            sku: skuOrig,
            nombre: nombre,
            consumo: consumoAnio,
            pronostico: pronostico.map(v => Math.round(v)),
            ici: ici,
            ics: ics
        });
    });

    // === CÁLCULO SEMANAL ===
    const datosSemanal = [];
    filasSKU.forEach(filaSKU => {
        const skuOrig = filaSKU[indexSKU_SKU];
        if (skuOrig === undefined || skuOrig === null) return;
        const skuStr = String(skuOrig).trim();
        const skuInt = String(Math.floor(Number(skuOrig)));
        const nombre = filaSKU[indexNombre_SKU] || '';

        // Consumo para 104 semanas usando rangos de fecha explícitos
        const consumoSemanalHist = new Array(104).fill(0);
        bbddConFechas.forEach(reg => {
            if (reg.idProd !== skuStr && reg.idProd !== skuInt) return;
            for (let p = 0; p < 104; p++) {
                if (reg.timestamp >= rangosSemanales104[p].inicio && reg.timestamp <= rangosSemanales104[p].fin) {
                    consumoSemanalHist[p] += reg.cantidad;
                    break; // Una fecha solo puede caer en una semana
                }
            }
        });

        const consumoAnioSemanal = consumoSemanalHist.slice(52, 104);
        const pronosticoSem = [];
        const iciSem = [];
        const icsSem = [];

        for (let s = 0; s < 52; s++) {
            const idxGlobal = 52 + s;
            const ct_1 = idxGlobal >= 1 ? consumoSemanalHist[idxGlobal - 1] : 0;
            const ct_2 = idxGlobal >= 2 ? consumoSemanalHist[idxGlobal - 2] : 0;

            let pron = 0;
            if (idxGlobal >= 2) {
                pron = (ct_1 + ct_2) / 2;
            } else if (idxGlobal >= 1) {
                pron = ct_1;
            }
            pronosticoSem.push(pron);

            const historicosDisponibles = consumoSemanalHist.slice(0, idxGlobal).filter(v => v > 0);
            let sigma = 0;
            if (historicosDisponibles.length >= 2) {
                const media = historicosDisponibles.reduce((a, b) => a + b, 0) / historicosDisponibles.length;
                const varianza = historicosDisponibles.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (historicosDisponibles.length - 1);
                sigma = Math.sqrt(varianza);
            }

            iciSem.push(Math.max(0, Math.round(pron - 1.96 * sigma)));
            icsSem.push(Math.round(pron + 1.96 * sigma));
        }

        datosSemanal.push({
            sku: skuOrig,
            nombre: nombre,
            consumo: consumoAnioSemanal,
            pronostico: pronosticoSem.map(v => Math.round(v)),
            ici: iciSem,
            ics: icsSem
        });
    });

    // Guardar datos globalmente para filtrado
    window._datosPronosticoMensual = datosMensual;
    window._datosPronosticoSemanal = datosSemanal;
    window._anioPronostico = anio;

    renderizarTablaPronostico(datosMensual, 'tableContainer-pronostico-mensual', 'mensual', anio);
    renderizarTablaPronostico(datosSemanal, 'tableContainer-pronostico-semanal', 'semanal', anio);

    const skuCountEl = document.getElementById('skuCountPronostico');
    if (skuCountEl) skuCountEl.textContent = `${filasSKU.length} SKU`;
}

function renderizarTablaPronostico(datos, containerId, tipo, anio) {
    const container = document.getElementById(containerId);

    const filtroSKU = (document.getElementById('filtroSKUPronostico')?.value || '').toLowerCase();
    const filtroProducto = (document.getElementById('filtroProductoPronostico')?.value || '').toLowerCase();

    let datosFiltrados = datos;
    if (filtroSKU) {
        datosFiltrados = datosFiltrados.filter(d => String(d.sku).toLowerCase().includes(filtroSKU));
    }
    if (filtroProducto) {
        datosFiltrados = datosFiltrados.filter(d => String(d.nombre).toLowerCase().includes(filtroProducto));
    }

    if (!datosFiltrados || datosFiltrados.length === 0) {
        container.innerHTML = '<p class="placeholder">No hay datos para mostrar</p>';
        return;
    }

    const esMensual = tipo === 'mensual';
    const numPeriodos = esMensual ? 12 : 52;

    let html = '<table class="excel-table tabla-pronostico tabla-sticky-cols"><thead>';

    // Fila 1: Headers de períodos
    html += '<tr class="header-semanas">';
    html += '<th class="sticky-col sticky-col-0" rowspan="2">SKU</th>';
    html += '<th class="sticky-col sticky-col-1" rowspan="2">Producto</th>';
    for (let i = 0; i < numPeriodos; i++) {
        let label, fechaInicio, fechaFin;
        if (esMensual) {
            label = `MES ${String(i + 1).padStart(2, '0')}`;
            const primerDia = new Date(Date.UTC(anio, i, 1));
            const ultimoDia = new Date(Date.UTC(anio, i + 1, 0));
            fechaInicio = `${String(primerDia.getUTCDate()).padStart(2, '0')}/${String(primerDia.getUTCMonth() + 1).padStart(2, '0')}`;
            fechaFin = `${String(ultimoDia.getUTCDate()).padStart(2, '0')}/${String(ultimoDia.getUTCMonth() + 1).padStart(2, '0')}`;
        } else {
            label = `SEM ${i + 1}`;
            const primerEnero = new Date(Date.UTC(anio, 0, 1));
            const diaLunes = new Date(primerEnero.getTime() + ((i) * 7 - ((primerEnero.getUTCDay() + 6) % 7)) * 86400000);
            const diaDomingo = new Date(diaLunes.getTime() + 6 * 86400000);
            fechaInicio = `${String(diaLunes.getUTCDate()).padStart(2, '0')}/${String(diaLunes.getUTCMonth() + 1).padStart(2, '0')}`;
            fechaFin = `${String(diaDomingo.getUTCDate()).padStart(2, '0')}/${String(diaDomingo.getUTCMonth() + 1).padStart(2, '0')}`;
        }
        html += `<th colspan="4" class="header-semana">${label}<br><small>${fechaInicio} - ${fechaFin}</small></th>`;
    }
    html += '</tr>';

    // Fila 2: Sub-headers
    html += '<tr class="header-sub">';
    for (let i = 0; i < numPeriodos; i++) {
        html += '<th class="sub-header sub-consumo">CONSUMO</th>';
        html += '<th class="sub-header sub-pronostico">PRONÓSTICO</th>';
        html += '<th class="sub-header sub-ici">ICI</th>';
        html += '<th class="sub-header sub-ics">ICS</th>';
    }
    html += '</tr></thead><tbody>';

    // Datos
    datosFiltrados.forEach(d => {
        html += '<tr>';
        html += `<td class="sticky-col sticky-col-0">${d.sku !== null ? d.sku : ''}</td>`;
        html += `<td class="sticky-col sticky-col-1">${d.nombre}</td>`;
        for (let i = 0; i < numPeriodos; i++) {
            const consumo = d.consumo[i] || 0;
            const pron = d.pronostico[i] || 0;
            const iciVal = d.ici[i] || 0;
            const icsVal = d.ics[i] || 0;

            html += `<td class="col-center col-consumo">${formatearMiles(consumo)}</td>`;
            html += `<td class="col-center col-pronostico">${formatearMiles(pron)}</td>`;
            html += `<td class="col-center col-ici">${formatearMiles(iciVal)}</td>`;
            html += `<td class="col-center col-ics">${formatearMiles(icsVal)}</td>`;
        }
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
    agregarColumnHighlight(container);
}

function filtrarTablaPronostico() {
    if (!window._datosPronosticoMensual) return;
    const anio = window._anioPronostico || 2026;
    renderizarTablaPronostico(window._datosPronosticoMensual, 'tableContainer-pronostico-mensual', 'mensual', anio);
    renderizarTablaPronostico(window._datosPronosticoSemanal, 'tableContainer-pronostico-semanal', 'semanal', anio);
}

// ===== FUNCIONES AUXILIARES =====
function formatearMiles(numero) {
    return Number(numero).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Función para filtrar y ordenar la tabla de Consumo
function filtrarTablaConsumo() {
    if (!window._datosConsumoCompletos || window._datosConsumoCompletos.length < 2) return;
    
    const filtroSKU = (document.getElementById('filtroSKUConsumo')?.value || '').toLowerCase();
    const filtroNombre = (document.getElementById('filtroNombreConsumo')?.value || '').toLowerCase();
    const ordenColumna = document.getElementById('ordenConsumoColumna')?.value || 'original';
    const ordenDir = document.getElementById('ordenConsumoDir')?.value || 'asc';
    
    const headers = window._datosConsumoCompletos[0];
    let filas = window._datosConsumoCompletos.slice(1);
    
    // Filtrar por SKU y Nombre
    if (filtroSKU) {
        filas = filas.filter(f => String(f[0]).toLowerCase().includes(filtroSKU));
    }
    if (filtroNombre) {
        filas = filas.filter(f => String(f[1]).toLowerCase().includes(filtroNombre));
    }
    
    // Ordenar
    if (ordenColumna !== 'original') {
        const colIdx = ordenColumna === 'sku' ? 0 : 1;
        filas.sort((a, b) => {
            const valA = String(a[colIdx] || '').toLowerCase();
            const valB = String(b[colIdx] || '').toLowerCase();
            // Intentar comparar numéricamente si ambos son números
            const numA = Number(a[colIdx]);
            const numB = Number(b[colIdx]);
            if (!isNaN(numA) && !isNaN(numB)) {
                return ordenDir === 'asc' ? numA - numB : numB - numA;
            }
            return ordenDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    }
    
    const datosFiltrados = [headers, ...filas];
    mostrarTablaSinFiltros(datosFiltrados, 'tableContainer-consumo');
    
    // Actualizar contador
    const skuCountEl = document.getElementById('skuCountConsumo');
    if (skuCountEl) skuCountEl.textContent = `${filas.length} SKU mostrados`;
}

// Tabla sin filtros para pestaña Consumo
function mostrarTablaSinFiltros(datos, containerId) {
    const tableContainer = document.getElementById(containerId);
    if (!datos || datos.length < 2) {
        tableContainer.innerHTML = '<p class="placeholder">No hay datos para mostrar</p>';
        return;
    }
    
    const headers = datos[0];
    const filas = datos.slice(1);
    
    // Detectar si hay muchas columnas (semanal) para activar sticky
    const usarSticky = headers.length > 6;
    
    let html = '<table class="excel-table' + (usarSticky ? ' tabla-sticky-cols' : '') + '" id="tabla-' + containerId + '"><thead><tr>';
    headers.forEach((header, index) => {
        let stickyStyle = '';
        let stickyClass = '';
        if (usarSticky && index === 0) {
            stickyClass = ' sticky-col sticky-col-0';
        } else if (usarSticky && index === 1) {
            stickyClass = ' sticky-col sticky-col-1';
        }
        html += `<th data-col="${index}" class="${stickyClass}"><span class="header-text">${header || 'Col ' + (index + 1)}</span></th>`;
    });
    html += '</tr></thead><tbody>';
    filas.forEach(fila => {
        html += '<tr>';
        headers.forEach((header, colIndex) => {
            let valor = fila[colIndex] !== undefined ? fila[colIndex] : '';
            let stickyClass = '';
            let centrado = '';
            
            if (usarSticky && colIndex === 0) {
                stickyClass = ' sticky-col sticky-col-0';
            } else if (usarSticky && colIndex === 1) {
                stickyClass = ' sticky-col sticky-col-1';
            }
            
            // Centrar todas las columnas excepto SKU (col 0) y Nombre (col 1) en Consumo
            if (containerId === 'tableContainer-consumo' && colIndex > 1) {
                centrado = ' col-center';
            }
            
            // Formatear números con separador de miles (excepto SKU y Nombre)
            if (colIndex > 1 && valor !== '' && !isNaN(valor) && valor !== null) {
                valor = formatearMiles(valor);
            }
            
            html += `<td data-col="${colIndex}" class="${stickyClass}${centrado}">${valor}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
    
    // Agregar highlight de columna al hover
    agregarColumnHighlight(tableContainer);
}

// Función para highlight de columna al pasar el mouse
function agregarColumnHighlight(container) {
    const tabla = container.querySelector('table');
    if (!tabla) return;
    
    tabla.addEventListener('mouseover', function(e) {
        const td = e.target.closest('td');
        if (!td) return;
        const colIndex = td.getAttribute('data-col');
        if (colIndex === null) return;
        // Agregar clase a todas las celdas de la misma columna
        tabla.querySelectorAll('td[data-col="' + colIndex + '"]').forEach(cell => {
            cell.classList.add('col-highlight');
        });
    });
    
    tabla.addEventListener('mouseout', function(e) {
        const td = e.target.closest('td');
        if (!td) return;
        const colIndex = td.getAttribute('data-col');
        if (colIndex === null) return;
        tabla.querySelectorAll('td[data-col="' + colIndex + '"]').forEach(cell => {
            cell.classList.remove('col-highlight');
        });
    });
}

function mostrarTablaGenericaConFiltros(datos, containerId) {
    const tableContainer = document.getElementById(containerId);
    if (!datos || datos.length < 2) {
        tableContainer.innerHTML = '<p class="placeholder">No hay datos para mostrar</p>';
        return;
    }
    
    const headers = datos[0];
    const filas = datos.slice(1);
    
    // Configuración de centrado por pestaña
    let colsCentrar = [];
    if (containerId === 'tableContainer-proveedores') {
        colsCentrar = ['rut', 'nombre', 'días de pago', 'dias de pago', 'lead time'];
    } else if (containerId === 'tableContainer-stock-actual') {
        colsCentrar = ['um', 'stock actual'];
    }
    
    let html = '<table class="excel-table"><thead><tr>';
    
    headers.forEach((header, index) => {
        const hLower = (header || '').toLowerCase();
        const centrar = colsCentrar.some(c => hLower.includes(c));
        const clsAttr = centrar ? ' class="col-center"' : '';
        html += `<th${clsAttr}>
            <div class="header-cell">
                <span class="header-text">${header || 'Col ' + (index + 1)}</span>
                <input type="text" class="column-filter" placeholder="Filtrar..." 
                       onkeyup="filtrarTabla('${containerId}', ${index}, this.value)">
            </div>
        </th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    filas.forEach(fila => {
        html += '<tr>';
        headers.forEach((header, colIndex) => {
            const valor = fila[colIndex] !== undefined ? fila[colIndex] : '';
            const hLower = (header || '').toLowerCase();
            const centrar = colsCentrar.some(c => hLower.includes(c));
            const clsAttr = centrar ? ' class="col-center"' : '';
            html += `<td${clsAttr}>${valor}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function filtrarTabla(containerId, columnaIndex, filtro) {
    const container = document.getElementById(containerId);
    const tabla = container.querySelector('table');
    if (!tabla) return;
    
    const tbody = tabla.querySelector('tbody');
    const filas = tbody.querySelectorAll('tr');
    
    const filtroLower = filtro.toLowerCase();
    
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas[columnaIndex]) {
            const texto = celdas[columnaIndex].textContent.toLowerCase();
            
            // Verificar todos los filtros activos
            let mostrar = true;
            const filtrosActivos = container.querySelectorAll('.column-filter');
            filtrosActivos.forEach((f, index) => {
                if (f.value.trim() !== '') {
                    const valorCelda = celdas[index] ? celdas[index].textContent.toLowerCase() : '';
                    if (!valorCelda.includes(f.value.toLowerCase())) {
                        mostrar = false;
                    }
                }
            });
            
            fila.style.display = mostrar ? '' : 'none';
        }
    });
}

// ===== VENTANA COMPRAS =====
async function cargarDatosCompras() {
    const loading = document.getElementById('loading-compras');
    const error = document.getElementById('error-compras');

    loading.style.display = 'block';
    error.style.display = 'none';

    try {
        // Cargar SKU si no está cargado
        if (datosSKU.length === 0) {
            await cargarDatosSKU();
        }

        // Cargar Proveedores si no está cargado
        if (datosProveedores.length === 0) {
            await cargarDatosProveedores();
        }

        // Cargar Stock Actual si no está cargado
        if (datosStockActual.length === 0) {
            const responseStock = await fetch('Excel/Stock Actual.xlsx');
            if (!responseStock.ok) throw new Error('No se pudo cargar Excel/Stock Actual.xlsx');
            const arrayBufferStock = await responseStock.arrayBuffer();
            const workbookStock = XLSX.read(arrayBufferStock, { type: 'array' });
            const hojaStock = workbookStock.SheetNames[0];
            const worksheetStock = workbookStock.Sheets[hojaStock];
            datosStockActual = XLSX.utils.sheet_to_json(worksheetStock, { header: 1 });
        }

        // Cargar BBDD si no está cargado
        if (datosBBDD.length === 0) {
            const response = await fetch('Excel/BBDD.xlsx');
            if (!response.ok) throw new Error('No se pudo cargar BBDD.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const primeraHoja = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[primeraHoja];
            datosBBDD = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }

        // Calcular Pronóstico si no se ha calculado
        if (!window._datosPronosticoSemanal) {
            actualizarPronostico();
        }

        // Inicializar selector de semanas
        inicializarSemanaCompras();

        // Construir y renderizar
        actualizarCompras();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar datos de Compras: ' + err.message;
    }
}

function inicializarSemanaCompras() {
    const selectSemana = document.getElementById('filtroSemanaCompras');
    if (selectSemana.options.length > 0) return; // Ya inicializado

    const anio = parseInt(document.getElementById('filtroAnioCompras').value);

    // Función para obtener lunes de semana ISO 1
    function lunesSemanaISO1(year) {
        const ene4 = new Date(Date.UTC(year, 0, 4));
        const diaSemana = ene4.getUTCDay() || 7;
        return new Date(Date.UTC(year, 0, 4 - (diaSemana - 1)));
    }

    const lunes1 = lunesSemanaISO1(anio);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 52; i++) {
        const inicio = new Date(lunes1.getTime() + i * 7 * 86400000);
        const fin = new Date(inicio.getTime() + 6 * 86400000);
        const label = `S${i + 1} (${inicio.getUTCDate()} ${meses[inicio.getUTCMonth()]} - ${fin.getUTCDate()} ${meses[fin.getUTCMonth()]})`;
        const option = document.createElement('option');
        option.value = i + 1;
        option.textContent = label;
        selectSemana.appendChild(option);
    }

    // Seleccionar la semana actual por defecto
    const hoy = new Date();
    const hoyTS = hoy.getTime();
    let semanaActual = 1;
    for (let i = 0; i < 52; i++) {
        const inicio = new Date(lunes1.getTime() + i * 7 * 86400000);
        const fin = new Date(inicio.getTime() + 7 * 86400000 - 1);
        if (hoyTS >= inicio.getTime() && hoyTS <= fin.getTime()) {
            semanaActual = i + 1;
            break;
        }
    }
    selectSemana.value = semanaActual;
}

function actualizarCompras() {
    const anio = parseInt(document.getElementById('filtroAnioCompras').value);

    // Reinicializar selector de semanas al cambiar de año
    const selectSemana = document.getElementById('filtroSemanaCompras');
    selectSemana.innerHTML = '';

    function lunesSemanaISO1(year) {
        const ene4 = new Date(Date.UTC(year, 0, 4));
        const diaSemana = ene4.getUTCDay() || 7;
        return new Date(Date.UTC(year, 0, 4 - (diaSemana - 1)));
    }

    const lunes1 = lunesSemanaISO1(anio);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 52; i++) {
        const inicio = new Date(lunes1.getTime() + i * 7 * 86400000);
        const fin = new Date(inicio.getTime() + 6 * 86400000);
        const label = `S${i + 1} (${inicio.getUTCDate()} ${meses[inicio.getUTCMonth()]} - ${fin.getUTCDate()} ${meses[fin.getUTCMonth()]})`;
        const option = document.createElement('option');
        option.value = i + 1;
        option.textContent = label;
        selectSemana.appendChild(option);
    }

    // Intentar seleccionar semana actual
    const hoy = new Date();
    const hoyTS = hoy.getTime();
    let semanaActual = 1;
    for (let i = 0; i < 52; i++) {
        const inicio = new Date(lunes1.getTime() + i * 7 * 86400000);
        const fin = new Date(inicio.getTime() + 7 * 86400000 - 1);
        if (hoyTS >= inicio.getTime() && hoyTS <= fin.getTime()) {
            semanaActual = i + 1;
            break;
        }
    }
    selectSemana.value = semanaActual;

    // Recalcular Pronóstico con el nuevo año si cambió
    if (window._anioPronostico !== anio) {
        document.getElementById('filtroAnioPronostico').value = anio;
        actualizarPronostico();
    }

    renderizarTablaCompras();
}

function renderizarTablaCompras() {
    const container = document.getElementById('tableContainer-compras');
    const infoSemana = document.getElementById('info-semana-compras');
    const anio = parseInt(document.getElementById('filtroAnioCompras').value);
    const semana = parseInt(document.getElementById('filtroSemanaCompras').value) || 1;
    const filtroSKU = (document.getElementById('filtroSKUCompras') ? document.getElementById('filtroSKUCompras').value : '').toLowerCase();
    const filtroNombre = (document.getElementById('filtroNombreCompras') ? document.getElementById('filtroNombreCompras').value : '').toLowerCase();
    const filtroProveedor = (document.getElementById('filtroProveedorCompras') ? document.getElementById('filtroProveedorCompras').value : '');
    const soloPedir = document.getElementById('filtroPedirCompras') ? document.getElementById('filtroPedirCompras').checked : false;
    const ordenPedir = document.getElementById('ordenPedirCompras') ? document.getElementById('ordenPedirCompras').value : '';

    if (!window._datosPronosticoSemanal || datosSKU.length === 0) {
        container.innerHTML = '<p class="placeholder">No hay datos. Primero cargue Pronóstico.</p>';
        return;
    }

    // Mostrar info del rango de la semana seleccionada
    function lunesSemanaISO1(year) {
        const ene4 = new Date(Date.UTC(year, 0, 4));
        const diaSemana = ene4.getUTCDay() || 7;
        return new Date(Date.UTC(year, 0, 4 - (diaSemana - 1)));
    }
    const lunes1 = lunesSemanaISO1(anio);
    const inicioSemana = new Date(lunes1.getTime() + (semana - 1) * 7 * 86400000);
    const finSemana = new Date(inicioSemana.getTime() + 6 * 86400000);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    infoSemana.textContent = `Semana ${semana}: ${inicioSemana.getUTCDate()} ${meses[inicioSemana.getUTCMonth()]} ${inicioSemana.getUTCFullYear()} → ${finSemana.getUTCDate()} ${meses[finSemana.getUTCMonth()]} ${finSemana.getUTCFullYear()}`;

    // Índices de SKU
    const headersSKU = datosSKU[0];
    const idxSKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'sku');
    const idxNombre = headersSKU.findIndex(h => h && h.toLowerCase().includes('nombre'));
    const idxProveedor1 = headersSKU.findIndex(h => h && h.toLowerCase().includes('proveedor 1'));
    const idxUM = headersSKU.findIndex(h => h && h.toLowerCase() === 'um');
    const idxTipoVenta = headersSKU.findIndex(h => h && h.toLowerCase().includes('tipo de venta'));
    const idxTipoCompra = headersSKU.findIndex(h => h && h.toLowerCase().includes('tipo de compra'));

    // Índices de Stock Actual
    const headersStock = datosStockActual[0];
    const idxCodigoStock = headersStock.findIndex(h => h && (h.toLowerCase().includes('código') || h.toLowerCase().includes('codigo')));
    const idxCdNunoa = headersStock.findIndex(h => h && h.toLowerCase().includes('ñuñoa'));

    // Mapa de pronóstico semanal por SKU
    const mapaPron = {};
    window._datosPronosticoSemanal.forEach(d => {
        const skuKey = String(d.sku).trim();
        mapaPron[skuKey] = d.pronostico[semana - 1] || 0;
    });

    // Construir filas
    const filas = [];
    for (let i = 1; i < datosSKU.length; i++) {
        const fila = datosSKU[i];
        const sku = fila[idxSKU];
        if (sku === undefined || sku === null) continue;

        const skuStr = String(sku).trim();
        const nombre = fila[idxNombre] || '';
        const proveedor = idxProveedor1 >= 0 ? (fila[idxProveedor1] || '') : '';
        const um = idxUM >= 0 ? (fila[idxUM] || '') : '';
        const tipoVenta = idxTipoVenta >= 0 ? (fila[idxTipoVenta] || '') : '';
        const tipoCompra = idxTipoCompra >= 0 ? (fila[idxTipoCompra] || '') : '';

        // Filtros
        if (filtroSKU && !skuStr.toLowerCase().includes(filtroSKU)) continue;
        if (filtroNombre && !String(nombre).toLowerCase().includes(filtroNombre)) continue;
        if (filtroProveedor && String(proveedor).trim() !== filtroProveedor) continue;
        // El filtro de pedir se aplica después del cálculo

        // Pronóstico de la semana seleccionada
        const skuInt = String(Math.floor(Number(sku)));
        const pronostico = mapaPron[skuStr] || mapaPron[skuInt] || 0;

        // Stock actual
        let stockActual = 0;
        for (let j = 1; j < datosStockActual.length; j++) {
            const filaStock = datosStockActual[j];
            if (filaStock[idxCodigoStock] && filaStock[idxCodigoStock].toString() === sku.toString()) {
                stockActual = Number(filaStock[idxCdNunoa]) || 0;
                break;
            }
        }

        // Pedir = Pronóstico + Stock seguridad (0) - Stock actual
        const stockSeguridad = 0;
        const pedir = Math.max(0, Math.round(pronostico + stockSeguridad - stockActual));

        filas.push({
            sku: sku,
            nombre: nombre,
            proveedor: proveedor,
            um: um,
            pronostico: pronostico,
            pedir: pedir,
            stockActual: stockActual,
            comentarios: tipoVenta,
            condiciones: tipoCompra
        });
    }

    // Aplicar filtro de pedir
    let filasVisibles = soloPedir ? filas.filter(f => f.pedir > 0) : filas;

    // Aplicar orden por pedir
    if (ordenPedir === 'asc') {
        filasVisibles = [...filasVisibles].sort((a, b) => a.pedir - b.pedir);
    } else if (ordenPedir === 'desc') {
        filasVisibles = [...filasVisibles].sort((a, b) => b.pedir - a.pedir);
    }

    // Calcular max pedir para degradado de color
    const maxPedir = filasVisibles.reduce((max, f) => Math.max(max, f.pedir), 0);

    // Recopilar proveedores únicos para el dropdown
    const proveedoresUnicos = [...new Set(filas.map(f => String(f.proveedor).trim()).filter(p => p !== ''))];
    proveedoresUnicos.sort((a, b) => a.localeCompare(b, 'es'));

    // Guardar filas visibles globalmente para descarga TXT
    window._filasComprasVisibles = filasVisibles;

    // Renderizar tabla con filtros integrados en headers
    let html = '<table class="excel-table tabla-compras">';
    // Header con filtros al costado del nombre
    html += '<thead><tr>';
    html += `<th><div class="th-con-filtro"><span>SKU</span><input type="text" id="filtroSKUCompras" class="filtro-en-tabla" placeholder="Filtrar..." value="${filtroSKU}" oninput="renderizarTablaCompras()"></div></th>`;
    html += `<th><div class="th-con-filtro"><span>Nombre</span><input type="text" id="filtroNombreCompras" class="filtro-en-tabla" placeholder="Filtrar..." value="${filtroNombre}" oninput="renderizarTablaCompras()"></div></th>`;
    // Dropdown de Proveedor
    html += `<th><div class="th-con-filtro"><span>Proveedor</span><select id="filtroProveedorCompras" class="filtro-en-tabla" onchange="renderizarTablaCompras()">`;
    html += `<option value="">Todos</option>`;
    proveedoresUnicos.forEach(p => {
        html += `<option value="${p}"${filtroProveedor === p ? ' selected' : ''}>${p}</option>`;
    });
    html += `</select></div></th>`;
    html += '<th>Pronóstico</th>';
    html += '<th>Stock Actual</th>';
    html += `<th><div class="th-con-filtro"><span>Pedir</span><div class="filtro-pedir-inline">`;
    html += `<label class="filtro-pedir-check"><input type="checkbox" id="filtroPedirCompras" ${soloPedir ? 'checked' : ''} onchange="renderizarTablaCompras()"> &gt;0</label>`;
    html += `<select id="ordenPedirCompras" class="filtro-en-tabla filtro-orden-pedir" onchange="renderizarTablaCompras()">`;
    html += `<option value=""${ordenPedir === '' ? ' selected' : ''}>--</option>`;
    html += `<option value="asc"${ordenPedir === 'asc' ? ' selected' : ''}>↑</option>`;
    html += `<option value="desc"${ordenPedir === 'desc' ? ' selected' : ''}>↓</option>`;
    html += `</select></div></div></th>`;
    html += '<th>Comentarios</th>';
    html += '<th>Condiciones</th>';
    html += '</tr></thead><tbody>';

    if (filasVisibles.length === 0) {
        html += '<tr><td colspan="8" style="text-align:center; padding:20px;">No hay datos para esta semana</td></tr>';
    } else {
        filasVisibles.forEach(f => {
            let pedirStyle = '';
            if (f.pedir > 0 && maxPedir > 0) {
                // Degradado: de amarillo suave (baja intensidad) a rojo-naranja (alta intensidad)
                const intensidad = f.pedir / maxPedir; // 0 a 1
                const r = Math.round(255);
                const g = Math.round(235 - intensidad * 135); // 235 → 100
                const b = Math.round(180 - intensidad * 140); // 180 → 40
                pedirStyle = ` style="background-color: rgb(${r},${g},${b}); font-weight: bold; color: ${intensidad > 0.6 ? '#fff' : '#333'}"`;
            }
            html += '<tr>';
            html += `<td class="col-center">${f.sku}</td>`;
            html += `<td>${f.nombre}</td>`;
            html += `<td>${f.proveedor}</td>`;
            html += `<td class="col-center">${f.pronostico}</td>`;
            html += `<td class="col-center">${f.stockActual}</td>`;
            html += `<td class="col-center"${pedirStyle}>${f.pedir}</td>`;
            html += `<td class="col-center">${f.comentarios}</td>`;
            html += `<td class="col-center">${f.condiciones}</td>`;
            html += '</tr>';
        });
    }

    html += '</tbody></table>';
    container.innerHTML = html;

    // Botón de descarga TXT fuera del contenedor de tabla
    const descargaWrapper = document.getElementById('compras-descarga-wrapper');
    if (descargaWrapper) {
        let htmlDesc = `<div class="compras-descarga-container">`;
        htmlDesc += `<button class="btn-descargar-txt" onclick="descargarComprasTXT()" title="Descargar productos visibles como archivo de texto">`;
        htmlDesc += `📥 Descargar lista (.txt)`;
        htmlDesc += `</button>`;
        htmlDesc += `<span class="compras-descarga-info">${filasVisibles.length} producto${filasVisibles.length !== 1 ? 's' : ''} visible${filasVisibles.length !== 1 ? 's' : ''}</span>`;
        htmlDesc += `</div>`;
        descargaWrapper.innerHTML = htmlDesc;
    }

    // Restaurar foco en el input que estaba activo
    const activeId = document.activeElement ? document.activeElement.id : '';
    if (activeId === 'filtroSKUCompras' || activeId === 'filtroNombreCompras') {
        const el = document.getElementById(activeId);
        if (el) {
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
        }
    }
}

function descargarComprasTXT() {
    const filas = window._filasComprasVisibles;
    if (!filas || filas.length === 0) {
        alert('No hay productos visibles para descargar.');
        return;
    }

    const anio = document.getElementById('filtroAnioCompras').value;
    const semana = document.getElementById('filtroSemanaCompras').value;
    const semanaTexto = document.getElementById('filtroSemanaCompras').selectedOptions[0]?.textContent || `S${semana}`;

    let contenido = `LISTA DE COMPRAS - Año ${anio} - ${semanaTexto}\n`;
    contenido += `Generado: ${new Date().toLocaleString('es-CL')}\n`;
    contenido += `Total productos: ${filas.length}\n`;
    contenido += '='.repeat(80) + '\n';

    // Agrupar por proveedor
    const grupos = {};
    filas.forEach(f => {
        const prov = String(f.proveedor).trim() || 'SIN PROVEEDOR';
        if (!grupos[prov]) grupos[prov] = [];
        grupos[prov].push(f);
    });

    const proveedoresOrdenados = Object.keys(grupos).sort((a, b) => a.localeCompare(b, 'es'));

    proveedoresOrdenados.forEach(prov => {
        const productos = grupos[prov];

        contenido += `\n▸ ${prov}\n`;

        productos.forEach(f => {
            contenido += `${f.sku}\t${f.nombre} - ${f.pedir} ${f.um}\n`;
        });
    });

    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Compras_${anio}_S${semana}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== VENTANA HISTORIAL DE PRECIOS =====
let datosHistorialPrecios = [];
let historialFileHandle = null; // File System Access API handle

async function cargarHistorialPrecios() {
    const loading = document.getElementById('loading-historial');
    const error = document.getElementById('error-historial');

    loading.style.display = 'block';
    error.style.display = 'none';

    try {
        if (datosSKU.length === 0) {
            await cargarDatosSKU();
        }
        if (datosProveedores.length === 0) {
            await cargarDatosProveedores();
        }

        // Auto-leer el archivo existente
        if (historialFileHandle) {
            await leerDesdeFileHandle();
        } else {
            // Leer via fetch para mostrar datos (solo lectura)
            try {
                const response = await fetch('Excel/Historial de Precios.xlsx', { cache: 'no-store' });
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const primeraHoja = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[primeraHoja];
                    datosHistorialPrecios = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                }
            } catch (e) { /* archivo no existe aún */ }
        }

        const hoy = new Date();
        const fechaInput = document.getElementById('inputFechaHistorial');
        if (fechaInput && !fechaInput.value) {
            fechaInput.value = hoy.toISOString().split('T')[0];
        }

        renderizarTablaHistorial();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = '❌ Error al cargar datos: ' + err.message;
    }
}

async function obtenerFileHandle() {
    if (historialFileHandle) return historialFileHandle;

    // Primera vez: pedir al usuario que seleccione el archivo (solo una vez por sesión)
    const [handle] = await window.showOpenFilePicker({
        types: [{
            description: 'Historial de Precios',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
        }],
        multiple: false
    });

    historialFileHandle = handle;

    // Actualizar indicador
    const archivoInfo = document.getElementById('archivo-vinculado');
    archivoInfo.textContent = '✅ Vinculado: ' + handle.name;
    archivoInfo.classList.add('vinculado');

    return handle;
}

async function leerDesdeFileHandle() {
    if (!historialFileHandle) return;

    const file = await historialFileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const primeraHoja = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[primeraHoja];
    datosHistorialPrecios = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
}

function autocompletarNombreHistorial() {
    const sku = document.getElementById('inputSKUHistorial').value.trim();
    const inputNombre = document.getElementById('inputNombreHistorial');

    if (!sku || datosSKU.length === 0) {
        inputNombre.value = '';
        return;
    }

    const headers = datosSKU[0];
    const indexSKU = headers.findIndex(h => h && h.toLowerCase() === 'sku');
    const indexNombre = headers.findIndex(h => h && h.toLowerCase().includes('nombre'));

    for (let i = 1; i < datosSKU.length; i++) {
        const fila = datosSKU[i];
        const skuExcel = fila[indexSKU];
        if (skuExcel === undefined || skuExcel === null) continue;

        const skuExcelStr = String(skuExcel).trim();
        const skuExcelInt = String(Math.floor(Number(skuExcel)));

        if (skuExcelStr === sku || skuExcelInt === sku) {
            inputNombre.value = fila[indexNombre] || '';
            return;
        }
    }
    inputNombre.value = '';
}

function formatearRUTHistorial(input) {
    let valor = input.value.replace(/[^0-9kK]/g, '');
    if (valor.length === 0) {
        input.value = '';
        autocompletarProveedorHistorial();
        return;
    }

    const dv = valor.slice(-1);
    let cuerpo = valor.slice(0, -1);

    let formateado = '';
    while (cuerpo.length > 3) {
        formateado = '.' + cuerpo.slice(-3) + formateado;
        cuerpo = cuerpo.slice(0, -3);
    }
    formateado = cuerpo + formateado;

    if (valor.length > 1) {
        formateado = formateado + '-' + dv.toUpperCase();
    }

    input.value = formateado;
    autocompletarProveedorHistorial();
}

function autocompletarProveedorHistorial() {
    const rut = document.getElementById('inputRutHistorial').value.replace(/[^0-9kK]/g, '');
    const inputNombreProv = document.getElementById('inputNombreProvHistorial');

    if (!rut || datosProveedores.length === 0) {
        inputNombreProv.value = '';
        return;
    }

    const headers = datosProveedores[0];
    const indexRUT = headers.findIndex(h => h && h.toLowerCase().includes('rut'));
    const indexNombre = headers.findIndex(h => h && h.toLowerCase().includes('nombre'));

    for (let i = 1; i < datosProveedores.length; i++) {
        const fila = datosProveedores[i];
        const rutProveedor = fila[indexRUT] ? fila[indexRUT].toString().replace(/[^0-9kK]/g, '') : '';
        if (rutProveedor === rut) {
            inputNombreProv.value = fila[indexNombre] || '';
            return;
        }
    }
    inputNombreProv.value = '';
}

function formatearPrecioHistorial(input) {
    // Extraer solo dígitos
    let valor = input.value.replace(/[^0-9]/g, '');
    if (valor === '') {
        input.value = '';
        return;
    }
    // Formatear con separador de miles y signo peso
    const numero = parseInt(valor, 10);
    const formateado = '$' + numero.toLocaleString('es-CL');
    input.value = formateado;
}

function obtenerPrecioNumerico() {
    const valor = document.getElementById('inputPrecioHistorial').value;
    return parseInt(valor.replace(/[^0-9]/g, ''), 10) || 0;
}

async function ingresarRegistroHistorial() {
    const sku = document.getElementById('inputSKUHistorial').value.trim();
    const nombre = document.getElementById('inputNombreHistorial').value.trim();
    const rutProv = document.getElementById('inputRutHistorial').value.trim();
    const nombreProv = document.getElementById('inputNombreProvHistorial').value.trim();
    const precio = obtenerPrecioNumerico();
    const fecha = document.getElementById('inputFechaHistorial').value;

    const error = document.getElementById('error-historial');
    const success = document.getElementById('success-historial');
    error.style.display = 'none';
    success.style.display = 'none';

    // Validaciones
    if (!sku) {
        error.style.display = 'block';
        error.textContent = '❌ Debe ingresar un SKU.';
        return;
    }
    if (!fecha) {
        error.style.display = 'block';
        error.textContent = '❌ Debe ingresar una fecha.';
        return;
    }

    const nuevaFila = [sku, nombre, rutProv, nombreProv, precio || '', fecha];

    try {
        // Obtener acceso al archivo (pide selección solo la primera vez)
        await obtenerFileHandle();

        // Re-leer el archivo actual para tener la versión más reciente
        await leerDesdeFileHandle();

        // Agregar la nueva fila
        datosHistorialPrecios.push(nuevaFila);

        // Generar el Excel actualizado
        const ws = XLSX.utils.aoa_to_sheet(datosHistorialPrecios);
        ws['!cols'] = [
            { wch: 12 },  // SKU
            { wch: 30 },  // Nombre
            { wch: 15 },  // Rut Proveedor
            { wch: 30 },  // Nombre Proveedor
            { wch: 14 },  // Precio
            { wch: 14 }   // Fecha
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Historial');
        const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // Escribir directamente en el archivo vinculado
        const writable = await historialFileHandle.createWritable();
        await writable.write(new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        await writable.close();

        // Mostrar éxito
        success.style.display = 'block';
        success.textContent = `✅ Registro #${datosHistorialPrecios.length - 1} guardado directamente en el archivo.`;

        // Limpiar formulario (mantener fecha)
        document.getElementById('inputSKUHistorial').value = '';
        document.getElementById('inputNombreHistorial').value = '';
        document.getElementById('inputRutHistorial').value = '';
        document.getElementById('inputNombreProvHistorial').value = '';
        document.getElementById('inputPrecioHistorial').value = '';

        // Actualizar tabla
        renderizarTablaHistorial();
    } catch (err) {
        error.style.display = 'block';
        error.textContent = '❌ Error al guardar: ' + err.message;
    }
}

function renderizarTablaHistorial() {
    const container = document.getElementById('tableContainer-historial');
    if (!datosHistorialPrecios || datosHistorialPrecios.length < 2) {
        container.innerHTML = '<p class="placeholder">No hay registros aún.</p>';
        return;
    }

    const headers = datosHistorialPrecios[0];
    const filas = datosHistorialPrecios.slice(1);

    let html = '<table class="excel-table"><thead><tr>';
    headers.forEach(h => {
        html += `<th>${h || ''}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Mostrar filas en orden inverso (más reciente primero)
    for (let i = filas.length - 1; i >= 0; i--) {
        const fila = filas[i];
        html += '<tr>';
        headers.forEach((_, j) => {
            html += `<td>${fila[j] !== undefined ? fila[j] : ''}</td>`;
        });
        html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    console.log('Sapo el que lee � - Sistema de Gestión cargado | Creado por RAHG');
    
    // Cargar automáticamente la ventana SKU
    cargarDatosSKU();
    
    // Precargar proveedores para autocompletado
    cargarDatosProveedores();
});

// ===== CONTROL DE ENTRADAS =====
let entradasVistaActual = 'semanal';
let entradasFechaRef = new Date();
let entradasData = [];
let entradaEditandoId = null;

function cargarEntradasDesdeStorage() {
    try {
        const raw = localStorage.getItem('controlEntradas');
        entradasData = raw ? JSON.parse(raw) : [];
    } catch (e) {
        entradasData = [];
    }
}

function guardarEntradasEnStorage() {
    localStorage.setItem('controlEntradas', JSON.stringify(entradasData));
}

async function inicializarControlEntradas() {
    if (datosSKU.length === 0) await cargarDatosSKU();
    if (datosProveedores.length === 0) await cargarDatosProveedores();
    cargarEntradasDesdeStorage();
    poblarSelectProveedorEntrada();
    renderizarEntradas();
}

function poblarSelectProveedorEntrada() {
    const select = document.getElementById('inputProveedorEntrada');
    if (!select) return;
    // Limpiar y repoblar
    select.innerHTML = '<option value="">Seleccione...</option>';
    if (datosSKU.length === 0) return;
    const headersSKU = datosSKU[0];
    const idxProv = headersSKU.findIndex(h => h && h.toLowerCase().includes('proveedor 1'));
    if (idxProv < 0) return;
    const provs = new Set();
    for (let i = 1; i < datosSKU.length; i++) {
        const p = datosSKU[i][idxProv];
        if (p && String(p).trim()) provs.add(String(p).trim());
    }
    [...provs].sort((a, b) => a.localeCompare(b, 'es')).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });
}

function cambiarVistaEntradas(vista) {
    entradasVistaActual = vista;
    document.getElementById('btnVistaSemanal').classList.toggle('active', vista === 'semanal');
    document.getElementById('btnVistaDiaria').classList.toggle('active', vista === 'diaria');
    renderizarEntradas();
}

function navegarEntradas(dir) {
    if (entradasVistaActual === 'semanal') {
        entradasFechaRef.setDate(entradasFechaRef.getDate() + dir * 7);
    } else {
        entradasFechaRef.setDate(entradasFechaRef.getDate() + dir);
    }
    renderizarEntradas();
}

function navegarEntradasHoy() {
    entradasFechaRef = new Date();
    renderizarEntradas();
}

function getLunesDeSemana(fecha) {
    const d = new Date(fecha);
    const dia = d.getDay() || 7;
    d.setDate(d.getDate() - dia + 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatFechaEntradas(d) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatFechaISOEntradas(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderizarEntradas() {
    const contenido = document.getElementById('entradas-contenido');
    const label = document.getElementById('entradas-periodo-label');
    const resumen = document.getElementById('entradas-resumen');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const hoyISO = formatFechaISOEntradas(new Date());

    // Auto-marcar retrasados
    entradasData.forEach(e => {
        if (e.estado === 'pendiente' && e.fecha < hoyISO) {
            e.estado = 'retrasado';
        }
    });
    guardarEntradasEnStorage();

    if (entradasVistaActual === 'semanal') {
        const lunes = getLunesDeSemana(entradasFechaRef);
        const domingo = new Date(lunes);
        domingo.setDate(domingo.getDate() + 6);
        label.textContent = `${formatFechaEntradas(lunes)} — ${formatFechaEntradas(domingo)}`;

        let html = '<div class="entradas-semana-grid">';
        for (let i = 0; i < 7; i++) {
            const dia = new Date(lunes);
            dia.setDate(dia.getDate() + i);
            const diaISO = formatFechaISOEntradas(dia);
            const esHoy = diaISO === hoyISO;
            const entradasDia = entradasData.filter(e => e.fecha === diaISO);

            html += `<div class="entradas-dia-card${esHoy ? ' dia-hoy' : ''}">`;
            html += `<div class="entradas-dia-header">${diasSemana[i]} ${dia.getDate()} ${meses[dia.getMonth()]}</div>`;
            if (entradasDia.length === 0) {
                html += '<div class="entradas-dia-vacio">Sin entregas</div>';
            } else {
                entradasDia.forEach(e => {
                    html += renderEntradaCard(e);
                });
            }
            html += '</div>';
        }
        html += '</div>';
        contenido.innerHTML = html;

    } else {
        const dia = new Date(entradasFechaRef);
        dia.setHours(0, 0, 0, 0);
        const diaISO = formatFechaISOEntradas(dia);
        const esHoy = diaISO === hoyISO;
        const diaSem = diasSemana[(dia.getDay() + 6) % 7];
        label.textContent = `${diaSem} ${formatFechaEntradas(dia)}`;

        const entradasDia = entradasData.filter(e => e.fecha === diaISO);
        let html = `<div class="entradas-dia-detalle${esHoy ? ' dia-hoy' : ''}">`;
        if (entradasDia.length === 0) {
            html += '<div class="entradas-dia-vacio">No hay entregas programadas para este día</div>';
        } else {
            entradasDia.forEach(e => {
                html += renderEntradaCard(e, true);
            });
        }
        html += '</div>';
        contenido.innerHTML = html;
    }

    // Resumen
    const pendientes = entradasData.filter(e => e.estado === 'pendiente').length;
    const entregados = entradasData.filter(e => e.estado === 'entregado').length;
    const retrasados = entradasData.filter(e => e.estado === 'retrasado').length;
    resumen.innerHTML = `<span class="badge-pendiente">⏳ ${pendientes} Pendiente${pendientes !== 1 ? 's' : ''}</span>`
        + `<span class="badge-entregado">✅ ${entregados} Entregado${entregados !== 1 ? 's' : ''}</span>`
        + `<span class="badge-retrasado">⚠️ ${retrasados} Retrasado${retrasados !== 1 ? 's' : ''}</span>`;
}

function renderEntradaCard(e, detalle = false) {
    const claseEstado = e.estado === 'entregado' ? 'entrada-entregado' : e.estado === 'retrasado' ? 'entrada-retrasado' : 'entrada-pendiente';
    const iconoEstado = e.estado === 'entregado' ? '✅' : e.estado === 'retrasado' ? '⚠️' : '⏳';
    let html = `<div class="entrada-card ${claseEstado}">`;
    html += `<div class="entrada-card-header">`;
    html += `<span class="entrada-estado-icon">${iconoEstado}</span>`;
    html += `<span class="entrada-proveedor">${e.proveedor}</span>`;
    html += `</div>`;
    html += `<div class="entrada-card-body">`;
    html += `<span class="entrada-sku">${e.sku}</span> `;
    html += `<span class="entrada-producto">${detalle ? e.producto : (e.producto.length > 35 ? e.producto.substring(0, 35) + '…' : e.producto)}</span>`;
    html += `<span class="entrada-cantidad">× ${e.cantidad}</span>`;
    if (e.nota) html += `<div class="entrada-nota">📝 ${e.nota}</div>`;
    html += `</div>`;
    html += `<div class="entrada-card-actions">`;
    if (e.estado !== 'entregado') {
        html += `<button class="btn-entrada-accion btn-marcar-entregado" onclick="marcarEntradaEstado('${e.id}','entregado')" title="Marcar como entregado">✅</button>`;
    }
    if (e.estado === 'entregado') {
        html += `<button class="btn-entrada-accion btn-marcar-pendiente" onclick="marcarEntradaEstado('${e.id}','pendiente')" title="Revertir a pendiente">↩️</button>`;
    }
    html += `<button class="btn-entrada-accion btn-editar-entrada" onclick="editarEntrada('${e.id}')" title="Editar">✏️</button>`;
    html += `<button class="btn-entrada-accion btn-eliminar-entrada" onclick="eliminarEntrada('${e.id}')" title="Eliminar">🗑️</button>`;
    html += `</div></div>`;
    return html;
}

function marcarEntradaEstado(id, estado) {
    const e = entradasData.find(x => x.id === id);
    if (e) {
        e.estado = estado;
        guardarEntradasEnStorage();
        renderizarEntradas();
    }
}

function buscarProductoEnEntradas() {
    const query = (document.getElementById('buscarProductoEntrada').value || '').trim().toLowerCase();
    const resultadoEl = document.getElementById('resultado-busqueda-entrada');

    if (!query || query.length < 2) {
        resultadoEl.style.display = 'none';
        resultadoEl.innerHTML = '';
        return;
    }

    // Buscar en entradas agendadas
    const encontradas = entradasData.filter(e =>
        e.sku.toLowerCase().includes(query) || e.producto.toLowerCase().includes(query)
    );

    // Agrupar por SKU+Producto
    const agrupado = {};
    encontradas.forEach(e => {
        const key = e.sku + '|' + e.producto;
        if (!agrupado[key]) agrupado[key] = [];
        agrupado[key].push(e);
    });

    if (Object.keys(agrupado).length === 0) {
        resultadoEl.style.display = 'block';
        resultadoEl.innerHTML = '<div class="busqueda-sin-resultado">❌ No se encontraron entregas agendadas para "<strong>' + query + '</strong>"</div>';
        return;
    }

    let html = '';
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    Object.keys(agrupado).forEach(key => {
        const entradas = agrupado[key];
        const [sku, producto] = key.split('|');
        html += '<div class="busqueda-producto-grupo">';
        html += '<div class="busqueda-producto-titulo"><span class="busqueda-sku">' + sku + '</span> ' + producto + '</div>';
        // Ordenar por fecha
        entradas.sort((a, b) => a.fecha.localeCompare(b.fecha));
        entradas.forEach(e => {
            const fecha = new Date(e.fecha + 'T12:00:00');
            const diaSem = diasSemana[fecha.getDay()];
            const fechaStr = diaSem + ' ' + String(fecha.getDate()).padStart(2, '0') + '/' + String(fecha.getMonth() + 1).padStart(2, '0') + '/' + fecha.getFullYear();
            const icono = e.estado === 'entregado' ? '✅' : e.estado === 'retrasado' ? '⚠️' : '⏳';
            const estadoTxt = e.estado === 'entregado' ? 'Entregado' : e.estado === 'retrasado' ? 'Retrasado' : 'Pendiente';
            const claseEstado = 'busqueda-estado-' + e.estado;
            html += '<div class="busqueda-entrada-item">';
            html += '<span class="busqueda-fecha">' + fechaStr + '</span>';
            html += '<span class="busqueda-cantidad">× ' + e.cantidad + '</span>';
            html += '<span class="busqueda-proveedor">' + e.proveedor + '</span>';
            html += '<span class="' + claseEstado + '">' + icono + ' ' + estadoTxt + '</span>';
            html += '</div>';
        });
        html += '</div>';
    });

    resultadoEl.style.display = 'block';
    resultadoEl.innerHTML = html;
}

function abrirModalEntrada() {
    entradaEditandoId = null;
    document.getElementById('modal-entrada-titulo').textContent = 'Agendar Entrada';
    document.getElementById('inputFechaEntrada').value = formatFechaISOEntradas(new Date());
    document.getElementById('inputProveedorEntrada').value = '';
    document.getElementById('inputSKUEntrada').value = '';
    document.getElementById('inputProductoEntrada').value = '';
    document.getElementById('inputCantidadEntrada').value = '';
    document.getElementById('inputNotaEntrada').value = '';
    document.getElementById('modal-entrada').style.display = 'flex';
}

function cerrarModalEntrada() {
    document.getElementById('modal-entrada').style.display = 'none';
    entradaEditandoId = null;
}

function autocompletarSKUEntrada() {
    const input = document.getElementById('inputSKUEntrada');
    const prodInput = document.getElementById('inputProductoEntrada');
    const val = input.value.trim();
    if (!val || datosSKU.length === 0) { prodInput.value = ''; return; }
    const headers = datosSKU[0];
    const idxSKU = headers.findIndex(h => h && h.toLowerCase() === 'sku');
    const idxNombre = headers.findIndex(h => h && h.toLowerCase().includes('nombre'));
    for (let i = 1; i < datosSKU.length; i++) {
        if (String(datosSKU[i][idxSKU]).trim() === val) {
            prodInput.value = datosSKU[i][idxNombre] || '';
            return;
        }
    }
    prodInput.value = '';
}

function guardarEntrada() {
    const fecha = document.getElementById('inputFechaEntrada').value;
    const proveedor = document.getElementById('inputProveedorEntrada').value;
    const sku = document.getElementById('inputSKUEntrada').value.trim();
    const producto = document.getElementById('inputProductoEntrada').value;
    const cantidad = parseInt(document.getElementById('inputCantidadEntrada').value) || 0;
    const nota = document.getElementById('inputNotaEntrada').value.trim();

    if (!fecha || !proveedor || !sku || !producto || cantidad <= 0) {
        alert('Complete todos los campos obligatorios (fecha, proveedor, SKU y cantidad).');
        return;
    }

    const hoyISO = formatFechaISOEntradas(new Date());

    if (entradaEditandoId) {
        const e = entradasData.find(x => x.id === entradaEditandoId);
        if (e) {
            e.fecha = fecha;
            e.proveedor = proveedor;
            e.sku = sku;
            e.producto = producto;
            e.cantidad = cantidad;
            e.nota = nota;
            if (e.estado !== 'entregado') {
                e.estado = fecha < hoyISO ? 'retrasado' : 'pendiente';
            }
        }
    } else {
        entradasData.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            fecha,
            proveedor,
            sku,
            producto,
            cantidad,
            nota,
            estado: fecha < hoyISO ? 'retrasado' : 'pendiente'
        });
    }

    guardarEntradasEnStorage();
    cerrarModalEntrada();
    renderizarEntradas();
}

function editarEntrada(id) {
    const e = entradasData.find(x => x.id === id);
    if (!e) return;
    entradaEditandoId = id;
    document.getElementById('modal-entrada-titulo').textContent = 'Editar Entrada';
    document.getElementById('inputFechaEntrada').value = e.fecha;
    document.getElementById('inputProveedorEntrada').value = e.proveedor;
    document.getElementById('inputSKUEntrada').value = e.sku;
    document.getElementById('inputProductoEntrada').value = e.producto;
    document.getElementById('inputCantidadEntrada').value = e.cantidad;
    document.getElementById('inputNotaEntrada').value = e.nota || '';
    document.getElementById('modal-entrada').style.display = 'flex';
}

function eliminarEntrada(id) {
    if (!confirm('¿Eliminar esta entrada?')) return;
    entradasData = entradasData.filter(x => x.id !== id);
    guardarEntradasEnStorage();
    renderizarEntradas();
}

// === CARGA MASIVA ===
function abrirModalCargaMasiva() {
    document.getElementById('inputFechaMasiva').value = formatFechaISOEntradas(new Date());
    // Poblar select proveedor masiva
    const selectMasiva = document.getElementById('inputProveedorMasiva');
    const selectOrig = document.getElementById('inputProveedorEntrada');
    selectMasiva.innerHTML = selectOrig.innerHTML;
    document.getElementById('inputTextoMasivo').value = '';
    document.getElementById('masiva-preview').innerHTML = '';
    document.getElementById('modal-carga-masiva').style.display = 'flex';
}

function cerrarModalCargaMasiva() {
    document.getElementById('modal-carga-masiva').style.display = 'none';
}

function parsearTextoMasivo(texto) {
    const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const resultados = [];

    for (const linea of lineas) {
        // Separar SKU del resto por tab o espacios múltiples
        let sku = '';
        let resto = '';
        const tabIdx = linea.indexOf('\t');
        if (tabIdx > 0) {
            sku = linea.substring(0, tabIdx).trim();
            resto = linea.substring(tabIdx + 1).trim();
        } else {
            // Intentar separar por primer espacio después de dígitos
            const match = linea.match(/^(\d+)\s+(.+)$/);
            if (match) {
                sku = match[1];
                resto = match[2];
            } else {
                resultados.push({ error: true, linea });
                continue;
            }
        }

        // Buscar patrón " - N UNIDAD" al final
        let nombre = resto;
        let cantidad = 0;
        let um = '';
        const matchCant = resto.match(/^(.+?)\s*-\s*(\d+)\s+(.+)$/);
        if (matchCant) {
            nombre = matchCant[1].trim();
            cantidad = parseInt(matchCant[2]);
            um = matchCant[3].trim();
        }

        // Buscar nombre en SKU si disponible
        let productoNombre = nombre;
        if (datosSKU.length > 0) {
            const headers = datosSKU[0];
            const idxSKU = headers.findIndex(h => h && h.toLowerCase() === 'sku');
            const idxNombre = headers.findIndex(h => h && h.toLowerCase().includes('nombre'));
            for (let i = 1; i < datosSKU.length; i++) {
                if (String(datosSKU[i][idxSKU]).trim() === sku) {
                    productoNombre = datosSKU[i][idxNombre] || nombre;
                    break;
                }
            }
        }

        resultados.push({
            error: false,
            sku,
            producto: productoNombre,
            cantidad,
            um,
            nota: cantidad > 0 ? `${cantidad} ${um}` : ''
        });
    }
    return resultados;
}

function previsualizarCargaMasiva() {
    const texto = document.getElementById('inputTextoMasivo').value;
    const preview = document.getElementById('masiva-preview');
    if (!texto.trim()) {
        preview.innerHTML = '<p class="masiva-empty">Pegue el texto primero.</p>';
        return;
    }

    const items = parsearTextoMasivo(texto);
    const validos = items.filter(i => !i.error);
    const errores = items.filter(i => i.error);

    let html = `<div class="masiva-resumen">✅ ${validos.length} producto${validos.length !== 1 ? 's' : ''} detectado${validos.length !== 1 ? 's' : ''}`;
    if (errores.length > 0) html += ` | ⚠️ ${errores.length} línea${errores.length !== 1 ? 's' : ''} no reconocida${errores.length !== 1 ? 's' : ''}`;
    html += '</div>';

    if (validos.length > 0) {
        html += '<table class="masiva-tabla"><thead><tr><th>SKU</th><th>Producto</th><th>Cantidad</th><th>UM</th></tr></thead><tbody>';
        validos.forEach(v => {
            html += `<tr><td>${v.sku}</td><td>${v.producto}</td><td>${v.cantidad}</td><td>${v.um}</td></tr>`;
        });
        html += '</tbody></table>';
    }

    if (errores.length > 0) {
        html += '<div class="masiva-errores"><strong>Líneas no reconocidas:</strong>';
        errores.forEach(e => { html += `<div class="masiva-error-line">${e.linea}</div>`; });
        html += '</div>';
    }

    preview.innerHTML = html;
}

function guardarCargaMasiva() {
    const fecha = document.getElementById('inputFechaMasiva').value;
    const proveedor = document.getElementById('inputProveedorMasiva').value;
    const texto = document.getElementById('inputTextoMasivo').value;

    if (!fecha || !proveedor) {
        alert('Seleccione fecha y proveedor.');
        return;
    }
    if (!texto.trim()) {
        alert('Pegue la lista de productos.');
        return;
    }

    const items = parsearTextoMasivo(texto).filter(i => !i.error);
    if (items.length === 0) {
        alert('No se detectaron productos válidos en el texto.');
        return;
    }

    const hoyISO = formatFechaISOEntradas(new Date());
    let agregados = 0;

    items.forEach(item => {
        entradasData.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            fecha,
            proveedor,
            sku: item.sku,
            producto: item.producto,
            cantidad: item.cantidad,
            nota: item.nota,
            estado: fecha < hoyISO ? 'retrasado' : 'pendiente'
        });
        agregados++;
    });

    guardarEntradasEnStorage();
    cerrarModalCargaMasiva();
    renderizarEntradas();
    alert(`✅ Se agendaron ${agregados} entrada${agregados !== 1 ? 's' : ''} para el ${fecha}.`);
}

// ===== VENTANA ANÁLISIS DE INVENTARIO =====
let chartABC_pie = null;
let chartABC_pareto = null;
let chartRotacion = null;
window._datosABC = [];
window._datosRotacion = [];
window._invDatosBase = null; // datos crudos para re-filtrar por fecha

async function cargarAnalisisInventario() {
    const loading = document.getElementById('loading-inventario');
    const errorEl = document.getElementById('error-inventario');
    loading.style.display = 'block';
    errorEl.style.display = 'none';

    try {
        // Cargar datos necesarios si no están cargados
        if (datosSKU.length === 0) {
            const resp = await fetch('Excel/SKU.xlsx');
            if (!resp.ok) throw new Error('No se pudo cargar SKU.xlsx');
            const buf = await resp.arrayBuffer();
            const wb = XLSX.read(buf, { type: 'array' });
            datosSKU = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        }
        if (datosBBDD.length === 0) {
            const resp = await fetch('Excel/BBDD.xlsx');
            if (!resp.ok) throw new Error('No se pudo cargar BBDD.xlsx');
            const buf = await resp.arrayBuffer();
            const wb = XLSX.read(buf, { type: 'array' });
            datosBBDD = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        }
        if (datosStockActual.length === 0) {
            const resp = await fetch('Excel/Stock Actual.xlsx');
            if (!resp.ok) throw new Error('No se pudo cargar Stock Actual.xlsx');
            const buf = await resp.arrayBuffer();
            const wb = XLSX.read(buf, { type: 'array' });
            datosStockActual = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        }

        // Guardar índices base una sola vez
        if (!window._invDatosBase) {
            const headersSKU = datosSKU[0];
            const iSKU = headersSKU.findIndex(h => h && h.toLowerCase() === 'sku');
            const iNombre = headersSKU.findIndex(h => h && h.toLowerCase().includes('nombre'));
            const headersBBDD = datosBBDD[0];
            let iIDProd = headersBBDD.findIndex(h => h && h.toLowerCase() === 'idproducto');
            if (iIDProd < 0) iIDProd = headersBBDD.findIndex(h => h && h.toLowerCase() === 'id entero');
            const iCantBBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('cantidad'));
            const iPrecioBBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'precio');
            let iFechaBBDD = headersBBDD.findIndex(h => h && h.toLowerCase() === 'fecha entero');
            if (iFechaBBDD < 0) iFechaBBDD = headersBBDD.findIndex(h => h && h.toLowerCase().includes('fecha'));
            const headersStock = datosStockActual[0];
            const iCodigoStock = headersStock.findIndex(h => h && (h.toLowerCase().includes('código') || h.toLowerCase().includes('codigo')));
            const iStockNunoa = headersStock.findIndex(h => h && h.toLowerCase().includes('ñuñoa'));

            window._invDatosBase = { iSKU, iNombre, iIDProd, iCantBBDD, iPrecioBBDD, iFechaBBDD, iCodigoStock, iStockNunoa };
        }

        // Setear fecha fin a hoy si está vacía
        const inputFechaFin = document.getElementById('invFechaFin');
        if (!inputFechaFin.value) {
            const hoy = new Date();
            inputFechaFin.value = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
        }

        procesarAnalisisInventario();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Error: ' + err.message;
        console.error('Error en análisis de inventario:', err);
    }
}

function aplicarFiltroFechaInventario() {
    procesarAnalisisInventario();
}

function procesarAnalisisInventario() {
    const idx = window._invDatosBase;
    if (!idx) return;

    const EXCEL_EPOCH = new Date('1899-12-30').getTime();
    function excelSerialToDate(serial) {
        const num = Number(serial);
        if (isNaN(num) || num <= 0) return null;
        return new Date(EXCEL_EPOCH + num * 86400000);
    }

    // Leer filtro de fechas
    const fechaInicioStr = document.getElementById('invFechaInicio').value;
    const fechaFinStr = document.getElementById('invFechaFin').value;
    let fechaInicio = fechaInicioStr ? new Date(fechaInicioStr + 'T00:00:00') : null;
    let fechaFin = fechaFinStr ? new Date(fechaFinStr + 'T23:59:59') : null;

    // Calcular ventas por producto con filtro de fecha
    const ventasPorSKU = {};
    for (let i = 1; i < datosBBDD.length; i++) {
        const fila = datosBBDD[i];
        const idProd = String(fila[idx.iIDProd] || '').trim();
        if (!idProd) continue;
        const cantidad = Number(fila[idx.iCantBBDD]) || 0;
        const precio = idx.iPrecioBBDD >= 0 ? (Number(fila[idx.iPrecioBBDD]) || 0) : 0;
        const valor = cantidad * precio;
        const fechaVal = fila[idx.iFechaBBDD];
        let fecha = null;
        if (typeof fechaVal === 'number') fecha = excelSerialToDate(fechaVal);
        else if (fechaVal instanceof Date) fecha = fechaVal;
        else if (typeof fechaVal === 'string') fecha = new Date(fechaVal);

        // Aplicar filtro de fecha
        if (fecha && !isNaN(fecha.getTime())) {
            if (fechaInicio && fecha < fechaInicio) continue;
            if (fechaFin && fecha > fechaFin) continue;
        }

        if (!ventasPorSKU[idProd]) {
            ventasPorSKU[idProd] = { cantidadTotal: 0, valorTotal: 0, ventasCount: 0, fechaMin: null, fechaMax: null };
        }
        const v = ventasPorSKU[idProd];
        v.cantidadTotal += cantidad;
        v.valorTotal += valor;
        v.ventasCount++;
        if (fecha && !isNaN(fecha.getTime())) {
            if (!v.fechaMin || fecha < v.fechaMin) v.fechaMin = fecha;
            if (!v.fechaMax || fecha > v.fechaMax) v.fechaMax = fecha;
        }
    }

    // Stock actual
    const stockPorCodigo = {};
    for (let i = 1; i < datosStockActual.length; i++) {
        const fila = datosStockActual[i];
        const codigo = String(fila[idx.iCodigoStock] || '').trim();
        if (codigo) stockPorCodigo[codigo] = Number(fila[idx.iStockNunoa]) || 0;
    }

    // Rango de fechas para rotación
    let fechaGlobalMin = null, fechaGlobalMax = null;
    Object.values(ventasPorSKU).forEach(v => {
        if (v.fechaMin && (!fechaGlobalMin || v.fechaMin < fechaGlobalMin)) fechaGlobalMin = v.fechaMin;
        if (v.fechaMax && (!fechaGlobalMax || v.fechaMax > fechaGlobalMax)) fechaGlobalMax = v.fechaMax;
    });
    const diasPeriodo = (fechaGlobalMin && fechaGlobalMax)
        ? Math.max(1, Math.round((fechaGlobalMax - fechaGlobalMin) / 86400000))
        : 365;

    // Construir datos por producto
    const productos = [];
    for (let i = 1; i < datosSKU.length; i++) {
        const fila = datosSKU[i];
        const sku = fila[idx.iSKU];
        if (sku === undefined || sku === null) continue;
        const skuStr = String(sku).trim();
        const skuInt = String(Math.floor(Number(sku)));
        const nombre = fila[idx.iNombre] || '';
        const venta = ventasPorSKU[skuStr] || ventasPorSKU[skuInt] || { cantidadTotal: 0, valorTotal: 0, ventasCount: 0 };
        const stockActual = stockPorCodigo[skuStr] !== undefined ? stockPorCodigo[skuStr] : (stockPorCodigo[skuInt] !== undefined ? stockPorCodigo[skuInt] : 0);
        productos.push({ sku: skuStr, nombre, cantidadVendida: venta.cantidadTotal, valorVentas: venta.valorTotal, ventasCount: venta.ventasCount, stockActual });
    }

    // Clasificación ABC
    const valorTotal = productos.reduce((s, p) => s + p.valorVentas, 0);
    productos.sort((a, b) => b.valorVentas - a.valorVentas);
    let acumulado = 0;
    productos.forEach(p => {
        acumulado += p.valorVentas;
        const pctAcum = valorTotal > 0 ? (acumulado / valorTotal) * 100 : 0;
        p.pctValor = valorTotal > 0 ? (p.valorVentas / valorTotal) * 100 : 0;
        p.pctAcumulado = pctAcum;
        if (pctAcum <= 80) p.claseABC = 'A';
        else if (pctAcum <= 95) p.claseABC = 'B';
        else p.claseABC = 'C';
    });

    // Rotación
    productos.forEach(p => {
        const consumoDiario = diasPeriodo > 0 ? p.cantidadVendida / diasPeriodo : 0;
        const consumoSemanal = consumoDiario * 7;
        p.indiceRotacion = p.stockActual > 0 ? p.cantidadVendida / p.stockActual : (p.cantidadVendida > 0 ? 999 : 0);
        p.diasInventario = consumoDiario > 0 ? Math.round(p.stockActual / consumoDiario) : (p.stockActual > 0 ? 9999 : 0);
        p.coberturaSemanas = consumoSemanal > 0 ? parseFloat((p.stockActual / consumoSemanal).toFixed(1)) : (p.stockActual > 0 ? 999 : 0);
        if (p.indiceRotacion >= 12) p.categoriaRotacion = 'Alta';
        else if (p.indiceRotacion >= 4) p.categoriaRotacion = 'Media';
        else if (p.indiceRotacion >= 1) p.categoriaRotacion = 'Baja';
        else p.categoriaRotacion = 'Muy Baja';
    });

    window._datosABC = productos;
    window._datosRotacion = productos;

    // KPIs
    const countA = productos.filter(p => p.claseABC === 'A').length;
    const countB = productos.filter(p => p.claseABC === 'B').length;
    const countC = productos.filter(p => p.claseABC === 'C').length;
    const valorA = productos.filter(p => p.claseABC === 'A').reduce((s, p) => s + p.valorVentas, 0);
    const valorB = productos.filter(p => p.claseABC === 'B').reduce((s, p) => s + p.valorVentas, 0);
    const valorC = productos.filter(p => p.claseABC === 'C').reduce((s, p) => s + p.valorVentas, 0);

    document.getElementById('kpi-total-skus').textContent = productos.length;
    document.getElementById('kpi-clase-a').textContent = countA;
    document.getElementById('kpi-clase-a-pct').textContent = valorTotal > 0 ? ((valorA / valorTotal) * 100).toFixed(1) + '% del valor' : '0% del valor';
    document.getElementById('kpi-clase-b').textContent = countB;
    document.getElementById('kpi-clase-b-pct').textContent = valorTotal > 0 ? ((valorB / valorTotal) * 100).toFixed(1) + '% del valor' : '0% del valor';
    document.getElementById('kpi-clase-c').textContent = countC;
    document.getElementById('kpi-clase-c-pct').textContent = valorTotal > 0 ? ((valorC / valorTotal) * 100).toFixed(1) + '% del valor' : '0% del valor';
    document.getElementById('kpi-valor-total').textContent = '$' + Math.round(valorTotal).toLocaleString('es-CL');
    document.getElementById('inv-kpi-container').style.display = 'flex';

    // Reset filtros
    document.getElementById('filtroClaseABC').value = 'todas';
    document.getElementById('filtroRotacion').value = 'todas';

    // Gráficos
    renderChartABC_pie(countA, countB, countC, valorA, valorB, valorC);
    renderChartABC_pareto(productos);
    renderChartRotacion(productos);

    // Tablas
    renderTablaABC(productos);
    renderTablaRotacion(productos);

    // Conclusiones y Mejoras
    generarConclusionesYMejoras(productos, valorTotal, countA, countB, countC, diasPeriodo);
}

// ---- Gráficos ABC ----
function renderChartABC_pie(countA, countB, countC, valorA, valorB, valorC) {
    const ctx = document.getElementById('chartABC_pie');
    if (chartABC_pie) { chartABC_pie.destroy(); chartABC_pie = null; }
    chartABC_pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Clase A (' + countA + ' SKUs)', 'Clase B (' + countB + ' SKUs)', 'Clase C (' + countC + ' SKUs)'],
            datasets: [{
                data: [valorA, valorB, valorC],
                backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
                borderWidth: 2,
                borderColor: '#1e1e2f'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Distribución de Valor por Clase', color: '#e0e0e0', font: { size: 14 } },
                legend: { position: 'bottom', labels: { color: '#ccc', font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                            return ctx.label + ': $' + Math.round(ctx.raw).toLocaleString('es-CL') + ' (' + pct + '%)';
                        }
                    }
                }
            }
        }
    });
}

function renderChartABC_pareto(productos) {
    const ctx = document.getElementById('chartABC_pareto');
    if (chartABC_pareto) { chartABC_pareto.destroy(); chartABC_pareto = null; }
    const top = productos.slice(0, Math.min(30, productos.length));
    const labels = top.map(p => p.sku);
    const valores = top.map(p => p.valorVentas);
    const acumulados = top.map(p => p.pctAcumulado);
    const colores = top.map(p => p.claseABC === 'A' ? '#2ecc71' : p.claseABC === 'B' ? '#f1c40f' : '#e74c3c');
    const nombres = top.map(p => p.nombre);

    chartABC_pareto = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Valor Ventas ($)', data: valores, backgroundColor: colores, borderColor: colores, borderWidth: 1, yAxisID: 'y', order: 2 },
                { label: '% Acumulado', data: acumulados, type: 'line', borderColor: '#00bcd4', backgroundColor: 'rgba(0,188,212,0.1)', pointRadius: 2, borderWidth: 2, yAxisID: 'y1', order: 1 }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: 'Diagrama de Pareto (Top 30)', color: '#e0e0e0', font: { size: 14 } },
                legend: { labels: { color: '#ccc', font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            const i = items[0].dataIndex;
                            return nombres[i] + ' (SKU: ' + labels[i] + ')';
                        },
                        label: function(ctx) {
                            if (ctx.dataset.yAxisID === 'y1') return ctx.dataset.label + ': ' + ctx.raw.toFixed(1) + '%';
                            return ctx.dataset.label + ': $' + Math.round(ctx.raw).toLocaleString('es-CL');
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#aaa', maxRotation: 90, font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { position: 'left', ticks: { color: '#aaa', callback: v => '$' + Math.round(v).toLocaleString('es-CL') }, grid: { color: 'rgba(255,255,255,0.08)' }, title: { display: true, text: 'Valor ($)', color: '#aaa' } },
                y1: { position: 'right', min: 0, max: 100, ticks: { color: '#00bcd4', callback: v => v + '%' }, grid: { drawOnChartArea: false }, title: { display: true, text: '% Acumulado', color: '#00bcd4' } }
            }
        }
    });
}

// ---- Gráfico Rotación ----
function renderChartRotacion(productos, filtroRot) {
    const ctx = document.getElementById('chartRotacion');
    if (chartRotacion) { chartRotacion.destroy(); chartRotacion = null; }

    let filtrados = productos.filter(p => p.indiceRotacion > 0 && p.indiceRotacion < 999);
    if (filtroRot === 'alta') filtrados = filtrados.filter(p => p.indiceRotacion >= 12);
    else if (filtroRot === 'media') filtrados = filtrados.filter(p => p.indiceRotacion >= 4 && p.indiceRotacion < 12);
    else if (filtroRot === 'baja') filtrados = filtrados.filter(p => p.indiceRotacion >= 1 && p.indiceRotacion < 4);
    else if (filtroRot === 'muybaja') filtrados = productos.filter(p => p.indiceRotacion < 1);

    filtrados.sort((a, b) => b.indiceRotacion - a.indiceRotacion);
    const top = filtrados.slice(0, Math.min(30, filtrados.length));
    const labels = top.map(p => p.sku);
    const nombres = top.map(p => p.nombre || p.sku);
    const datos = top.map(p => parseFloat(p.indiceRotacion.toFixed(2)));
    const colores = top.map(p => {
        if (p.categoriaRotacion === 'Alta') return '#2ecc71';
        if (p.categoriaRotacion === 'Media') return '#f1c40f';
        if (p.categoriaRotacion === 'Baja') return '#e67e22';
        return '#e74c3c';
    });

    chartRotacion = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Índice de Rotación',
                data: datos,
                backgroundColor: colores,
                borderColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Productos por Índice de Rotación (Top 30)', color: '#e0e0e0', font: { size: 14 } },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(items) {
                            const i = items[0].dataIndex;
                            return nombres[i] + ' (SKU: ' + labels[i] + ')';
                        },
                        label: function(ctx) {
                            return 'Índice de Rotación: ' + ctx.raw;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#aaa', maxRotation: 90, font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.08)' }, title: { display: true, text: 'Índice de Rotación', color: '#aaa' } }
            }
        }
    });
}

// ---- Tabla ABC ----
function renderTablaABC(productos, filtroClase, filtroSKU, filtroNombre) {
    let datos = filtroClase && filtroClase !== 'todas' ? productos.filter(p => p.claseABC === filtroClase) : [...productos];
    if (filtroSKU) { const q = filtroSKU.toLowerCase(); datos = datos.filter(p => p.sku.toString().toLowerCase().includes(q)); }
    if (filtroNombre) { const q = filtroNombre.toLowerCase(); datos = datos.filter(p => p.nombre.toLowerCase().includes(q)); }
    const container = document.getElementById('tableContainer-abc');
    let html = '<table class="tabla-datos tabla-inv-sticky"><thead><tr>';
    html += '<th>SKU</th><th>Nombre</th><th>Clase</th><th>Valor Ventas ($)</th><th>% del Total</th><th>% Acumulado</th><th>Cant. Vendida</th><th>Nro. Ventas</th>';
    html += '</tr></thead><tbody>';
    datos.forEach(p => {
        const badgeClass = 'abc-badge abc-' + p.claseABC.toLowerCase();
        html += '<tr><td>' + p.sku + '</td><td>' + p.nombre + '</td><td><span class="' + badgeClass + '">' + p.claseABC + '</span></td>';
        html += '<td>$' + Math.round(p.valorVentas).toLocaleString('es-CL') + '</td><td>' + p.pctValor.toFixed(2) + '%</td><td>' + p.pctAcumulado.toFixed(2) + '%</td>';
        html += '<td>' + p.cantidadVendida.toLocaleString('es-CL') + '</td><td>' + p.ventasCount + '</td></tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function filtrarTablaABC() {
    const filtro = document.getElementById('filtroClaseABC').value;
    const filtroSKU = (document.getElementById('filtroSKU_ABC') || {}).value || '';
    const filtroNombre = (document.getElementById('filtroNombre_ABC') || {}).value || '';
    const productos = window._datosABC;
    renderTablaABC(productos, filtro, filtroSKU, filtroNombre);
    // Actualizar gráfico pie con la clase filtrada
    if (filtro && filtro !== 'todas') {
        const filtrados = productos.filter(p => p.claseABC === filtro);
        const count = filtrados.length;
        const valor = filtrados.reduce((s, p) => s + p.valorVentas, 0);
        const label = 'Clase ' + filtro + ' (' + count + ' SKUs)';
        const color = filtro === 'A' ? '#2ecc71' : filtro === 'B' ? '#f1c40f' : '#e74c3c';
        const ctx = document.getElementById('chartABC_pie');
        if (chartABC_pie) { chartABC_pie.destroy(); chartABC_pie = null; }
        chartABC_pie = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [label], datasets: [{ data: [valor], backgroundColor: [color], borderWidth: 2, borderColor: '#1e1e2f' }] },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Distribución - ' + label, color: '#e0e0e0', font: { size: 14 } },
                    legend: { position: 'bottom', labels: { color: '#ccc', font: { size: 11 } } },
                    tooltip: { callbacks: { label: function(ctx) { return ctx.label + ': $' + Math.round(ctx.raw).toLocaleString('es-CL'); } } }
                }
            }
        });
    } else {
        const countA = productos.filter(p => p.claseABC === 'A').length;
        const countB = productos.filter(p => p.claseABC === 'B').length;
        const countC = productos.filter(p => p.claseABC === 'C').length;
        const valorA = productos.filter(p => p.claseABC === 'A').reduce((s, p) => s + p.valorVentas, 0);
        const valorB = productos.filter(p => p.claseABC === 'B').reduce((s, p) => s + p.valorVentas, 0);
        const valorC = productos.filter(p => p.claseABC === 'C').reduce((s, p) => s + p.valorVentas, 0);
        renderChartABC_pie(countA, countB, countC, valorA, valorB, valorC);
    }
}

// ---- Tabla Rotación ----
function renderTablaRotacion(productos, filtroRot, filtroSKU, filtroNombre) {
    let datos = [...productos];
    if (filtroRot === 'alta') datos = datos.filter(p => p.indiceRotacion >= 12 && p.indiceRotacion < 999);
    else if (filtroRot === 'media') datos = datos.filter(p => p.indiceRotacion >= 4 && p.indiceRotacion < 12);
    else if (filtroRot === 'baja') datos = datos.filter(p => p.indiceRotacion >= 1 && p.indiceRotacion < 4);
    else if (filtroRot === 'muybaja') datos = datos.filter(p => p.indiceRotacion < 1);
    if (filtroSKU) { const q = filtroSKU.toLowerCase(); datos = datos.filter(p => p.sku.toString().toLowerCase().includes(q)); }
    if (filtroNombre) { const q = filtroNombre.toLowerCase(); datos = datos.filter(p => p.nombre.toLowerCase().includes(q)); }
    datos.sort((a, b) => b.indiceRotacion - a.indiceRotacion);

    const container = document.getElementById('tableContainer-rotacion');
    let html = '<table class="tabla-datos tabla-inv-sticky"><thead><tr>';
    html += '<th>SKU</th><th>Nombre</th><th>Clase ABC</th><th>Stock Actual</th><th>Cant. Vendida</th><th>Índ. Rotación</th><th>Días Inv.</th><th>Cobertura (sem)</th><th>Categoría</th>';
    html += '</tr></thead><tbody>';
    datos.forEach(p => {
        const rotClass = 'rot-badge rot-' + p.categoriaRotacion.toLowerCase().replace(/ /g, '').replace('muy', 'muy-');
        const badgeABC = 'abc-badge abc-' + p.claseABC.toLowerCase();
        html += '<tr><td>' + p.sku + '</td><td>' + p.nombre + '</td>';
        html += '<td><span class="' + badgeABC + '">' + p.claseABC + '</span></td>';
        html += '<td>' + p.stockActual.toLocaleString('es-CL') + '</td>';
        html += '<td>' + p.cantidadVendida.toLocaleString('es-CL') + '</td>';
        html += '<td>' + (p.indiceRotacion >= 999 ? 'Sin stock' : p.indiceRotacion.toFixed(2)) + '</td>';
        html += '<td>' + (p.diasInventario >= 9999 ? 'Sin consumo' : p.diasInventario.toLocaleString('es-CL')) + '</td>';
        html += '<td>' + (p.coberturaSemanas >= 999 ? '∞' : p.coberturaSemanas) + '</td>';
        html += '<td><span class="' + rotClass + '">' + p.categoriaRotacion + '</span></td></tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function filtrarTablaRotacion() {
    const filtro = document.getElementById('filtroRotacion').value;
    const filtroSKU = (document.getElementById('filtroSKU_Rot') || {}).value || '';
    const filtroNombre = (document.getElementById('filtroNombre_Rot') || {}).value || '';
    renderTablaRotacion(window._datosRotacion, filtro, filtroSKU, filtroNombre);
    renderChartRotacion(window._datosRotacion, filtro);
}

// ---- Conclusiones y Mejoras ----
function generarConclusionesYMejoras(productos, valorTotal, countA, countB, countC, diasPeriodo) {
    const conclusiones = [];
    const mejoras = [];
    const total = productos.length;

    // Concentración ABC
    const pctA = total > 0 ? ((countA / total) * 100).toFixed(1) : 0;
    const pctC = total > 0 ? ((countC / total) * 100).toFixed(1) : 0;
    conclusiones.push('Solo <strong>' + countA + ' productos (' + pctA + '%)</strong> de clase A generan el 80% del ingreso total ($' + Math.round(valorTotal * 0.8).toLocaleString('es-CL') + '). La concentración de valor es alta.');

    // Productos sin ventas
    const sinVentas = productos.filter(p => p.valorVentas === 0);
    if (sinVentas.length > 0) {
        conclusiones.push('<strong>' + sinVentas.length + ' productos</strong> no registran ventas en el período analizado. Esto puede indicar productos obsoletos o de muy baja demanda.');
    }

    // Productos con alta rotación pero bajo stock
    const altaRotBajoStock = productos.filter(p => p.categoriaRotacion === 'Alta' && p.stockActual < (p.cantidadVendida / (diasPeriodo / 7)));
    if (altaRotBajoStock.length > 0) {
        conclusiones.push('<strong>' + altaRotBajoStock.length + ' productos</strong> de alta rotación tienen stock inferior al consumo semanal promedio, con riesgo de quiebre de stock.');
    }

    // Productos con sobrestock
    const sobrestock = productos.filter(p => p.diasInventario > 180 && p.stockActual > 0 && p.diasInventario < 9999);
    if (sobrestock.length > 0) {
        conclusiones.push('<strong>' + sobrestock.length + ' productos</strong> tienen más de 180 días de inventario, lo que sugiere sobrestock o demanda decreciente.');
    }

    // Clase C con stock alto
    const cConStock = productos.filter(p => p.claseABC === 'C' && p.stockActual > 0);
    if (cConStock.length > 0) {
        const stockValorC = cConStock.reduce((s, p) => s + p.stockActual, 0);
        conclusiones.push('Hay <strong>' + cConStock.length + ' productos clase C con stock (' + stockValorC.toLocaleString('es-CL') + ' unidades)</strong>, que representan capital inmovilizado con bajo retorno.');
    }

    // Top producto
    if (productos.length > 0) {
        const top1 = productos[0];
        conclusiones.push('El producto estrella es <strong>' + top1.nombre + ' (SKU ' + top1.sku + ')</strong> con $' + Math.round(top1.valorVentas).toLocaleString('es-CL') + ' en ventas (' + top1.pctValor.toFixed(1) + '% del total).');
    }

    // --- MEJORAS ---
    mejoras.push('<strong>Priorizar reposición de clase A:</strong> Asegurar niveles de stock óptimos para los ' + countA + ' productos clase A, implementando puntos de reorden automáticos para evitar quiebres que impacten el 80% del ingreso.');

    if (sinVentas.length > 0) {
        mejoras.push('<strong>Evaluar productos sin movimiento:</strong> Revisar los ' + sinVentas.length + ' productos sin ventas. Considerar liquidaciones, descuentos o discontinuarlos para liberar capital y espacio de almacenamiento.');
    }

    if (sobrestock.length > 0) {
        mejoras.push('<strong>Reducir sobrestock:</strong> Los ' + sobrestock.length + ' productos con más de 180 días de inventario deberían ser sujetos a promociones o renegociación de cantidades mínimas con proveedores.');
    }

    if (altaRotBajoStock.length > 0) {
        mejoras.push('<strong>Aumentar stock de alta rotación:</strong> ' + altaRotBajoStock.length + ' productos de alta demanda están en riesgo de quiebre. Incrementar niveles de seguridad o frecuencia de reposición.');
    }

    mejoras.push('<strong>Reclasificar periódicamente:</strong> Ejecutar el análisis ABC mensualmente para detectar cambios en la demanda y ajustar estrategias de compra y almacenamiento.');

    if (countC > countA * 3) {
        mejoras.push('<strong>Racionalizar catálogo clase C:</strong> Con ' + countC + ' productos clase C (' + pctC + '% del catálogo) que solo aportan el 5% del valor, evaluar cuáles mantener y cuáles descontinuar para simplificar operaciones.');
    }

    mejoras.push('<strong>Negociar con proveedores clave:</strong> Los productos clase A deben tener condiciones preferenciales de compra (plazos, descuentos por volumen, entregas más frecuentes) para maximizar margen.');

    // Render
    const concEl = document.getElementById('inv-conclusiones');
    const concLista = document.getElementById('inv-conclusiones-lista');
    concLista.innerHTML = conclusiones.map(c => '<li>' + c + '</li>').join('');
    concEl.style.display = 'block';

    const mejEl = document.getElementById('inv-mejoras');
    const mejLista = document.getElementById('inv-mejoras-lista');
    mejLista.innerHTML = mejoras.map(m => '<li>' + m + '</li>').join('');
    mejEl.style.display = 'block';
}

// ---- Exportar ABC ----
function exportarABC() {
    const datos = window._datosABC;
    if (!datos || datos.length === 0) return alert('No hay datos para exportar.');
    const filas = [['SKU', 'Nombre', 'Clase ABC', 'Valor Ventas ($)', '% del Total', '% Acumulado', 'Cant. Vendida', 'Nro. Ventas']];
    datos.forEach(p => {
        filas.push([p.sku, p.nombre, p.claseABC, Math.round(p.valorVentas), parseFloat(p.pctValor.toFixed(2)), parseFloat(p.pctAcumulado.toFixed(2)), p.cantidadVendida, p.ventasCount]);
    });
    const ws = XLSX.utils.aoa_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clasificación ABC');
    XLSX.writeFile(wb, 'Clasificacion_ABC.xlsx');
}

// ---- Exportar Rotación ----
function exportarRotacion() {
    const datos = window._datosRotacion;
    if (!datos || datos.length === 0) return alert('No hay datos para exportar.');
    const filas = [['SKU', 'Nombre', 'Clase ABC', 'Stock Actual', 'Cant. Vendida', 'Índice Rotación', 'Días Inventario', 'Cobertura (semanas)', 'Categoría Rotación']];
    datos.forEach(p => {
        filas.push([p.sku, p.nombre, p.claseABC, p.stockActual, p.cantidadVendida,
            p.indiceRotacion >= 999 ? 'Sin stock' : parseFloat(p.indiceRotacion.toFixed(2)),
            p.diasInventario >= 9999 ? 'Sin consumo' : p.diasInventario,
            p.coberturaSemanas >= 999 ? '∞' : p.coberturaSemanas,
            p.categoriaRotacion]);
    });
    const ws = XLSX.utils.aoa_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rotación Inventario');
    XLSX.writeFile(wb, 'Rotacion_Inventario.xlsx');
}

// ===== VENTANA SKU POR VENCER =====
let datosStockValorizado = [];
window._datosVencer = [];

async function cargarSKUporVencer() {
    const loading = document.getElementById('loading-vencer');
    const errorEl = document.getElementById('error-vencer');
    loading.style.display = 'block';
    errorEl.style.display = 'none';

    try {
        if (datosStockValorizado.length === 0) {
            const resp = await fetch('Excel/Stock Valorizado.xlsx');
            if (!resp.ok) throw new Error('No se pudo cargar Excel/Stock Valorizado.xlsx');
            const buf = await resp.arrayBuffer();
            const wb = XLSX.read(buf, { type: 'array' });
            datosStockValorizado = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        }

        // Setear fecha límite a 3 meses en el futuro por defecto
        const inputFecha = document.getElementById('vencerFechaLimite');
        if (!inputFecha.value) {
            const hoy = new Date();
            hoy.setMonth(hoy.getMonth() + 3);
            inputFecha.value = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
        }

        procesarSKUporVencer();
        loading.style.display = 'none';
    } catch (err) {
        loading.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Error: ' + err.message;
        console.error('Error en SKU por Vencer:', err);
    }
}

function aplicarFiltroVencer() {
    procesarSKUporVencer();
}

function procesarSKUporVencer() {
    if (datosStockValorizado.length === 0) return;

    const headers = datosStockValorizado[0];
    // Buscar índices de columnas
    const iIDProducto = headers.findIndex(h => h && h.toString().toLowerCase().replace(/ /g, '') === 'idproducto');
    const iProducto = headers.findIndex(h => h && h.toString().toLowerCase() === 'producto');
    const iCantidad = headers.findIndex(h => h && h.toString().toLowerCase() === 'cantidad');
    const iNumLote = headers.findIndex(h => h && h.toString().toLowerCase().replace(/ /g, '').includes('numerodelote') || (h && h.toString().toLowerCase().replace(/ /g, '') === 'numerolote') || (h && h.toString().toLowerCase().replace(/ /g, '') === 'numlote') || (h && h.toString().toLowerCase().replace(/ /g, '') === 'nºlote') || (h && h.toString().toLowerCase().replace(/ /g, '') === 'nlote'));
    const iFechaVenc = headers.findIndex(h => h && h.toString().toLowerCase().replace(/ /g, '').includes('fechavencimiento'));
    const iBloqueado = headers.findIndex(h => h && h.toString().toLowerCase() === 'bloqueado');

    console.log('Stock Valorizado headers:', headers);
    console.log('Indices -> IDProducto:', iIDProducto, 'Producto:', iProducto, 'NumLote:', iNumLote, 'FechaVenc:', iFechaVenc, 'Bloqueado:', iBloqueado);

    const EXCEL_EPOCH = new Date('1899-12-30').getTime();
    function excelSerialToDate(serial) {
        const num = Number(serial);
        if (isNaN(num) || num <= 0) return null;
        return new Date(EXCEL_EPOCH + num * 86400000);
    }

    function parseFecha(val) {
        if (!val) return null;
        if (typeof val === 'number') return excelSerialToDate(val);
        if (val instanceof Date) return val;
        if (typeof val === 'string') {
            const d = new Date(val);
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
    }

    // Leer fecha límite
    const fechaLimiteStr = document.getElementById('vencerFechaLimite').value;
    const fechaLimite = fechaLimiteStr ? new Date(fechaLimiteStr + 'T23:59:59') : null;

    const productos = [];
    for (let i = 1; i < datosStockValorizado.length; i++) {
        const fila = datosStockValorizado[i];
        if (!fila || fila.length === 0) continue;

        // Filtrar: Bloqueado = Falso (el valor puede ser boolean false o string)
        const rawBloq = iBloqueado >= 0 ? fila[iBloqueado] : '';
        // Manejar boolean directamente (SheetJS puede devolver boolean false)
        if (rawBloq === true) continue;
        const bloqueado = String(rawBloq == null ? '' : rawBloq).trim().toLowerCase();
        if (bloqueado === 'verdadero' || bloqueado === 'true' || bloqueado === 'si' || bloqueado === 'sí' || bloqueado === '1') continue;

        const fechaVenc = parseFecha(iFechaVenc >= 0 ? fila[iFechaVenc] : null);

        // Filtrar por fecha límite si está definida
        if (fechaLimite && fechaVenc) {
            if (fechaVenc > fechaLimite) continue;
        }
        // Si no hay fecha de vencimiento, no lo incluimos (no podemos saber si vence)
        if (!fechaVenc) continue;

        const sku = iIDProducto >= 0 ? String(fila[iIDProducto] || '').trim() : '';
        const nombre = iProducto >= 0 ? String(fila[iProducto] || '').trim() : '';
        const cantidad = iCantidad >= 0 ? Number(fila[iCantidad]) || 0 : 0;
        const nLote = iNumLote >= 0 ? String(fila[iNumLote] || '').trim() : '';

        // Calcular días restantes
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((fechaVenc - hoy) / 86400000);

        productos.push({
            sku,
            nombre,
            cantidad,
            nLote,
            fechaVencimiento: fechaVenc,
            fechaVencStr: fechaVenc.toLocaleDateString('es-CL'),
            diasRestantes
        });
    }

    // Ordenar por fecha de vencimiento ascendente (los más próximos primero)
    productos.sort((a, b) => a.fechaVencimiento - b.fechaVencimiento);

    window._datosVencer = productos;

    // Resumen
    const resumenEl = document.getElementById('vencer-resumen');
    const countEl = document.getElementById('vencer-count');
    const vencidos = productos.filter(p => p.diasRestantes <= 0).length;
    const proximos30 = productos.filter(p => p.diasRestantes > 0 && p.diasRestantes <= 30).length;
    countEl.innerHTML = '<strong>' + productos.length + '</strong> productos encontrados';
    if (vencidos > 0) countEl.innerHTML += ' &nbsp;|&nbsp; <span style="color:#e74c3c;font-weight:700;">' + vencidos + ' ya vencidos</span>';
    if (proximos30 > 0) countEl.innerHTML += ' &nbsp;|&nbsp; <span style="color:#f1c40f;font-weight:700;">' + proximos30 + ' vencen en 30 días</span>';
    resumenEl.style.display = 'flex';

    // Render tabla
    renderTablaVencer(productos);
}

function renderTablaVencer(productos) {
    const container = document.getElementById('tableContainer-vencer');
    if (productos.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px;">No se encontraron productos que cumplan los filtros.</p>';
        return;
    }

    let html = '<table class="tabla-datos tabla-vencer"><thead><tr>';
    html += '<th>SKU</th><th>Nombre</th><th>Cantidad</th><th>N° Lote</th><th>Fecha Vencimiento</th><th>Días Restantes</th><th>Estado</th>';
    html += '</tr></thead><tbody>';

    productos.forEach(p => {
        let estadoClass, estadoText;
        if (p.diasRestantes <= 0) {
            estadoClass = 'vencer-badge vencer-vencido';
            estadoText = 'Vencido';
        } else if (p.diasRestantes <= 30) {
            estadoClass = 'vencer-badge vencer-critico';
            estadoText = 'Crítico';
        } else if (p.diasRestantes <= 90) {
            estadoClass = 'vencer-badge vencer-proximo';
            estadoText = 'Próximo';
        } else {
            estadoClass = 'vencer-badge vencer-ok';
            estadoText = 'OK';
        }

        html += '<tr>';
        html += '<td>' + p.sku + '</td>';
        html += '<td>' + p.nombre + '</td>';
        html += '<td style="text-align:center;">' + p.cantidad.toLocaleString('es-CL') + '</td>';
        html += '<td style="text-align:center;">' + p.nLote + '</td>';
        html += '<td style="text-align:center;">' + p.fechaVencStr + '</td>';
        html += '<td style="text-align:center;font-weight:600;">' + p.diasRestantes + '</td>';
        html += '<td style="text-align:center;"><span class="' + estadoClass + '">' + estadoText + '</span></td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function exportarSKUporVencer() {
    const datos = window._datosVencer;
    if (!datos || datos.length === 0) return alert('No hay datos para exportar.');
    const filas = [['SKU', 'Nombre', 'Cantidad', 'N° Lote', 'Fecha Vencimiento', 'Días Restantes', 'Estado']];
    datos.forEach(p => {
        let estado;
        if (p.diasRestantes <= 0) estado = 'Vencido';
        else if (p.diasRestantes <= 30) estado = 'Crítico';
        else if (p.diasRestantes <= 90) estado = 'Próximo';
        else estado = 'OK';
        filas.push([p.sku, p.nombre, p.cantidad, p.nLote, p.fechaVencStr, p.diasRestantes, estado]);
    });
    const ws = XLSX.utils.aoa_to_sheet(filas);
    // Ajustar anchos de columna
    ws['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SKU por Vencer');
    XLSX.writeFile(wb, 'SKU_por_Vencer.xlsx');
}
