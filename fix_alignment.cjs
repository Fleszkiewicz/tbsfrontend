const fs = require('fs');
const path = require('path');

function fixPlaceholderAlignment(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix all ARS / Cotizacion spans (the ones with "$")
  content = content.replace(
    /className="absolute left-4 top-1\/2 -translate-y-1\/2 text-\[14px\] font-semibold text-gray-400 [^"]*">\s*\$\s*<\/span>/g,
    'className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400">\n                        $\n                      </span>'
  );

  // Fix the inputs for ARS / Cotizacion
  content = content.replace(
    /className={`\${inputCls} pl-7\s*`}/g,
    'className={`${inputCls} pl-8`}'
  );

  // Fix US$ span
  content = content.replace(
    /className="absolute left-4 top-1\/2 -translate-y-1\/2 text-\[14px\] font-semibold text-gray-400 [^"]*">\s*US\$\s*<\/span>/g,
    'className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400">\n                        US$\n                      </span>'
  );

  // Fix the inputs for US$ (already pl-10, we can increase to pl-11 to be safe)
  content = content.replace(
    /className={`\${inputCls} pl-10\s*`}/g,
    'className={`${inputCls} pl-11`}'
  );

  fs.writeFileSync(filePath, content);
  console.log('Fixed alignment in ' + filePath);
}

fixPlaceholderAlignment(path.join(__dirname, 'src/components/pages/CreateTrip.tsx'));
fixPlaceholderAlignment(path.join(__dirname, 'src/components/pages/Trip.tsx'));
