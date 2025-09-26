// Usamos 'use client' porque necesitamos interactuar con el estado del componente (useEffect, useState)
'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnimalesPage() {
  // 'animales' guardará la lista que traigamos de la API. Empieza como un array vacío.
  const [animales, setAnimales] = useState([]);
  // 'loading' nos ayudará a mostrar un mensaje mientras se cargan los datos.
  const [loading, setLoading] = useState(true);
  // 'error' guardará cualquier mensaje de error que ocurra durante la petición.
  const [error, setError] = useState(null);

  // useEffect se ejecuta después de que el componente se monta en la pantalla.
  // Es el lugar perfecto para hacer llamadas a APIs.
  useEffect(() => {
    // Definimos una función asíncrona dentro para poder usar await
    async function fetchAnimales() {
      try {
        // Hacemos la petición GET a nuestro backend. ¡Asegúrate que la URL es correcta!
        const response = await fetch('http://localhost:3001/api/animales');
        
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue exitosa');
        }

        const data = await response.json();
        setAnimales(data); // Guardamos los datos en nuestro estado
      } catch (err) {
        setError(err.message); // Si hay un error, lo guardamos
      } finally {
        setLoading(false); // La carga ha terminado (ya sea con éxito o con error)
      }
    }

    fetchAnimales(); // Llamamos a la función para que se ejecute
  }, []); // El array vacío [] significa que este efecto solo se ejecuta una vez

  // Renderizado condicional basado en el estado
  if (loading) {
    return <p className="p-8 text-center">Cargando animales...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-red-500">Error: {error}</p>;
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6"> {/* <-- NUEVO DIV */}
        <h1 className="text-3xl font-bold">Lista de Animales</h1>
        <Link 
          href="/animales/nuevo" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          + Nuevo Animal
        </Link>
      </div>

      {/* Si hay animales, los mostramos en una tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Etiqueta</th>
                        <th className="py-2 px-4 border-b text-left">Nombre</th>
                        <th className="py-2 px-4 border-b text-left">Especie</th>
                        <th className="py-2 px-4 border-b text-left">Estado</th>
                    </tr>
                    </thead>
                    <tbody>
                    {animales.map((animal) => (
                        <tr key={animal.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{animal.numero_etiqueta}</td>
                        <td className="py-2 px-4 border-b">{animal.nombre || 'N/A'}</td>
                        <td className="py-2 px-4 border-b">{animal.especie.nombre}</td>
                        <td className="py-2 px-4 border-b">{animal.estado}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
        </div>
      )
    </main>
  );
}