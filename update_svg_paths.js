const fs = require('fs');
const path = require('path');

const menuPages = [
  'desserts.html',
  'sides.html',
  'pasta.html',
  'main-course.html',
  'chinese.html',
  'cold-beverages.html',
  'hot-beverages.html',
  'indian.html'
];

menuPages.forEach(page => {
  const filePath = path.join(__dirname, 'pages', page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update SVG paths to include leading ./
  content = content.replace(
    /data-src="assets\/menu\//g,
    'data-src="./assets/menu/'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated SVG paths in ${page}`);
});