import { spawn } from 'child_process';

const python = spawn('python3', ['-c', 'import cv2; print(cv2.__version__)']);

python.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

python.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

python.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
