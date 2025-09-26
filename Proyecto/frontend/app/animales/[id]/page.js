'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Importa también useRouter
import Link from 'next/link';

export default function DetalleAnimalPage() {
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter(); // Necesitamos el router para la función de eliminar
  const { id } = params;

  useEffect(() => {
    if (id) {
      async function fetchAnimal() {
        try {
          const response = await fetch(`http://localhost:3001/api/animales/${id}`);
          if (!response.ok) {
            throw new Error('Animal no encontrado');
          }
          const data = await response.json();
          setAnimal(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchAnimal();
    }
  }, [id]);

  // Función para manejar la eliminación (la añadimos aquí para que esté completa)
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este animal?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/animales/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar');
        router.push('/animales');
      } catch (err) {
        setError(err.message);
      }
    }
  };


  if (loading) return <p className="p-8 text-center">Cargando detalles del animal...</p>;
  if (error) return <p className="p-8 text-center text-red-500">Error: {error}</p>;
  if (!animal) return <p className="p-8 text-center">No se encontró el animal.</p>;


  // --- SECCIÓN CORREGIDA ---
  return (
    <div className="p-8">
      {/* 1. Encabezado con el título y los botones */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{animal.nombre || `Animal #${animal.numero_etaqueta}`}</h1>
        <div>
          <Link
            href={`/animales/editar/${animal.id}`}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* 2. Cuerpo con los detalles del animal (Esta es la parte que te faltaba) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><strong>Número de Etiqueta:</strong> {animal.numero_etiqueta}</p>
          <p><strong>Especie:</strong> {animal.especie.nombre}</p>
          <p><strong>Estado:</strong> <span className="capitalize">{animal.estado}</span></p>
          <p><strong>Fecha de Nacimiento:</strong> {animal.fecha_nacimiento ? new Date(animal.fecha_nacimiento).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Fecha de Compra:</strong> {animal.fecha_compra ? new Date(animal.fecha_compra).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Precio de Compra:</strong> {animal.precio_compra ? `$${animal.precio_compra}`: 'N/A'}</p>
        </div>
        <div className="mt-8 border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Historial de Vacunación</h2>
          {animal.vacunaciones.length > 0 ? (
            <ul>
              {animal.vacunaciones.map(v => <li key={v.id}>- {new Date(v.fecha_aplicacion).toLocaleDateString()}</li>)}
            </ul>
          ) : (
            <p>No hay registros de vacunación.</p>
          )}
        </div>
        <div className="mt-6">
          <Link href="/animales" className="text-blue-500 hover:underline">
            &larr; Volver a la lista
          </Link>
        </div>
      </div>
    </div>
  );
}