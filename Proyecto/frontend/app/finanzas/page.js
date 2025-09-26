// frontend/app/finanzas/page.js
'use client';

import { useEffect, useState } from 'react';

// --- Componente de Formulario (sin cambios) ---
function FormularioTransaccion({ onTransaccionCreada }) {
  const [tipo, setTipo] = useState('gasto');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!descripcion || !monto) {
        setError('Descripción y monto son requeridos.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/api/finanzas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo_transaccion: tipo,
                descripcion,
                monto: parseFloat(monto),
                fecha
            })
        });
        if (!response.ok) throw new Error('No se pudo crear la transacción.');

        setDescripcion('');
        setMonto('');
        onTransaccionCreada();
    } catch (err) {
        setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Nueva Transacción</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select value={tipo} onChange={e => setTipo(e.target.value)} className="p-2 border rounded">
          <option value="gasto">Gasto</option>
          <option value="ingreso">Ingreso</option>
        </select>
        <input type="text" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="p-2 border rounded" />
        <input type="number" placeholder="Monto" value={monto} onChange={e => setMonto(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="p-2 border rounded" />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Añadir Transacción
      </button>
    </form>
  );
}


// --- Componente Principal de la Página (con la lógica de borrado incluida) ---
export default function FinanzasPage() {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener los datos de la API
  const fetchTransacciones = async () => {
    setLoading(true);
    try {
        const response = await fetch('http://localhost:3001/api/finanzas');
        const data = await response.json();
        setTransacciones(data);
    } catch (error) {
        console.error("Error al cargar las transacciones:", error);
    } finally {
        setLoading(false);
    }
  };

  // Cargar los datos cuando el componente se monta
  useEffect(() => {
    fetchTransacciones();
  }, []);
  
  // Función para manejar la eliminación de una transacción
  const handleDelete = async (id) => {
    // Pedir confirmación al usuario antes de borrar
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        try {
            const response = await fetch(`http://localhost:3001/api/finanzas/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('No se pudo eliminar la transacción.');
            }
            // Si se elimina con éxito, refrescar la lista de transacciones
            fetchTransacciones();
        } catch (err) {
            // Mostrar un mensaje de alerta si hay un error
            alert(err.message);
        }
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Control Financiero</h1>
      
      {/* El formulario para crear nuevas transacciones */}
      <FormularioTransaccion onTransaccionCreada={fetchTransacciones} />

      {/* La sección que muestra el historial de transacciones */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Historial</h2>
        {loading ? (
            <p>Cargando...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transacciones.map(t => (
              <li key={t.id} className="flex justify-between items-center py-3 px-2 hover:bg-gray-50">
                {/* Información de la transacción */}
                <div className={`flex-grow ${t.tipo_transaccion === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                  <p className="font-bold">{t.descripcion}</p>
                  <p className="text-sm text-gray-500">{new Date(t.fecha).toLocaleDateString()}</p>
                </div>

                {/* Monto */}
                <span className="font-bold text-lg w-32 text-right">
                  {t.tipo_transaccion === 'ingreso' ? '+' : '-'} ${t.monto}
                </span>

                {/* Botones de Acción */}
                <div className="ml-4 flex items-center gap-4">
                    {/* El botón de editar está preparado para cuando se cree la página de edición */}
                    {/* <Link href={`/finanzas/editar/${t.id}`} className="text-yellow-600 hover:text-yellow-800 font-semibold">Editar</Link> */}
                    <button 
                        onClick={() => handleDelete(t.id)} 
                        className="text-red-600 hover:text-red-800 font-semibold"
                        title="Eliminar esta transacción"
                    >
                        Eliminar
                    </button>
                </div>
              </li>
            ))}
          </ul>
        )}
         {transacciones.length === 0 && !loading && <p>No hay transacciones registradas.</p>}
      </div>
    </main>
  );
}