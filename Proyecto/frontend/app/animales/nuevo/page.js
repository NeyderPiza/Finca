'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importamos useRouter para redirigir

export default function NuevoAnimalPage() {
  const [numero_etiqueta, setNumeroEtiqueta] = useState('');
  const [nombre, setNombre] = useState('');
  const [especie_id, setEspecieId] = useState('');
  const [fecha_nacimiento, setFechaNacimiento] = useState('');
  const [especies, setEspecies] = useState([]); // Para el dropdown de especies
  const [error, setError] = useState(null);
  const router = useRouter(); // Inicializamos el router

  // Cargar las especies para el menú desplegable
  useEffect(() => {
    async function fetchEspecies() {
      try {
        const res = await fetch('http://localhost:3001/api/especies');
        const data = await res.json();
        setEspecies(data);
        if (data.length > 0) {
          setEspecieId(data[0].id); // Seleccionar la primera especie por defecto
        }
      } catch (err) {
        console.error("Error al cargar especies:", err);
      }
    }
    fetchEspecies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue
    setError(null);

    const nuevoAnimal = {
      numero_etiqueta,
      nombre,
      especie_id: parseInt(especie_id),
      fecha_nacimiento: fecha_nacimiento || null,
    };

    try {
      const response = await fetch('http://localhost:3001/api/animales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoAnimal),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Algo salió mal');
      }

      // Si todo sale bien, redirigimos al usuario a la lista de animales
      router.push('/animales');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Registrar Nuevo Animal</h1>
      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow-md">
        
        {/* Campo Número de Etiqueta */}
        <div className="mb-4">
          <label htmlFor="numero_etiqueta" className="block text-gray-700 font-bold mb-2">
            Número de Etiqueta *
          </label>
          <input
            type="text"
            id="numero_etiqueta"
            value={numero_etiqueta}
            onChange={(e) => setNumeroEtiqueta(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Campo Nombre */}
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 font-bold mb-2">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        {/* Campo Especie */}
        <div className="mb-4">
          <label htmlFor="especie" className="block text-gray-700 font-bold mb-2">
            Especie *
          </label>
          <select
            id="especie"
            value={especie_id}
            onChange={(e) => setEspecieId(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {especies.map((especie) => (
              <option key={especie.id} value={especie.id}>
                {especie.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Campo Fecha de Nacimiento */}
        <div className="mb-6">
          <label htmlFor="fecha_nacimiento" className="block text-gray-700 font-bold mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="fecha_nacimiento"
            value={fecha_nacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Guardar Animal
          </button>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}