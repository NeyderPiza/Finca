// backend/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
    try {
        // 1. Contar animales totales y por especie
        const totalAnimales = await prisma.animal.count({
            where: { estado: 'activo' }
        });
        const totalBovinos = await prisma.animal.count({
            where: { estado: 'activo', especie_id: 1 } // Asumiendo que Bovino es ID 1
        });
        const totalEquinos = await prisma.animal.count({
            where: { estado: 'activo', especie_id: 2 } // Asumiendo que Equino es ID 2
        });

        // 2. Calcular el balance financiero
        const calculosFinancieros = await prisma.transaccionFinanciera.groupBy({
            by: ['tipo_transaccion'],
            _sum: {
                monto: true,
            },
        });

        let totalIngresos = 0;
        let totalGastos = 0;

        calculosFinancieros.forEach(item => {
            if (item.tipo_transaccion === 'ingreso') {
                totalIngresos = item._sum.monto || 0;
            } else if (item.tipo_transaccion === 'gasto') {
                totalGastos = item._sum.monto || 0;
            }
        });

        const balanceGeneral = totalIngresos - totalGastos;

        // 3. Devolver todos los datos en un solo objeto
        res.json({
            animales: {
                total: totalAnimales,
                bovinos: totalBovinos,
                equinos: totalEquinos,
            },
            finanzas: {
                ingresos: totalIngresos,
                gastos: totalGastos,
                balance: balanceGeneral,
            }
        });

    } catch (error) {
        console.error("Error al calcular el resumen:", error);
        res.status(500).json({ error: 'No se pudo generar el resumen del dashboard.' });
    }
});

module.exports = router;