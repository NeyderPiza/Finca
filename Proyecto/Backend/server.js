// 1. Importar los paquetes necesarios
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno

const animalRoutes = require('./routes/animales.routes');

// Importar el cliente de Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 2. Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 3001; // Usar el puerto del .env o el 3001 por defecto

// 3. Middlewares
app.use(cors()); // Permitir peticiones de otros orígenes (frontend)
app.use(express.json()); // Permitir que el servidor entienda peticiones con cuerpo en formato JSON

// 4. Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API de FincaPiza funcionando!');
});

// --- AQUÍ IRÁN LAS RUTAS DE NUESTRA API ---
app.use('/api/animales', animalRoutes);

// Ejemplo: Obtener todas las especies
app.get('/api/especies', async (req, res) => {
    try {
        const especies = await prisma.especie.findMany();
        res.json(especies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudieron obtener las especies.' });
    }
});


// 5. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});