import { spawn } from 'child_process';

// Inicia o processo do Vercel Dev integrando o backend serverless e frontend
const child = spawn('npx', ['vercel', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
