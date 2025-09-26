'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Componente de Formulario para agregar una vacuna ---
function FormularioVacunacion({ animalId, onVacunaAgregada }) {
    const [vacunas, setVacunas] = useState([]);
    const [vacunaId, setVacunaId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchVacunas() {
            try {
                const res = await fetch('http://localhost:3001/api/vacunas');
                const data = await res.json();
                setVacunas(data);
                if (data.length > 0) setVacunaId(data[0].id);
            } catch (err) {
                console.error("No se pudieron cargar las vacunas:", err);
            }
        }
        fetchVacunas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!vacunaId) {
            setError('Por favor, selecciona una vacuna.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/animales/${animalId}/vacunas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vacuna_id: vacunaId, fecha_aplicacion: fecha })
            });
            if (!response.ok) throw new Error('No se pudo agregar el registro.');
            onVacunaAgregada();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 pt-4 border-t">
            <h3 className="font-bold text-lg mb-2">Agregar Vacunación</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="flex items-end gap-4 flex-wrap">
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700">Vacuna</label>
                    <select value={vacunaId} onChange={e => setVacunaId(e.target.value)} className="mt-1 p-2 border rounded w-full">
                        {vacunas.length === 0 && <option>Cargando vacunas...</option>}
                        {vacunas.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Aplicación</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="mt-1 p-2 border rounded" />
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Agregar</button>
            </div>
        </form>
    );
}


// --- Componente Principal de la Página de Detalles del Animal ---
export default function DetalleAnimalPage() {
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    // Función para obtener los datos actualizados del animal
    const fetchAnimal = async () => {
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

    // Función para eliminar el animal completo
    const handleDeleteAnimal = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este animal? Esta acción es irreversible.')) {
            await fetch(`http://localhost:3001/api/animales/${id}`, { method: 'DELETE' });
            router.push('/animales');
        }
    };

    // **NUEVA FUNCIÓN: Para eliminar un registro de vacunación específico**
    const handleDeleteVacuna = async (registroId) => {
        if (window.confirm('¿Seguro que quieres eliminar este registro de vacuna?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/animales/vacunas/${registroId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('No se pudo eliminar el registro.');
                // En lugar de redirigir, volvemos a cargar los datos del animal para ver la lista actualizada
                fetchAnimal(); 
            } catch (err) {
                alert(err.message);
            }
        }
    };
    
    if (loading) return <p className="p-8 text-center">Cargando detalles del animal...</p>;
    if (error) return <p className="p-8 text-center text-red-500">Error: {error}</p>;
    if (!animal) return null;

    return (
        <main className="p-8">
            {/* Encabezado con título y botones de acción principales */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{animal.nombre || `Animal #${animal.numero_etiqueta}`}</h1>
                <div>
                    <Link href={`/animales/editar/${animal.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Editar</Link>
                    <button onClick={handleDeleteAnimal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">Eliminar Animal</button>
                </div>
            </div>

            {/* Tarjeta de Información General */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">Información General</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Número de Etiqueta:</strong> {animal.numero_etiqueta}</p>
                    <p><strong>Especie:</strong> {animal.especie.nombre}</p>
                    <p><strong>Estado:</strong> <span className="capitalize">{animal.estado}</span></p>
                    <p><strong>Fecha de Nacimiento:</strong> {animal.fecha_nacimiento ? new Date(animal.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            {/* Tarjeta de Historial de Vacunación */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Historial de Vacunación</h2>
                {animal.vacunaciones.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {animal.vacunaciones.map(v => (
                            <li key={v.id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2">
                                <div>
                                    <span className="font-semibold">{v.vacuna.nombre}</span>
                                    <span className="text-gray-500 ml-4">{new Date(v.fecha_aplicacion).toLocaleDateString()}</span>
                                </div>
                                {/* **NUEVO BOTÓN: Para eliminar el registro de vacuna** */}
                                <button 
                                    onClick={() => handleDeleteVacuna(v.id)} 
                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                    title="Eliminar este registro"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No hay registros de vacunación.</p>
                )}
                {/* El formulario para agregar nuevas vacunas */}
                <FormularioVacunacion animalId={id} onVacunaAgregada={fetchAnimal} />
            </div>
        </main>
    );
}