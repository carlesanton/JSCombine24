export function log_memory() {
  // ---- CPU / JS MEMORY ----
  if (performance && performance.memory) {
    const {
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit
    } = performance.memory;

    console.log('CPU / JS Memory:');
    console.log(`  Used:  ${(usedJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log(`  Total: ${(totalJSHeapSize / 1048576).toFixed(2)} MB`);
    console.log(`  Limit: ${(jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
  } else {
    console.log('CPU / JS Memory: Not available in this browser');
  }

  // ---- GPU INFO (NOT MEMORY) ----
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl');

  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    if (debugInfo) {
      console.log('GPU Info:');
      console.log(
        '  Vendor:',
        gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      );
      console.log(
        '  Renderer:',
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      );
    } else {
      console.log('GPU Info: Available, but renderer details are hidden');
    }
  } else {
    console.log('GPU Info: WebGL not available');
  }
}
