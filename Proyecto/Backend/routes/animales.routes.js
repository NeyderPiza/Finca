// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();

// Importamos el cliente de Prisma que creamos en server.js
// Para ello, lo exportaremos desde server.js y lo importaremos aquí.
// Por ahora, vamos a instanciarlo aquí para simplicidad.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// --- DEFINICIÓN DE RUTAS PARA ANIMALES ---

// 1. OBTENER TODOS LOS ANIMALES (GET /api/animales)
router.get('/', async (req, res) => {
    try {
        const animales = await prisma.animal.findMany({
            // 'include' nos permite traer datos de tablas relacionadas
            include: {
                especie: true, // Incluir la información de la especie de cada animal
            },
        });
        res.json(animales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los animales.' });
    }
});

// 2. OBTENER UN ANIMAL POR SU ID (GET /api/animales/:id)
router.get('/:id', async (req, res) => {
    // Obtenemos el 'id' de los parámetros de la URL
    const { id } = req.params;
    try {
        const animal = await prisma.animal.findUnique({
            where: {
                // El id de la base de datos es un número, así que lo convertimos
                id: parseInt(id),
            },
            include: {
                especie: true,
                historial_medico: true, // También podemos traer su historial
                vacunaciones: { 
            orderBy: { fecha_aplicacion: 'desc' },
            include: {
                vacuna: true // Para que nos traiga el nombre de la vacuna
            }
        },
    },
});

        if (!animal) {
            return res.status(404).json({ error: 'Animal no encontrado.' });
        }

        res.json(animal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el animal.' });
    }
});

// 3. CREAR UN NUEVO ANIMAL (POST /api/animales)
router.post('/', async (req, res) => {
    // Obtenemos los datos del cuerpo de la petición (enviados en formato JSON)
    const { nombre, numero_etiqueta, especie_id, fecha_nacimiento } = req.body;

    // Validación básica
    if (!numero_etiqueta || !especie_id) {
        return res.status(400).json({ error: 'El número de etiqueta y la especie son obligatorios.' });
    }

    try {
        const nuevoAnimal = await prisma.animal.create({
            data: {
                nombre,
                numero_etiqueta,
                especie_id,
                // Si la fecha de nacimiento viene, la convertimos a formato ISO
                fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
            },
        });
        res.status(201).json(nuevoAnimal); // 201 significa "Creado"
    } catch (error) {
        console.error(error);
        // Código 'P2002' en Prisma significa que hay una violación de una restricción única (ej. numero_etiqueta repetido)
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Ya existe un animal con ese número de etiqueta.' });
        }
        res.status(500).json({ error: 'Error al crear el animal.' });
    }
});

// 4. ACTUALIZAR UN ANIMAL (PUT /api/animales/:id)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;

    try {
        const animalActualizado = await prisma.animal.update({
            where: { id: parseInt(id) },
            data: datosActualizados,
        });
        res.json(animalActualizado);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') { // 'P2025' es el código para "Registro a actualizar no encontrado"
            return res.status(404).json({ error: 'Animal no encontrado.' });
        }
        res.status(500).json({ error: 'Error al actualizar el animal.' });
    }
});


// 5. ELIMINAR UN ANIMAL (DELETE /api/animales/:id)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.animal.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // 204 significa "Sin Contenido" (éxito pero no devuelve nada)
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Animal no encontrado.' });
        }
        res.status(500).json({ error: 'Error al eliminar el animal.' });
    }
});

// POST /api/animales/:id/vacunas - REGISTRAR UNA VACUNA A UN ANIMAL
router.post('/:id/vacunas', async (req, res) => {
    const { id } = req.params;
    const { vacuna_id, fecha_aplicacion, proxima_dosis } = req.body;

    if (!vacuna_id || !fecha_aplicacion) {
        return res.status(400).json({ error: 'La vacuna y la fecha son obligatorias.' });
    }

    try {
        const nuevoRegistroVacuna = await prisma.calendarioVacunacion.create({
            data: {
                animal_id: parseInt(id),
                vacuna_id: parseInt(vacuna_id),
                fecha_aplicacion: new Date(fecha_aplicacion),
                proxima_dosis: proxima_dosis ? new Date(proxima_dosis) : null,
            }
        });
        res.status(201).json(nuevoRegistroVacuna);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la vacuna.' });
    }
});
// Exportamos el router para poder usarlo en nuestro archivo principal
module.exports = router;