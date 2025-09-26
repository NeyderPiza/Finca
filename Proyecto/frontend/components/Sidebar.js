import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-semibold mb-6">FincaPiza</h2>
      <nav>
        <ul>
          <li className="mb-4">
            <Link href="/" className="hover:text-yellow-400">
              Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link href="/animales" className="hover:text-yellow-400">
              Gestión de Animales
            </Link>
          </li>
          <li className="mb-4"> {/* <-- LÍNEA NUEVA */}
            <Link href="/finanzas" className="hover:text-yellow-400">
              Control Financiero
            </Link>
          </li>
          <li className="mb-4"> 
            <Link href="/produccion" className="hover:text-yellow-400">
              Producción Lechera
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}