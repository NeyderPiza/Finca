'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Componente para el formulario de vacunación
function FormularioVacunacion({ animalId, onVacunaAgregada }) {
    const [vacunas, setVacunas] = useState([]); // Catálogo de vacunas
    const [vacunaId, setVacunaId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    // Cargar el catálogo de vacunas cuando el componente se monta
    useEffect(() => {
        async function fetchVacunas() {
            const res = await fetch('http://localhost:3001/api/vacunas');
            const data = await res.json();
            setVacunas(data);
            if (data.length > 0) setVacunaId(data[0].id); // Seleccionar la primera por defecto
        }
        fetchVacunas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/api/animales/${animalId}/vacunas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vacuna_id: vacunaId, fecha_aplicacion: fecha })
            });
            if (!response.ok) throw new Error('No se pudo agregar el registro.');
            onVacunaAgregada(); // Notificar al componente padre para que se actualice
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-bold mb-2">Agregar Vacunación</h3>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex items-end gap-4">
                <div className="flex-grow">
                    <label className="block text-sm">Vacuna</label>
                    <select value={vacunaId} onChange={e => setVacunaId(e.target.value)} className="p-2 border rounded w-full">
                        {vacunas.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm">Fecha de Aplicación</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="p-2 border rounded" />
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Agregar</button>
            </div>
        </form>
    );
}

// Componente principal de la página de detalles
export default function DetalleAnimalPage() {
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const fetchAnimal = async () => {
        // No mostramos "cargando" en las recargas para una mejor UX
        // setLoading(true); 
        try {
            const response = await fetch(`http://localhost:3001/api/animales/${id}`);
            if (!response.ok) throw new Error('Animal no encontrado');
            const data = await response.json();
            setAnimal(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAnimal();
    }, [id]);

    // Lógica de eliminación (ya la teníamos)
    const handleDelete = async () => {
        if (window.confirm('¿Seguro que quieres eliminar este animal?')) {
            await fetch(`http://localhost:3001/api/animales/${id}`, { method: 'DELETE' });
            router.push('/animales');
        }
    };
    
    if (loading) return <p className="p-8 text-center">Cargando detalles del animal...</p>;
    if (error) return <p className="p-8 text-center text-red-500">Error: {error}</p>;
    if (!animal) return null;

    return (
        <div className="p-8">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{animal.nombre || `Animal #${animal.numero_etiqueta}`}</h1>
                <div>
                    <Link href={`/animales/editar/${animal.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Editar</Link>
                    <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">Eliminar</button>
                </div>
            </div>

            {/* Detalles Principales */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Número de Etiqueta:</strong> {animal.numero_etiqueta}</p>
                    <p><strong>Especie:</strong> {animal.especie.nombre}</p>
                    <p><strong>Estado:</strong> <span className="capitalize">{animal.estado}</span></p>
                    <p><strong>Fecha de Nacimiento:</strong> {animal.fecha_nacimiento ? new Date(animal.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            {/* Sección de Vacunación */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Historial de Vacunación</h2>
                {animal.vacunaciones.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {animal.vacunaciones.map(v => (
                            <li key={v.id} className="py-2 flex justify-between">
                                <span>{v.vacuna.nombre}</span>
                                <span>{new Date(v.fecha_aplicacion).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay registros de vacunación.</p>
                )}
                {/* Aquí integramos el formulario */}
                <FormularioVacunacion animalId={id} onVacunaAgregada={fetchAnimal} />
            </div>
        </div>
    );
}