# 📧 Guía de Configuración de EmailJS

## ¿Qué es EmailJS?

EmailJS es un servicio que permite enviar correos electrónicos directamente desde JavaScript sin necesidad de un servidor backend. Es perfecto para aplicaciones web estáticas como esta.

---

## 🚀 Pasos para Configurar EmailJS

### 1. Crear Cuenta en EmailJS

1. Ve a: **https://www.emailjs.com/**
2. Click en "Sign Up" (Registrarse)
3. Usa tu email: `h.robertog@gmail.com` o `inventario@alimentika.cl`
4. Confirma tu email
5. Inicia sesión

---

### 2. Agregar Servicio de Email

1. En el Dashboard, ve a **"Email Services"**
2. Click en **"Add New Service"**
3. Selecciona tu proveedor de email:
   - **Gmail** (recomendado si usas Gmail)
   - **Outlook** 
   - O cualquier otro proveedor
4. Sigue las instrucciones para conectar tu cuenta
5. Dale un nombre al servicio (ej: "Alimentika Emails")
6. **Copia el Service ID** (lo necesitarás después)

---

### 3. Crear Template de Email

1. Ve a **"Email Templates"**
2. Click en **"Create New Template"**
3. Configura el template:

   **Subject (Asunto):**
   ```
   Ingreso de Productos - Factura {{factura}}
   ```

   **Content (Contenido):**
   ```html
   <h2>Nuevo Ingreso de Productos</h2>
   
   <p><strong>RUT:</strong> {{rut}}</p>
   <p><strong>Comercializadora:</strong> {{comercializadora}}</p>
   <p><strong>Factura:</strong> {{factura}}</p>
   
   <br>
   
   {{{message}}}
   ```

   **Settings:**
   - **To Email:** `inventario@alimentika.cl`
   - **From Name:** `Sistema Alimentika`
   - **From Email:** Tu email configurado
   - **Reply To:** `inventario@alimentika.cl`

4. **Guarda el template**
5. **Copia el Template ID** (lo necesitarás después)

---

### 4. Obtener tu Public Key

1. Ve a **"Account"** en el menú
2. Busca la sección **"API Keys"**
3. **Copia tu Public Key** (empieza con algo como `user_...`)

---

### 5. Actualizar el Código

Abre el archivo **`script.js`** y busca la función `enviarCorreo()`.

Reemplaza estos valores:

```javascript
// Línea ~876
emailjs.init('YOUR_PUBLIC_KEY'); // Reemplazar con tu Public Key

// Línea ~889
await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
//                  ^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^^
//                  Service ID         Template ID
```

**Ejemplo:**
```javascript
// Antes:
emailjs.init('YOUR_PUBLIC_KEY');
await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

// Después:
emailjs.init('user_abc123XYZ');
await emailjs.send('service_gmail_1', 'template_ingreso_1', templateParams);
```

---

### 6. Probar el Envío

1. Guarda los cambios en `script.js`
2. Recarga la página en el navegador (F5)
3. Ve a la pestaña **"Ingreso de Productos"**
4. Llena el formulario:
   - RUT: `12.345.678-9`
   - Factura: `TEST001`
   - Agrega un producto de prueba
5. Click en **"📧Enviar correo"**
6. Verifica que llegue el correo a `inventario@alimentika.cl`

---

## 📝 Ejemplo Completo

```javascript
async function enviarCorreo() {
    // ... código anterior ...
    
    try {
        // Reemplaza con tus valores reales
        emailjs.init('user_abc123XYZ456'); // ← Tu Public Key
        
        const templateParams = {
            to_email: 'inventario@alimentika.cl',
            from_email: 'inventario@alimentika.cl',
            subject: `Ingreso de Productos - Factura ${factura}`,
            message: tablaHTML,
            rut: rut,
            comercializadora: comercializadora,
            factura: factura
        };
        
        // Reemplaza con tus valores reales
        await emailjs.send(
            'service_gmail_1',      // ← Tu Service ID
            'template_ingreso_1',   // ← Tu Template ID
            templateParams
        );
        
        // ... resto del código ...
    }
}
```

---

## 🔐 Seguridad

**⚠️ Importante:**
- EmailJS tiene un límite de **200 emails gratis al mes**
- Para más, necesitas plan de pago
- La Public Key es pública (no hay problema en subirla a GitHub)
- EmailJS tiene protección anti-spam incorporada

---

## 🐛 Solución de Problemas

### Error: "EmailJS is not defined"
**Causa:** La librería no se cargó desde el CDN.  
**Solución:** Verifica tu conexión a internet. La librería se carga desde `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

### Error: "Invalid service ID"
**Causa:** El Service ID está mal o no existe.  
**Solución:** Ve a EmailJS Dashboard → Email Services → Copia el Service ID correcto.

### Error: "Template doesn't exist"
**Causa:** El Template ID está mal o no existe.  
**Solución:** Ve a EmailJS Dashboard → Email Templates → Copia el Template ID correcto.

### El correo no llega
**Solución:**
1. Revisa la carpeta de SPAM
2. Verifica que el email de destino sea correcto
3. Revisa los logs en EmailJS Dashboard
4. Verifica que el servicio de email esté conectado correctamente

---

## 📊 Alternativas a EmailJS

Si prefieres otra opción:

### 1. **FormSubmit** (https://formsubmit.co/)
- Más simple
- Sin registro
- Envía a cualquier email

### 2. **Nodemailer con Backend**
- Más control
- Requiere servidor Node.js
- Más complejo de configurar

### 3. **SendGrid**
- Más profesional
- API Keys
- Mejor para volumen alto

---

## ✅ Checklist de Configuración

- [ ] Cuenta creada en EmailJS
- [ ] Servicio de email agregado
- [ ] Template creado
- [ ] Public Key copiada
- [ ] Service ID copiado
- [ ] Template ID copiado
- [ ] Código actualizado en script.js
- [ ] Prueba de envío realizada
- [ ] Correo recibido correctamente

---

## 💡 Tips

1. **Guarda tus credenciales** en un lugar seguro
2. **Prueba primero con tu email** personal antes de usar el oficial
3. **Revisa los logs** en EmailJS Dashboard para debuggear
4. **Configura notificaciones** en EmailJS para saber cuándo se envían correos

---

**¿Necesitas ayuda?**
- Documentación oficial: https://www.emailjs.com/docs/
- Tutoriales en YouTube
- Soporte de EmailJS: support@emailjs.com

---

**Actualizado:** Febrero 2026  
**Sistema:** Gestión Alimentika v1.0
