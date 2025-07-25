// Modulo de Usuario

// Importa DataTypes desde Sequelize para definir tipos de datos de las columnas del modelo.
// DetaTypes es un objeto que permite especificar el tipo de dato de cada columna/campo en el modelo.
const { DataTypes } = require('sequelize');

// Importa la instancia de Sequelize que se conecta a la base de datos (conexion ya establecida)
const sequelize = require('../config/sequelize');


// Define el modelo de Usuario usando Sequelize
// El primer argumento ('User') es el nombre del modelo, y el segundo es un objeto que define las columnas de la tabla.
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,        // Tipo de dato de la columna
        primaryKey: true,               // Indica que esta columna es la clave primaria de la tabla
        autoIncrement: true             // Indica que el valor de esta columna se incrementa automáticamente cada vez que se inserta un nuevo
    },
    firstName: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL)
        allowNull: false,               // No permite valores nulos (campo requerido)
    },
    lastName: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL)
        allowNull: false,               // No permite valores nulos (campo requerido)
    },
    email: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL)
        allowNull: false,               // No permite valores nulos (campo requerido)
        unique: true,                   // Debe ser único (no se permiten duplicados)
        validate: {
            isEmail: true               // Valida que el valor sea una dirección de correo electrónico válida
        }
    },
    password: {
        type: DataTypes.STRING,         // Tipo de dato: STRING (VARCHAR en SQL) para almacerenar la contraseña hasheada
        allowNull: false,               // No permite valores nulos (campo requerido)
    },
}, {
    tableName: 'users',                 // Nombre de la tabla en la base de datos (en plural por convención)
    freezeTableName: true,              // Evita que Sequelize pluralice el nombre de la tabla (usará 'users' tal cual)
    underscored: true,                  // Convierte camelCase a snake_case automáticamente (Nomenclatura de la base de datos)
    
    /* Posble eliminacion (A revisar) */
    timestamps: true,                   // Asegúrate que coincida con tu tabla (si tienes created_at/updated_at)
    createdAt: 'created_at',            // Mapea createdAt a created_at
    updatedAt: false,                   // No mapea updatedAt (no tenemos este campo en la tabla)
});

// Funcion para buscar un usuario por su email
// Utiliza el metodo findOne de Sequelize para buscar un registro en la tabla 'users'.
// Retorna una promesa con el usuario encontrado o null si no existe.
async function findUserByEmail(email) {
    return await User.findOne({ where: { email: email } }); // Busca un usuario por su email
}

// Funcion para crear un nuevo usuario
// Utiliza el metodo create de Sequelize para crear un nuevo registro en la tabla 'users'.
// Retorna una promesa con el usuario creado, incluyendo su ID generado automaticamente (sin la contraseña por seguridad).
async function createUser(firstName, lastName, email, password) {
    return await User.create({ firstName, lastName, email, password }); // Crea un nuevo usuario
}

/**
 * Actualiza la contraseña de un usuario en la base de datos.
 *
 * Esta función busca un usuario por su dirección de correo electrónico (normalizada a minúsculas
 * y sin espacios) y actualiza su contraseña por una nueva ya hasheada.
 *
 * @async
 * @function updateUserPassword
 * @param {string} email - Correo electrónico del usuario al que se desea cambiar la contraseña.
 * @param {string} hashedPassword - Nueva contraseña hasheada que será almacenada.
 * @returns {Promise<number[]>} - Retorna un array donde el primer elemento indica cuántas filas fueron actualizadas (por ejemplo: [1] si se modificó un usuario).
 *
 * @example
 * const result = await updateUserPassword('ejemplo@email.com', hashedPassword);
 * if (result[0] === 0) {
 *   console.log('No se encontró el usuario o no se actualizó la contraseña.');
 * }
 */
async function updateUserPassword(email, hashedPassword) {
    return await User.update(
        { password: hashedPassword },
        { where: { email: email.trim().toLowerCase() } }
    );
}


