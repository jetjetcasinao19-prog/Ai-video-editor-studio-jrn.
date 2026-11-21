// One render worker: draws frames [a, b) and encodes them to its own MP4 part.
import { parentPort, workerData } from 'node:worker_threads';
import { loadProject, makeFrameDrawer, encoder } from './engine.mjs';

const { dir, a, b, file, crf } = workerData;
const project = await loadProject(dir);
const fd = await makeFrameDrawer(project);
const enc = encoder(file, project.meta, crf);
const { width, height, fps } = project.meta;
for (let f = a; f < b; f++) {
  fd.frame(f / fps);
  await enc.write(Buffer.from(fd.ctx.getImageData(0, 0, width, height).data.buffer));
  parentPort.postMessage({ progress: f - a + 1 });
}
await enc.close();
parentPort.postMessage({ done: true });
