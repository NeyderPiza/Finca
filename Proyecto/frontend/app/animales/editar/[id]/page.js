'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// NOTA: Podrías crear un componente reutilizable <AnimalForm /> para no repetir código.
// Por ahora, lo mantenemos separado por simplicidad.

export default function EditarAnimalPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    numero_etiqueta: '',
    estado: 'activo',
  });
  const [error, setError] = useState(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // 1. Cargar los datos actuales del animal
  useEffect(() => {
    if (id) {
      async function fetchAnimal() {
        try {
          const res = await fetch(`http://localhost:3001/api/animales/${id}`);
          const data = await res.json();
          setFormData({
            nombre: data.nombre || '',
            numero_etiqueta: data.numero_etiqueta,
            estado: data.estado,
          });
        } catch (err) {
          setError('No se pudo cargar la información del animal.');
        }
      }
      fetchAnimal();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Enviar los datos actualizados
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/animales/${id}`, {
        method: 'PUT', // Usamos el método PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Algo salió mal');
      }

      router.push(`/animales/${id}`); // Redirigir a la página de detalles
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Editar Animal</h1>
      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow-md">
        {/* Aquí van los campos del formulario, muy similar al de 'nuevo' */}
        {/* Campo Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 font-bold mb-2">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>
        {/* Campo Estado */}
        <div className="mb-4">
          <label htmlFor="estado" className="block text-gray-700 font-bold mb-2">Estado</label>
          <select 
            id="estado"
            name="estado"
            value={formData.estado} 
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3"
          >
            <option value="activo">Activo</option>
            <option value="vendido">Vendido</option>
            <option value="fallecido">Fallecido</option>
          </select>
        </div>
        {/* Puedes añadir más campos para editar... */}

        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}