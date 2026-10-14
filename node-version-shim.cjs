// Node.js version compatibility shim for Angular CLI 22 on Node v24.13.x
if (process.versions && process.versions.node && process.versions.node.startsWith('24.13.')) {
  Object.defineProperty(process.versions, 'node', { value: '24.15.0' });
}
