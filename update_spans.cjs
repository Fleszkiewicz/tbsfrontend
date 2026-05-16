const fs = require('fs');
const path = require('path');

function updateColSpans(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const map = {
    // Travel Info
    "Creación de reserva": "flex flex-col col-span-1 md:col-span-2",
    "Fecha de inicio": "flex flex-col col-span-1 md:col-span-2",
    "Fecha de fin": "flex flex-col col-span-1 md:col-span-2",
    "Tipo de destino": "flex flex-col col-span-1 md:col-span-2",
    "Sucursal": "flex flex-col col-span-1 md:col-span-2",
    "Pago": "flex flex-col col-span-1 md:col-span-2",
    "Tipo de moneda": "flex flex-col col-span-1 md:col-span-3",
    "Valor total": "flex flex-col col-span-1 md:col-span-3",
    "Cotización": "flex flex-col col-span-1 md:col-span-3",
    "Valor total USD": "flex flex-col col-span-1 md:col-span-3",
    
    // Passengers
    "Nombre": "flex flex-col col-span-1 md:col-span-2",
    "Apellido": "flex flex-col col-span-1 md:col-span-2",
    "Edad": "flex flex-col col-span-1 md:col-span-2",
    "Tipo de pasajero": "flex flex-col col-span-1 md:col-span-2",
    "DNI": "flex flex-col col-span-1 md:col-span-3",
    "Vencimiento DNI": "flex flex-col col-span-1 md:col-span-3",
    "Pasaporte": "flex flex-col col-span-1 md:col-span-3",
    "Vencimiento Pasaporte": "flex flex-col col-span-1 md:col-span-3",
    "Email": "flex flex-col col-span-1 md:col-span-3",
    "Contacto": "flex flex-col col-span-1 md:col-span-3",
  };

  for (const [label, replacement] of Object.entries(map)) {
    // Look for <div className="flex flex-col"> followed by optional whitespace and <label ...>Label Text
    // This regex is more permissive with newlines and spaces.
    const regex = new RegExp(`(<div className="flex flex-col")([\\s\\S]{0,100}?<label[^>]*>\\s*${label})`, 'g');
    content = content.replace(regex, `<div className="${replacement}"$2`);
  }

  // Handle the empty div
  content = content.replace(/<div className="flex flex-col"><\/div>/g, '<div className="flex flex-col md:hidden"></div>');

  fs.writeFileSync(filePath, content);
  console.log('Updated spans in ' + filePath);
}

updateColSpans(path.join(__dirname, 'src/components/pages/CreateTrip.tsx'));
updateColSpans(path.join(__dirname, 'src/components/pages/Trip.tsx'));
