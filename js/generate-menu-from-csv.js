const fs = require('fs');
const csv = require('csv-parser');

// Mapeo de "tipo_servicio" a categoría para filtrado (data-category)
const categoryMap = {
  'Sushi': 'sushi',
  'Plato Fuerte': 'platos-fuertes',
  'Entradas': 'entradas',
  'Ceviche': 'ceviches',
  'Sopa': 'sopas',
  'Hamburguesa': 'hamburguesas',
  'Tortas Ahogadas': 'tortas-tostadas',
  'Tostadas Tradicionales': 'tortas-tostadas',
  'Combo': 'combos',
  'Postre': 'postres',
  'Bebida': 'bebidas'
};

// Función para formatear precio (quita .00 si es entero)
function cleanPrice(priceStr) {
  if (!priceStr) return '$0';
  const num = parseFloat(priceStr.replace(/[$,\s]/g, ''));
  if (isNaN(num)) return '$0';
  return num % 1 === 0 ? `$${num}` : `$${num.toFixed(2)}`;
}

// Leer CSV y generar HTML
const cards = [];

fs.createReadStream('Producto Norigami - Hoja 1.csv')
  .pipe(csv({ separator: ',' }))
  .on('data', (row) => {
    // Saltar filas sin nombre o sin imagen
    if (!row.nombre_producto || !row.imagen || row.tipo_servicio === 'Extra') return;

    const category = categoryMap[row.tipo_servicio?.trim()] || 'otros';
    const price = cleanPrice(row.precio_base);
    const isVeg = row.vegetariano === 'SI';
    const imgPath = `img/${row.imagen}`; // todas en /img/

    // Etiqueta legible de categoría
    const displayCategory = {
      'sushi': 'Sushi',
      'platos-fuertes': 'Plato Fuerte',
      'entradas': 'Entrada',
      'ceviches': 'Ceviche',
      'sopas': 'Sopa',
      'hamburguesas': 'Hamburguesa',
      'tortas-tostadas': 'Torta/Tostada',
      'combos': 'Combo',
      'postres': 'Postre',
      'bebidas': 'Bebida'
    }[category] || 'Otros';

    const card = `
<article class="menu-card group relative rounded-3xl overflow-hidden bg-nori-dark scroll-reveal tilt-3d" data-category="${category}">
  <div class="relative aspect-[4/5] overflow-hidden">
    <img src="${imgPath}" alt="${row.nombre_producto}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700">
    <div class="absolute inset-0 bg-gradient-to-t from-nori-black via-transparent to-transparent opacity-80"></div>
    
    <div class="absolute top-4 right-4 price-tag px-4 py-2 rounded-full">
      <span class="font-bold text-nori-black">${price}</span>
    </div>
    
    <div class="absolute top-4 left-4 category-badge px-3 py-1 rounded-full">
      <span class="text-xs font-medium text-nori-red">${displayCategory}</span>
    </div>

    ${isVeg ? `
    <div class="absolute top-4 left-24 bg-nori-yellow/20 border border-nori-yellow/40 px-3 py-1 rounded-full">
      <span class="text-xs font-medium text-nori-yellow">Vegetariano</span>
    </div>` : ''}

    <div class="absolute inset-0 bg-nori-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
      <button class="px-6 py-3 bg-white text-nori-black rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2">
        <i data-lucide="eye" class="w-4 h-4"></i> Ver Detalles
      </button>
    </div>
  </div>
  
  <div class="p-6">
    <div class="flex items-start justify-between mb-3">
      <h3 class="font-serif text-2xl font-bold text-white group-hover:text-nori-red transition-colors">${row.nombre_producto}</h3>
      <div class="flex gap-1">
        <i data-lucide="star" class="w-4 h-4 text-nori-yellow fill-nori-yellow"></i>
        <span class="text-sm text-gray-400">4.7</span>
      </div>
    </div>
    <p class="text-gray-400 text-sm mb-4 line-clamp-2">${row.descripcion || 'Delicioso platillo preparado con ingredientes frescos.'}</p>
    
    <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
      <div class="flex -space-x-2">
        <div class="w-8 h-8 rounded-full border-2 border-nori-dark bg-nori-gray flex items-center justify-center text-xs">+1k</div>
      </div>
      <button class="w-10 h-10 rounded-full bg-nori-red/10 flex items-center justify-center text-nori-red hover:bg-nori-red hover:text-white transition-all duration-300">
        <i data-lucide="plus" class="w-5 h-5"></i>
      </button>
    </div>
  </div>
</article>
`.trim();

    cards.push(card);
  })
  .on('end', () => {
    const output = cards.join('\n\n');
    fs.writeFileSync('menu-generated.html', output);
    console.log(`✅ Generadas ${cards.length} tarjetas. Archivo: menu-generated.html`);
    
    // Opcional: generar lista de categorías únicas para los filtros
    const uniqueCategories = [...new Set(cards.map((_, i) => {
      const cat = Object.keys(categoryMap).find(k => categoryMap[k] === 
        cards[i].match(/data-category="([^"]+)"/)?.[1]
      );
      return categoryMap[cat] || 'otros';
    }))].filter(c => c !== 'otros');
    
    console.log('Categorías detectadas:', uniqueCategories);
  });