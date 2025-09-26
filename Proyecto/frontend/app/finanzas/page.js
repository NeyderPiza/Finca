// frontend/app/finanzas/page.js
'use client';

import { useEffect, useState } from 'react';

// Un componente para el formulario, para mantener el código limpio
function FormularioTransaccion({ onTransaccionCreada }) {
  const [tipo, setTipo] = useState('gasto');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha de hoy
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

        // Limpiar formulario
        setDescripcion('');
        setMonto('');
        
        // Avisar al componente padre que se creó una nueva transacción
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
        {/* Tipo, Descripción, Monto, Fecha y Botón */}
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

// Componente principal de la página
export default function FinanzasPage() {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransacciones = async () => {
    setLoading(true);
    const response = await fetch('http://localhost:3001/api/finanzas');
    const data = await response.json();
    setTransacciones(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Control Financiero</h1>
      
      <FormularioTransaccion onTransaccionCreada={fetchTransacciones} />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Historial</h2>
        {loading ? <p>Cargando...</p> : (
          <ul>
            {transacciones.map(t => (
              <li key={t.id} className={`flex justify-between items-center p-2 border-b ${t.tipo_transaccion === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                <div>
                  <p className="font-bold">{t.descripcion}</p>
                  <p className="text-sm text-gray-500">{new Date(t.fecha).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-lg">
                  {t.tipo_transaccion === 'ingreso' ? '+' : '-'} ${t.monto}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}