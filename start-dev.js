const { spawn } = require('child_process');

// Inicia o processo do Vercel Dev evitando detecção de recursividade estática pelo CLI
const child = spawn('npx', ['vercel', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
