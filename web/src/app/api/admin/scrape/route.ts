import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes('mercadolibre')) {
      return NextResponse.json(
        { error: 'URL inválida. Debe ser de MercadoLibre.' },
        { status: 400 },
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Intentar extraer el título
    let title = $('h1.ui-pdp-title').text().trim();
    if (!title) {
      title =
        $('meta[property="og:title"]').attr('content') || 'Regalo sin nombre';
    }

    // Intentar extraer el precio
    let priceText = $(
      'div.ui-pdp-price__second-line span.andes-money-amount__fraction',
    )
      .first()
      .text()
      .trim();
    let price = parseInt(priceText.replace(/\D/g, ''), 10) || 0;

    // Intentar extraer fotos
    const photos: string[] = [];
    const mainImg = $('meta[property="og:image"]').attr('content');
    if (mainImg) photos.push(mainImg);

    // Buscar más fotos en la galería (MercadoLibre a veces usa estas clases)
    $('figure.ui-pdp-gallery__figure img.ui-pdp-image').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-zoom');
      if (src && !photos.includes(src)) {
        photos.push(src);
      }
    });

    return NextResponse.json({
      title,
      price,
      photos: photos.slice(0, 3), // Devolver máximo 3 fotos
      url,
    });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Error al leer MercadoLibre' },
      { status: 500 },
    );
  }
}