/** * Actualiza los nombres de un usuario en la base de datos.
 * * Esta función busca un usuario por su ID y actualiza sus nombres (firstName y lastName).
 * * @async
 * * @function updateNames
 * * @param {number} id - ID del usuario al que se desea cambiar los nombres.
 * * @param {string} firstName - Nuevo nombre del usuario.
 * * @param {string} lastName - Nuevo apellido del usuario.
 * * @returns {Promise<number[]>} - Retorna un array donde el primer elemento indica cuántas filas fueron actualizadas (por ejemplo: [1] si se modificó un usuario).
 * * @example
 * * const result = await updateNames(1, 'NuevoNombre', 'NuevoApellido');
 * * if (result[0] === 0) { * console.log('No se encontró el usuario o no se actualizó el nombre.'); *  }
 * */
// async function updateNames(id, firstName, lastName) {
//     return await User.update({ firstName, lastName }, { where: { id } });
// }



/** * Actualiza la contraseña de un usuario por su ID.
 * Esta función busca un usuario por su ID y actualiza su contraseña.
 * @async
 * @function updatePassword
 * @param {number} id - ID del usuario al que se desea cambiar la contraseña.
 * @param {string} password - Nueva contraseña que será almacenada (ya debe estar hasheada).
 * @returns {Promise<number[]>} - Retorna un array donde el primer elemento indica cuántas filas fueron actualizadas (por ejemplo: [1] si se modificó un usuario).
 * @example
 * const result = await updatePassword(1, 'nuevaContraseñaHasheada');
 * if (result[0] === 0) {
 *   console.log('No se encontró el usuario o no se actualizó la contraseña.');
 * }
 */
async function updatePassword(id, password) {
    return await User.update({ password }, { where: { id } });
}


/**
 * Actualiza dinámicamente un campo específico del perfil del usuario en la base de datos.
 *
 * @async
 * @function updateField
 * @param {number|string} userId - ID del usuario cuyo campo será actualizado.
 * @param {string} field - Nombre del campo a actualizar (ej. 'firstName', 'lastName').
 * @param {string} value - Nuevo valor que se asignará al campo.
 * @returns {Promise<[number, User[]]>} Resultado de la operación de actualización de Sequelize. 
 * Devuelve un array donde el primer elemento es el número de filas afectadas.
 *
 * @throws {Error} Lanza un error si la operación de actualización falla.
 */
async function updateField(userId, field, value) {
  const update = {};
  update[field] = value;
  
  return await User.update(update, {
    where: { id: userId }
  });
}

// Exporta:
// - El modelo User (para usarlo en relaciones o consultas personalizadas).
// - Las funciones findUserByEmail y createUser (para reutilizar la lógica en controladores o servicios).
module.exports = {
    User,
    findUserByEmail,
    createUser,
    updateUserPassword,
    updatePassword,
    updateField
    // updateNames,
};









/* Implementacion Conexion con Pool - Deprecada para este proyecto */

// // Importa el Pool de conexiones a la base de datos definido en db.js
// const pool = require('../config/db');

// /**
//  * Busca un usuario por su direccion de email en la base de datos
//  * @param {string} emial - Email del usuario a buscar
//  * @returns {Promise<Object|null>} - Objeto del usuario encontrado o null si no se encuentra
//  */
// async function findUserByEmail(email) {
//     // Ejecuta una consulta SQL parametrizada para buscar por email
//     // $1 es un marcador de posición para el primer parámetro (evita inyecciones SQL)
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

//     // Retorno el primer registro encontrado (rows[0]) o undefined si no hay resultados
//     return result.rows[0];
// }


// /**
//  * Crea un nuevo usuario en la base de datos
//  * @param {string} firstName - Nombre del nuevo usuario
//  * @param {string} lastName - Apellido del nuevo usuario
//  * @param {string} email - Email del nuevo usuario
//  * @param {string} hashedPassword - Contraseña ya hasheada (no almacenar contraseñas de texto plano) del nuevo usuario
//  * @returns {Promise<Object>} - Objeto con los datos basicos de usarios creado (sin la contraseña)
//  */
// async function createUser(firstName, lastName, email, password) {
//     // Ejecuta una inserción SQL parametrizada para crear un nuevo usuario
//     // La clausula RETURNING especifica que datos queremos recibir tras la inserción
//     const result = await pool.query(
//         'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
//         [firstName, lastName, email, password]
//     );

//     // Retorna el registro creado (sin incluir el campo passwoerd por seguridad)
//     return result.rows[0];
// }

// // Exporta las funciones para que puedan ser utilizadas en otros módulos
// module.exports = {
//     findUserByEmail,
//     createUser,
// };