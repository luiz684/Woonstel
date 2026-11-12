export async function reduzirImagem(file: File, maxLado = 1600, qualidade = 0.8): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * escala);
    const h = Math.round(bitmap.height * escala);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', qualidade));
    if (!blob) return file;
    const nome = (file.name.replace(/\.[^.]+$/, '') || 'foto') + '.jpg';
    return new File([blob], nome, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}