/**
 * Achica una foto antes de guardarla (las del celular pesan varios MB y el navegador tiene poco espacio).
 * La recorta en cuadrado centrado, a `lado` píxeles, y la devuelve como JPEG liviano en formato data URL.
 */
export async function reducirFoto(file: File, lado = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => mal(new Error("No se pudo leer la imagen."));
      i.src = url;
    });
    const corte = Math.min(img.naturalWidth, img.naturalHeight);
    const tam = Math.min(lado, corte);
    const canvas = document.createElement("canvas");
    canvas.width = tam; canvas.height = tam;
    canvas.getContext("2d")!.drawImage(img, (img.naturalWidth - corte) / 2, (img.naturalHeight - corte) / 2, corte, corte, 0, 0, tam, tam);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
