import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Falta la URL' }, { status: 400 });
    }

    const isML = url.includes('mercadolibre');
    const isAmazon = url.includes('amazon');

    let title = '';
    let price = 0;
    let photos: string[] = [];
    let storeName = '';

    if (isML) storeName = 'Mercado Libre';
    else if (isAmazon) storeName = 'Amazon';
    else {
      try {
        const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
        storeName = domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch {
        storeName = 'Tienda';
      }
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      // Si falla la petición pero la URL parece válida, devolvemos data vacía para llenar manual
      return NextResponse.json({
        title: '',
        price: 0,
        photos: [],
        url,
        storeName,
        manual: true
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    if (isML) {
      // Lógica MercadoLibre
      title = $('h1.ui-pdp-title').text().trim() || 
              $('meta[property="og:title"]').attr('content') || 
              'Regalo sin nombre';
      
      let priceText = $('div.ui-pdp-price__second-line span.andes-money-amount__fraction')
        .first()
        .text()
        .trim();
      price = parseInt(priceText.replace(/\D/g, ''), 10) || 0;

      const mainImg = $('meta[property="og:image"]').attr('content');
      if (mainImg) photos.push(mainImg);

      $('figure.ui-pdp-gallery__figure img.ui-pdp-image').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-zoom');
        if (src && !photos.includes(src)) photos.push(src);
      });
    } else if (isAmazon) {
      // Lógica Amazon
      title = $('#productTitle').text().trim() || 
              $('meta[property="og:title"]').attr('content') || 
              'Producto de Amazon';

      const priceWhole = $('.a-price-whole').first().text().replace(/\D/g, '');
      if (priceWhole) {
        price = parseInt(priceWhole, 10);
      } else {
        const metaPrice = $('meta[property="product:price:amount"]').attr('content');
        if (metaPrice) price = parseInt(metaPrice.replace(/\D/g, ''), 10);
      }

      const mainImg = $('#landingImage').attr('src') || 
                      $('meta[property="og:image"]').attr('content');
      if (mainImg) photos.push(mainImg);

      $('#altImages ul li img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.includes('._AC_') && !photos.includes(src)) {
            const hiRes = src.replace(/\._AC_.*_\./, '.');
            photos.push(hiRes);
        }
      });
    } else {
      // Lógica Genérica
      title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || '';
      const mainImg = $('meta[property="og:image"]').attr('content');
      if (mainImg) photos.push(mainImg);
      
      // Intentar buscar precio en metas comunes
      const metaPrice = $('meta[property="product:price:amount"]').attr('content') || 
                        $('meta[name="twitter:data1"]').attr('content');
      if (metaPrice) {
        price = parseInt(metaPrice.replace(/\D/g, ''), 10) || 0;
      }
    }

    // Truncar título si es muy largo para no dañar el diseño
    const cleanTitle = title.length > 100 ? title.substring(0, 100).trim() + '...' : title;

    return NextResponse.json({
      title: cleanTitle,
      price,
      photos: photos.filter(p => p.startsWith('http')).slice(0, 5),
      url,
      storeName,
    });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Error al intentar extraer la información del producto.' },
      { status: 500 },
    );
  }
}
