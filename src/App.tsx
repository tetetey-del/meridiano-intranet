import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Avisos from "./pages/Avisos";
import AvisoDetalle from "./pages/AvisoDetalle";
import Documentos from "./pages/Documentos";
import Carpeta from "./pages/Carpeta";
import Documento from "./pages/Documento";
import Directorio from "./pages/Directorio";
import Calendario from "./pages/Calendario";
import Buscar from "./pages/Buscar";
import Mas from "./pages/Mas";
import Gestion from "./pages/gestion/Gestion";
import NuevoAviso from "./pages/gestion/NuevoAviso";
import NuevoEvento from "./pages/gestion/NuevoEvento";
import Usuarios from "./pages/gestion/Usuarios";
import Carpetas from "./pages/gestion/Carpetas";
import Lecturas from "./pages/gestion/Lecturas";
import Resumen from "./pages/gestion/Resumen";

function Solo({ nivel, children }: { nivel: "gestor" | "admin"; children: ReactNode }) {
  const { esGestor, esAdmin } = useAuth();
  const ok = nivel === "admin" ? esAdmin : esGestor;
  return ok ? <>{children}</> : <Navigate to="/" replace />;
}

function Rutas() {
  const { profile } = useAuth();
  if (!profile) return <Login />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="avisos" element={<Avisos />} />
        <Route path="avisos/:id" element={<AvisoDetalle />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="documentos/:id" element={<Carpeta />} />
        <Route path="documentos/doc/:id" element={<Documento />} />
        <Route path="directorio" element={<Directorio />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="buscar" element={<Buscar />} />
        <Route path="mas" element={<Mas />} />
        <Route path="gestion" element={<Solo nivel="gestor"><Gestion /></Solo>} />
        <Route path="gestion/aviso" element={<Solo nivel="gestor"><NuevoAviso /></Solo>} />
        <Route path="gestion/evento" element={<Solo nivel="gestor"><NuevoEvento /></Solo>} />
        <Route path="gestion/resumen" element={<Solo nivel="gestor"><Resumen /></Solo>} />
        <Route path="gestion/usuarios" element={<Solo nivel="admin"><Usuarios /></Solo>} />
        <Route path="gestion/carpetas" element={<Solo nivel="admin"><Carpetas /></Solo>} />
        <Route path="gestion/lecturas" element={<Solo nivel="admin"><Lecturas /></Solo>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><Rutas /></BrowserRouter></AuthProvider>;
}
