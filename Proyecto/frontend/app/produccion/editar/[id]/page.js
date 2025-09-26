// frontend/app/produccion/editar/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditarProduccionPage() {
    const [fecha, setFecha] = useState('');
    const [litros, setLitros] = useState('');
    const [precio, setPrecio] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    // Cargar los datos del registro actual
    useEffect(() => {
        if (id) {
            async function fetchRegistro() {
                try {
                    const res = await fetch(`http://localhost:3001/api/produccion/${id}`);
                    if (!res.ok) throw new Error('Registro no encontrado');
                    const data = await res.json();
                    
                    const formattedDate = new Date(data.fecha).toISOString().split('T')[0];
                    setFecha(formattedDate);
                    setLitros(data.litros_producidos);
                    setPrecio(data.precio_litro);
                } catch (err) {
                    setError('No se pudo cargar la información del registro.');
                }
            }
            fetchRegistro();
        }
    }, [id]);

    // Enviar los datos actualizados
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`http://localhost:3001/api/produccion/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha,
                    litros_producidos: litros,
                    precio_litro: precio,
                }),
            });

            if (!response.ok) throw new Error('Algo salió mal al actualizar');
            
            router.push('/produccion');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Editar Registro de Producción</h1>
            <form onSubmit={handleSubmit} className="max-w-lg bg-white p-8 rounded-lg shadow-md">
                
                <div className="mb-4">
                    <label htmlFor="fecha" className="block text-gray-700 font-bold mb-2">Fecha</label>
                    <input type="date" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} className="shadow border rounded w-full py-2 px-3" required />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="litros" className="block text-gray-700 font-bold mb-2">Litros Producidos</label>
                    <input type="number" id="litros" step="0.01" value={litros} onChange={(e) => setLitros(e.target.value)} className="shadow border rounded w-full py-2 px-3" required />
                </div>

                <div className="mb-6">
                    <label htmlFor="precio" className="block text-gray-700 font-bold mb-2">Precio por Litro</label>
                    <input type="number" id="precio" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} className="shadow border rounded w-full py-2 px-3" required />
                </div>

                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                
                <div className="flex items-center gap-4">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Guardar Cambios
                    </button>
                    <button type="button" onClick={() => router.back()} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}