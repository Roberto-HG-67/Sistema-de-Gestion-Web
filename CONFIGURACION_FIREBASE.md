# 🔐 Configuración de Firebase Authentication

## Paso 1: Crear proyecto en Firebase (GRATIS)

1. Ve a **https://console.firebase.google.com/**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** (o "Add project")
4. Nombre del proyecto: `sistema-gestion-web` (o el que prefieras)
5. Puedes desactivar Google Analytics (no es necesario)
6. Clic en **"Crear proyecto"**

---

## Paso 2: Obtener la configuración de Firebase

1. En tu proyecto de Firebase, haz clic en el ícono de **Web** `</>` (está en la página principal del proyecto)
2. Nombre de la app: `Sistema Gestion` 
3. **NO** marques Firebase Hosting (ya usamos GitHub Pages)
4. Clic en **"Registrar app"**
5. Te mostrará un código como este:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB...",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

6. **Copia esos valores** y pégalos en el archivo `firebase-config.js` de tu proyecto

---

## Paso 3: Activar autenticación por Email/Contraseña

1. En Firebase Console, ve al menú lateral → **Authentication** (o "Autenticación")
2. Haz clic en **"Comenzar"** (o "Get started")
3. En la pestaña **"Sign-in method"** (Método de inicio de sesión)
4. Haz clic en **"Correo electrónico/contraseña"**
5. **Activa** el primer switch (Email/Password)
6. Clic en **"Guardar"**

---

## Paso 4: Crear usuarios

1. En Firebase Console → **Authentication** → pestaña **"Users"** (Usuarios)
2. Haz clic en **"Agregar usuario"** (o "Add user")
3. Ingresa:
   - **Correo**: el email del usuario (ej: `roberto@gmail.com`)
   - **Contraseña**: una contraseña segura
4. Clic en **"Agregar usuario"**
5. Repite para cada persona que necesite acceso (hasta 10 personas en tu caso)

---

## Paso 5: Autorizar tu dominio de GitHub Pages

1. En Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Haz clic en **"Add domain"**
3. Agrega: `roberto-hg-67.github.io`
4. Clic en **"Agregar"**

> ⚠️ **IMPORTANTE**: Sin este paso, el login NO funcionará en tu página de GitHub Pages.

---

## Paso 6: Actualizar firebase-config.js

Abre el archivo `firebase-config.js` en tu proyecto y reemplaza los valores de ejemplo con los que copiaste en el Paso 2:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB...",              // ← Tu API Key real
    authDomain: "tu-proyecto.firebaseapp.com",  // ← Tu Auth Domain
    projectId: "tu-proyecto-id",        // ← Tu Project ID
    storageBucket: "tu-proyecto.appspot.com",    // ← Tu Storage Bucket
    messagingSenderId: "123456789",     // ← Tu Sender ID
    appId: "1:123456789:web:abc123"     // ← Tu App ID
};
```

---

## Paso 7: Subir cambios a GitHub

Ejecuta estos comandos en la terminal:

```bash
git add .
git commit -m "🔐 Agregar sistema de login con Firebase Auth"
git push
```

Espera ~1 minuto y tu página con login estará lista.

---

## 📋 Resumen de archivos nuevos/modificados

| Archivo | Descripción |
|---------|-------------|
| `login.html` | Página de inicio de sesión |
| `firebase-config.js` | Configuración de conexión a Firebase |
| `index.html` | Modificado: protegido con verificación de autenticación |
| `styles.css` | Modificado: estilos del login y botón de cerrar sesión |

---

## 🔄 Flujo del sistema

1. El usuario entra a la página → se le muestra `login.html`
2. Ingresa email y contraseña → Firebase verifica las credenciales
3. Si es correcto → se redirige a `index.html` (la app principal)
4. Si no es correcto → se muestra un mensaje de error
5. El botón **"🚪 Salir"** cierra la sesión y vuelve al login
6. Si intenta acceder a `index.html` directamente sin estar logueado → se redirige automáticamente al login

---

## ❓ Preguntas frecuentes

### ¿Es gratis?
Sí, Firebase Authentication es **gratis hasta 50,000 usuarios activos por mes**.

### ¿Los datos son seguros?
Las contraseñas se almacenan encriptadas en los servidores de Google/Firebase. Nunca se guardan en tu código.

### ¿Puedo agregar más usuarios después?
Sí, solo ve a Firebase Console → Authentication → Users → Agregar usuario.

### ¿Un usuario puede cambiar su contraseña?
Sí, usando el botón "¿Olvidaste tu contraseña?" en el login. Se enviará un correo con enlace para restablecerla.

### ¿Puedo eliminar usuarios?
Sí, desde Firebase Console → Authentication → Users → selecciona el usuario → Eliminar.
