import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { marca } from "./marca";
// Tipografías incluidas en el proyecto (sin cargar nada de servicios externos)
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/source-serif-4/600.css";
import "@fontsource/source-serif-4/700.css";
import "./estilos.css";
import "./estilos-extra.css";

// Aplica los colores de marca desde src/marca.ts
const r = document.documentElement.style;
r.setProperty("--principal", marca.colores.principal);
r.setProperty("--profundo", marca.colores.profundo);
r.setProperty("--principal-suave", marca.colores.principalSuave);
r.setProperty("--acento", marca.colores.acento);
r.setProperty("--acento-suave", marca.colores.acentoSuave);

ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
