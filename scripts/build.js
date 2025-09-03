const { execSync } = require('child_process');

console.log('🔧 Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log('🏗️ Building Next.js application...');
execSync('npx next build --turbopack', { stdio: 'inherit' });

console.log('✅ Build completed successfully!');
