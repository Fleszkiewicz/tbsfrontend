const fs = require('fs');
const path = require('path');

function fixPadding(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /className={`\${inputCls} pl-8\s*`}/g,
    'className={`${inputCls} !pl-8`}'
  );

  content = content.replace(
    /className={`\${inputCls} pl-11\s*`}/g,
    'className={`${inputCls} !pl-11`}'
  );

  fs.writeFileSync(filePath, content);
  console.log('Fixed padding in ' + filePath);
}

fixPadding(path.join(__dirname, 'src/components/pages/CreateTrip.tsx'));
fixPadding(path.join(__dirname, 'src/components/pages/Trip.tsx'));
