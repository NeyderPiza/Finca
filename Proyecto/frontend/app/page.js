// frontend/app/page.js
'use client';

import { useEffect, useState } from 'react';

// Un componente reutilizable para nuestras tarjetas de estadísticas
function StatCard({ title, value, colorClass = 'bg-white' }) {
    return (
        <div className={`${colorClass} p-6 rounded-lg shadow-md`}>
            <h3 className="text-gray-500 text-sm font-bold uppercase">{title}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
}

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchSummary() {
            try {
                const response = await fetch('http://localhost:3001/api/dashboard/summary');
                if (!response.ok) throw new Error('No se pudo cargar el resumen');
                const data = await response.json();
                setSummary(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSummary();
    }, []);

    if (loading) return <p className="p-8 text-center">Cargando dashboard...</p>;
    if (error) return <p className="p-8 text-center text-red-500">Error: {error}</p>;

    // Formateador para mostrar los valores como moneda
    const currencyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Tarjetas de Animales */}
                    <StatCard title="Total Animales Activos" value={summary.animales.total} />
                    <StatCard title="Total Bovinos" value={summary.animales.bovinos} />
                    <StatCard title="Total Equinos" value={summary.animales.equinos} />

                    {/* Tarjeta de Balance Financiero */}
                    <StatCard 
                        title="Balance General" 
                        value={currencyFormatter.format(summary.finanzas.balance)}
                        colorClass={summary.finanzas.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}
                    />

                    {/* (Opcional) Puedes añadir tarjetas para ingresos y gastos también */}
                    <StatCard 
                        title="Ingresos Totales" 
                        value={currencyFormatter.format(summary.finanzas.ingresos)}
                        colorClass="bg-green-50"
                    />
                    <StatCard 
                        title="Gastos Totales" 
                        value={currencyFormatter.format(summary.finanzas.gastos)}
                        colorClass="bg-red-50"
                    />
                </div>
            )}
        </main>
    );
}