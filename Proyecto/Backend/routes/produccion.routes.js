// backend/routes/produccion.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. OBTENER TODOS LOS REGISTROS DE PRODUCCIÓN (GET /api/produccion)
router.get('/', async (req, res) => {
    try {
        const registros = await prisma.produccionLechera.findMany({
            orderBy: {
                fecha: 'desc' // Los más recientes primero
            }
        });
        res.json(registros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los registros de producción.' });
    }
});

// 2. CREAR UN NUEVO REGISTRO DE PRODUCCIÓN (POST /api/produccion)
router.post('/', async (req, res) => {
    // Obtenemos los datos del cuerpo de la petición
    const { fecha, litros_producidos, precio_litro, gastos_asociados } = req.body;

    // Validación básica
    if (!fecha || !litros_producidos || !precio_litro) {
        return res.status(400).json({ error: 'La fecha, los litros y el precio son obligatorios.' });
    }

    try {
        const nuevoRegistro = await prisma.produccionLechera.create({
            data: {
                fecha: new Date(fecha),
                litros_producidos: parseFloat(litros_producidos),
                precio_litro: parseFloat(precio_litro),
                gastos_asociados: gastos_asociados ? parseFloat(gastos_asociados) : 0,
            },
        });
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el registro de producción.' });
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const registro = await prisma.produccionLechera.findUnique({
            where: { id: parseInt(id) },
        });
        if (!registro) {
            return res.status(404).json({ error: 'Registro no encontrado.' });
        }
        res.json(registro);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el registro.' });
    }
});

// POST /api/produccion - Crear un nuevo registro
router.post('/', async (req, res) => {
    // ... (este código ya lo tienes)
});

// --- VERIFICA QUE TENGAS ESTAS RUTAS ---

// PUT /api/produccion/:id - ACTUALIZAR UN REGISTRO
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const registroActualizado = await prisma.produccionLechera.update({
            where: { id: parseInt(id) },
            data: {
                fecha: new Date(data.fecha),
                litros_producidos: parseFloat(data.litros_producidos),
                precio_litro: parseFloat(data.precio_litro),
            },
        });
        res.json(registroActualizado);
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro no encontrado.' });
        res.status(500).json({ error: 'Error al actualizar el registro.' });
    }
});

// DELETE /api/produccion/:id - ELIMINAR UN REGISTRO
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.produccionLechera.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Registro no encontrado.' });
        res.status(500).json({ error: 'Error al eliminar el registro.' });
    }
});

module.exports = router;