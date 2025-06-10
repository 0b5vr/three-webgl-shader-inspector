export function replaceShaderChunks(code: string, shaderChunk: Record<string, string>) {
  return code.replaceAll(
    /^(\s*)#include <([a-zA-Z0-9_]+)>/gm,
    (_: string, indent: string, name: string) => {
      let chunk = shaderChunk[name];
      chunk = chunk.split('\n').map((line) => indent + '\t' + line).join('\n');

      return `${indent}// #include <${name}>
${chunk}
${indent}`;
    }
  );
}
