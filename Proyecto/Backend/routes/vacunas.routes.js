// backend/routes/vacunas.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/vacunas - Obtener todas las vacunas disponibles
router.get('/', async (req, res) => {
    try {
        const vacunas = await prisma.vacuna.findMany();
        res.json(vacunas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las vacunas.' });
    }
});

// POST /api/vacunas - Crear una nueva vacuna en el catálogo (opcional, para el admin)
router.post('/', async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        const nuevaVacuna = await prisma.vacuna.create({
            data: { nombre, descripcion }
        });
        res.status(201).json(nuevaVacuna);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la vacuna.' });
    }
});
// DELETE /api/animales/vacunas/:registroId - ELIMINAR UN REGISTRO DE VACUNACIÓN
router.delete('/vacunas/:registroId', async (req, res) => {
    const { registroId } = req.params;
    try {
        await prisma.calendarioVacunacion.delete({
            where: { id: parseInt(registroId) }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el registro de vacunación.' });
    }
});
module.exports = router;