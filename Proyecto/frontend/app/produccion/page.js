// frontend/app/produccion/page.js
'use client';

import { useEffect, useState } from 'react';

// Componente de Formulario para un nuevo registro
function FormularioProduccion({ onRegistroCreado }) {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [litros, setLitros] = useState('');
    const [precio, setPrecio] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!litros || !precio) {
            setError('Los litros y el precio son obligatorios.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/produccion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha,
                    litros_producidos: litros,
                    precio_litro: precio,
                }),
            });
            if (!response.ok) throw new Error('No se pudo guardar el registro.');

            // Limpiar formulario y notificar al padre
            setLitros('');
            setPrecio('');
            onRegistroCreado();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Nuevo Registro de Producción</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold">Fecha</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="p-2 border rounded" />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold">Litros Producidos</label>
                    <input type="number" step="0.01" placeholder="Ej: 150.5" value={litros} onChange={e => setLitros(e.target.value)} className="p-2 border rounded" />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 font-semibold">Precio por Litro</label>
                    <input type="number" step="0.01" placeholder="Ej: 2000" value={precio} onChange={e => setPrecio(e.target.value)} className="p-2 border rounded" />
                </div>
            </div>
            <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Guardar Registro
            </button>
        </form>
    );
}


// Componente principal de la página
export default function ProduccionPage() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const currencyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const fetchRegistros = async () => {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/produccion');
        const data = await response.json();
        setRegistros(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRegistros();
    }, []);

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-6">Producción Lechera</h1>
            
            <FormularioProduccion onRegistroCreado={fetchRegistros} />

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Historial de Producción</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 text-left">Fecha</th>
                                <th className="py-2 px-4 text-left">Litros</th>
                                <th className="py-2 px-4 text-left">Precio/Litro</th>
                                <th className="py-2 px-4 text-left">Ingreso Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center p-4">Cargando...</td></tr>
                            ) : (
                                registros.map(r => (
                                    <tr key={r.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4">{new Date(r.fecha).toLocaleDateString()}</td>
                                        <td className="py-2 px-4">{r.litros_producidos} L</td>
                                        <td className="py-2 px-4">{currencyFormatter.format(r.precio_litro)}</td>
                                        <td className="py-2 px-4 font-bold text-green-600">{currencyFormatter.format(r.ingreso_total)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}