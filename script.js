// Variables globales para almacenar datos
let datosSKU = [];
let datosProveedores = [];
let datosStockActual = [];
let datosBBDD = [];
let chartConsumo = null;
let chartVentas = null;

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
        if (cantidadVendida > 0) {
            datosGrafico.push({ nombre: nombre || String(skuOrig), cantidad: cantidadVendida });
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
                sortIcon = estado.asc ? ' ▲' : ' ▼';
            } else {
                sortIcon = ' ⇅';
            }
        }
        
        // Solo mostrar filtro en las primeras 2 columnas (SKU, Nombre)
        if (index < 2) {
            const sortBtn = esOrdenable ? `<span class="sort-btn" onclick="ordenarTablaVentas(${index})">${sortIcon}</span>` : '';
            html += `<th${clsAttr}>
                <div class="header-cell">
                    <span class="header-text">${header || 'Col ' + (index + 1)}${sortBtn}</span>
                    <input type="text" class="column-filter" placeholder="Filtrar..." 
                           onkeyup="filtrarTabla('${containerId}', ${index}, this.value)">
                </div>
            </th>`;
        } else {
            const sortBtn = esOrdenable ? `<span class="sort-btn" onclick="ordenarTablaVentas(${index})">${sortIcon}</span>` : '';
            html += `<th${clsAttr}><span class="header-text">${header || 'Col ' + (index + 1)}${sortBtn}</span></th>`;
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
    const ctx = document.getElementById('chartVentas');
    
    if (chartVentas) {
        chartVentas.destroy();
    }
    
    // Ordenar por cantidad y tomar top 20
    datos.sort((a, b) => b.cantidad - a.cantidad);
    const top20 = datos.slice(0, 20);
    
    chartVentas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top20.map(d => d.nombre),
            datasets: [{
                label: 'Cantidad Vendida',
                data: top20.map(d => d.cantidad),
                backgroundColor: 'rgba(118, 75, 162, 0.7)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 60,
                        minRotation: 45,
                        font: { size: 9 }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        autoSkip: true
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Top 20 Productos Más Vendidos'
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
