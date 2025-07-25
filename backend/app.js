// Servidor Principal

// Importar dependencias: Framework Express y el Middleware CORS
// Cors permite que el servidor acepte solicitudes de diferentes dominios (Cross-Origin Resource Sharing)
// Esto es útil para aplicaciones frontend que se ejecutan en un dominio diferente al del backend
// de la API (por ejemplo, si el frontend está en localhost:3000 y el backend en localhost:5000)
const express = require('express');
const cors = require('cors');

const path = require('path'); // Para trabajar con rutas de archivos

// Importar dotenv para manejar variables de entorno
require('dotenv').config();

// Importa las rutas de usuarios, tareas y grupos
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const groupRoutes = require('./routes/groupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authenticateToken = require('./middleware/authMiddleware');

// Importa la configuración de Sequelize para establecer la conexión a la base de datos
const sequelize = require('./config/sequelize');

// IMPORTANTE: Importar las asociaciones de los modelos ANTES de sincronizar
// Esto debe hacerse después de importar sequelize pero antes de sync()
require('./models/associationsModel');

//Esto inicia el servicio de cron para ejecutar diariamente y avisar al usuario que 
//la tarea que tiene está por vencerse (1 día o menos de vencimiento)
require('./jobs/taskNotifications')

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el middleware CORS para permitir solicitudes de diferentes orígenes
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite el parseo de JSON en las solicitudes

// Middleware que permite leer datos enviados desde formularios HTML (form-urlencoded)
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

// // Middleware para servir archivos estáticos desde la carpeta 'public'
// // Esto permite acceder al HTML, CSS y JS del frontend sin rutas adicionales
// app.use(express.static('frontend'));

// Servir solo archivos públicos (login, registro, index) sin autenticación
app.use('/public', express.static(path.join(__dirname, '../frontend')));


/* 
--> Sirve los archivos HTML SIN autenticación
    Los archivos HTML deben servirse sin autenticación.
    La protección de acceso debe hacerse en el frontend, comprobando el token y el rol con JS después de cargar la página
--> Controla el acceso en el frontend
    Después de cargar la página, tu JS puede hacer una llamada protegida (con JWT) a /api/users/me para comprobar el rol y mostrar o redirigir según corresponda.
--> ¿Por qué funciona?
    Cuando navegas o refrescas la página, el HTML se sirve siempre (no requiere token).
    El JS de la página pide los datos (protegidos) a la API, usando el token. Si no tiene token o no tiene permisos, ahí muestras el error en la interfaz.
    De esta forma, cualquier usuario puede acceder a cualquier pantalla HTML (incluyendo settings), y los permisos los controlás luego desde el frontend y las APIs.
--> Sirve todas las vistas sin autenticación 
--> Sirve los archivos HTML como archivos estáticos (NO protegidos con autenticación).
--> Protege solo las rutas API.
--> Valida permisos en el frontend después de cargar la página.
// app.use('/views', express.static(path.join(__dirname, '../frontend/views')));*/

// Rutas protegidas para vistas de usuario
app.get('/views/user/:page', authenticateToken, (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, '../frontend/views/user', page));
});

// Rutas protegidas para vistas de administrador (si aplica)
app.get('/views/admin/:page', authenticateToken, (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, '../frontend/views/admin', page));
});

// Ruta para login y registro sin autenticación
app.get('/views/auth/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, '../frontend/views/auth', page));
});

// Configuracion de rutas
app.use('/api/users', userRoutes); // Monta la rutas de usuarios bajo /api/users
app.use('/api/tasks', authenticateToken, taskRoutes); // Protege rutas de tareas con JWT
app.use('/api/groups', authenticateToken, groupRoutes); // Protege rutas de grupos con JWT
app.use('/api/notifications', authenticateToken, notificationRoutes); // Protege rutas de notificaciones con JWT

// Puerto del servidor
const PORT = 3000;

// Ruta raiz/de inicio
// Esta ruta responde a las solicitudes GET en la raíz del servidor (http://localhost:3000/)
app.get('/', (req, res) => {
    res.send('Welcome to the API of GetDone');
});

// Sincronización de la base de datos e inicio del servidor
// -------------------------------------------------------
// sequelize.sync() sincroniza los modelos de Sequelize con las tablas de la base de datos:
// - Si las tablas no existen, las crea (en desarrollo).
// - Si existen, verifica que coincidan con los modelos (opcionalmente con alter: true).

// NOTA: En desarrollo puedes usar { force: true } para recrear las tablas
// En producción usa { alter: true } para actualizar sin perder datos
sequelize.sync({ alter: true }) // Cambiado de sync() a sync({ alter: true })
    .then(() => {
        console.log('✅ Base de datos sincronizada correctamente');
        console.log('📊 Tablas creadas/actualizadas: users, groups, group_members, tasks, task_comments, invitations');
        
        // Una vez sincronizada la BD, inicia el servidor en el puerto especificado.
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log('📝 API endpoints disponibles:');
            console.log('   - GET  / (página de bienvenida)');
            console.log('   - API  /api/users (gestión de usuarios)');
            console.log('   - API  /api/tasks (gestión de tareas)');
            console.log('   - API  /api/groups (gestión de grupos)');
            console.log('   - API  /api/notifications (gestión de notificaciones)');
        });
    })
    .catch(err => {
        // Si hay un error en la conexión o sincronización, lo muestra en consola.
        console.error('❌ Error al conectar con la base de datos:', err);
        console.error('💡 Verifica que PostgreSQL esté corriendo y la configuración sea correcta');
    });


/* Funcionalidad Deprecada: */

// // Iniciar el servidor y escuchar en el puerto definido
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });