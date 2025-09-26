// backend/routes/finanzas.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. OBTENER TODAS LAS TRANSACCIONES (GET /api/finanzas)
router.get('/', async (req, res) => {
    try {
        const transacciones = await prisma.transaccionFinanciera.findMany({
            orderBy: {
                fecha: 'desc' // Ordenar por fecha, la más reciente primero
            }
        });
        res.json(transacciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las transacciones.' });
    }
});

// 2. CREAR UNA NUEVA TRANSACCIÓN (POST /api/finanzas)
router.post('/', async (req, res) => {
    const { tipo_transaccion, descripcion, monto, fecha, categoria } = req.body;

    if (!tipo_transaccion || !descripcion || !monto || !fecha) {
        return res.status(400).json({ error: 'Todos los campos requeridos deben ser completados.' });
    }

    try {
        const nuevaTransaccion = await prisma.transaccionFinanciera.create({
            data: {
                tipo_transaccion,
                descripcion,
                monto: parseFloat(monto), // Asegurarse de que el monto es un número
                fecha: new Date(fecha),
                categoria
            },
        });
        res.status(201).json(nuevaTransaccion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la transacción.' });
    }
});

// (Opcional) Puedes añadir aquí las rutas para GET (por id), PUT y DELETE si las necesitas.
// Por ahora, con GET y POST es suficiente para empezar.

module.exports = router;