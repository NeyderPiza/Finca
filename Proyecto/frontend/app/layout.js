import './globals.css';
import Sidebar from '@/components/Sidebar'; // Importamos nuestro nuevo componente

export const metadata = {
  title: 'FincaPiza App',
  description: 'Gestión ganadera y equina',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="flex h-screen bg-gray-100">
          <Sidebar /> {/* Añadimos la barra lateral aquí */}
          
          {/* El 'children' representa el contenido de cada página */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}