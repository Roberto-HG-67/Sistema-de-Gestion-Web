# 📊 Sistema de Gestión Alimentika

Sistema web integrado para la gestión de inventario, análisis de ventas y control de productos. Desarrollado con JavaScript puro, HTML5 y CSS3.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características

- 🔄 **Carga automática** de archivos Excel
- 🔍 **Filtros en tiempo real** en todas las tablas
- 📊 **Gráficos interactivos** con Chart.js
- 💰 **Formateo automático** de números y monedas
- 📧 **Envío de correos** con tablas HTML
- 📱 **Diseño responsive** para todos los dispositivos

## 🚀 Módulos del Sistema

1. **SKU** - Catálogo completo de productos con formatos especiales
2. **Proveedores** - Gestión de proveedores
3. **Stock Actual** - Visualización de inventario en tiempo real
4. **Consolidado** - Unificación de múltiples archivos Excel
5. **Consumo** - Análisis de consumo con agrupaciones temporales
6. **Análisis de Ventas** - Dashboard de ventas con filtros avanzados
7. **Ingreso de Productos** - Formulario de ingreso con autocompletado

## 📁 Estructura del Proyecto

```
Pagina Web/
├── index.html              # Página principal
├── styles.css              # Estilos del sistema
├── script.js               # Lógica JavaScript
├── GUIA_USUARIO.md        # Manual de usuario
├── DOCUMENTACION_TECNICA.md # Documentación técnica
└── Excel/
    ├── SKU.xlsx           # Catálogo de productos
    ├── Proveedores.xlsx   # Información de proveedores
    ├── Stock Actual.xlsx  # Stock en bodegas
    └── BBDD.xlsx         # Base de datos consolidada
```

## 🔧 Instalación

### Requisitos

- Python 3.x (para servidor local)
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Archivos Excel en la carpeta `Excel/`

### Iniciar el Servidor

**Opción 1: Python**
```bash
python -m http.server 8000
```

**Opción 2: VS Code Task**
- Presionar `Ctrl+Shift+B`
- Seleccionar "🚀 Iniciar Servidor Web"

Luego abrir en navegador:
```
http://localhost:8000
```

## 💻 Uso

1. Iniciar el servidor web
2. Abrir `http://localhost:8000` en el navegador
3. Navegar entre las pestañas del sistema
4. Los datos se cargan automáticamente desde los archivos Excel

Para más detalles, consultar [GUIA_USUARIO.md](GUIA_USUARIO.md)

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Librerías:**
  - [SheetJS](https://sheetjs.com/) - Lectura de archivos Excel
  - [Chart.js](https://www.chartjs.org/) - Gráficos interactivos
  - [EmailJS](https://www.emailjs.com/) - Envío de correos

## 📊 Funcionalidades Destacadas

### Formateo Automático
- **Costo Neto**: $1.500
- **Margen**: 25%
- **Costo Venta**: $1.250,50

### Filtros Dinámicos
- Filtros en cada columna de todas las tablas
- Búsqueda en tiempo real
- Filtros combinables

### Gráficos Interactivos
- Gráficos de barras dinámicos
- Auto-ajuste de etiquetas
- Responsive y adaptativos

### Autocompletado Inteligente
- RUT → Comercializadora
- SKU → Producto
- Cálculo automático de costos unitarios

## 📝 Configuración de EmailJS (Opcional)

Para habilitar el envío real de correos:

1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Obtener credenciales (Service ID, Template ID, User ID)
3. Actualizar `script.js` con las credenciales

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

- **Roberto Hernández G.** - *Coordinador de Abastecimiento*

## 📞 Soporte

Para problemas o preguntas:
- Email: 
- Issues: [GitHub Issues](../../issues)

## 🗺️ Roadmap

- [ ] Exportación de tablas a Excel
- [ ] Importación de datos desde formularios web
- [ ] Dashboard con estadísticas generales
- [ ] Sistema de usuarios y permisos
- [ ] Backend para persistencia de datos
- [ ] Aplicación móvil

## 🙏 Agradecimientos

- Chart.js por los excelentes gráficos
- SheetJS por el manejo de Excel
- EmailJS por la integración de correos

---
