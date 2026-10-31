/**
 * Achica una foto antes de subirla (las del celular pesan varios MB).
 * La recorta en cuadrado centrado, a `lado` píxeles, y la guarda como JPEG liviano.
 */
export async function reducirFoto(file: File, lado = 600): Promise<Blob> {
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
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, (img.naturalWidth - corte) / 2, (img.naturalHeight - corte) / 2, corte, corte, 0, 0, tam, tam);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    if (!blob) throw new Error("No se pudo procesar la imagen.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
