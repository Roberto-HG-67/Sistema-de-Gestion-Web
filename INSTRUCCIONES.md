# 📊 Visualizador de Excel - Guía de Uso

## 🎯 ¿Qué hace esta página web?

Esta página web lee el archivo **SKU.xlsx** de la carpeta Excel y muestra su contenido en una tabla interactiva y bonita.

---

## 🚀 Cómo ejecutar la página web

Tienes **2 opciones** para ver tu página:

### **Opción 1: Servidor Local (RECOMENDADO)** ⭐

Esta es la mejor opción porque permite cargar automáticamente el archivo Excel.

#### Pasos:

1. **Abre una terminal de PowerShell** (ya debería estar abierta en VS Code)

2. **Ejecuta este comando:**
   ```powershell
   python -m http.server 8000
   ```
   
   Si no tienes Python, usa este otro comando:
   ```powershell
   npx http-server -p 8000
   ```

3. **Abre tu navegador** y ve a:
   ```
   http://localhost:8000
   ```

4. **Haz clic en el botón "🔄 Cargar Datos de Excel"**

5. ¡Listo! Verás tu tabla con los datos del archivo SKU.xlsx

---

### **Opción 2: Abrir archivo directamente** 📁

Si no quieres usar un servidor, puedes abrir el archivo directamente:

#### Pasos:

1. **Encuentra el archivo `index.html`** en tu carpeta

2. **Haz doble clic** en él (se abrirá en tu navegador predeterminado)

3. **Haz clic en "📁 Cargar Otro Archivo"**

4. **Selecciona el archivo** `Excel/SKU.xlsx`

5. ¡Listo! Verás la tabla con tus datos

---

## 📋 Archivos creados

- **index.html** - La página principal
- **script.js** - El código que lee el Excel
- **styles.css** - Los estilos bonitos de la página
- **INSTRUCCIONES.md** - Este archivo

---

## 🎨 Características

✅ **Diseño moderno** con gradientes y sombras  
✅ **Tabla interactiva** con colores alternados  
✅ **Responsive** - se adapta a celulares y tablets  
✅ **Información del archivo** - muestra número de filas y columnas  
✅ **Dos formas de cargar** - automática o manual  

---

## 🔧 ¿Problemas?

### Error: "No se pudo cargar el archivo Excel/SKU.xlsx"
- **Solución:** Usa la Opción 1 (servidor local) o el botón "Cargar Otro Archivo"

### La tabla se ve cortada
- **Solución:** Puedes hacer scroll horizontal en la tabla

### No se ve bonito
- **Solución:** Asegúrate de que los archivos `styles.css` y `script.js` estén en la misma carpeta que `index.html`

---

## 📚 Para aprender más

- **HTML** - Estructura de la página
- **CSS** - Estilos visuales  
- **JavaScript** - Lógica para leer Excel
- **Librería SheetJS** - Lee archivos Excel en el navegador

---

## 🎓 Próximos pasos para mejorar

1. Agregar filtros para buscar en la tabla
2. Poder descargar la tabla como PDF
3. Agregar gráficos con los datos
4. Poder editar los datos y guardarlos
5. Mostrar múltiples hojas del Excel

---

¡Disfruta tu visualizador de Excel! 🎉
