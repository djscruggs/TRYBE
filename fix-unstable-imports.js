const fs = require('fs');
const path = require('path');

// Find all TypeScript files that import unstable_ functions
function findFiles(dir, pattern) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (file.match(/\.(ts|tsx)$/)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(pattern)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Fix the imports and usage
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Comment out the import
  content = content.replace(/import\s*{\s*unstable_parseMultipartFormData\s*}\s*from\s*'react-router';/, 
    "// import { unstable_parseMultipartFormData } from 'react-router'; // Not available in React Router v7");
  
  // Comment out the usage
  content = content.replace(/const rawData = await unstable_parseMultipartFormData\(request, uploadHandler\)/, 
    "// const rawData = await unstable_parseMultipartFormData(request, uploadHandler) // Not available in React Router v7");
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

// Find and fix all files
const files = findFiles('./app', "unstable_parseMultipartFormData");
console.log(`Found ${files.length} files to fix`);

files.forEach(fixFile);
console.log('Done!');
