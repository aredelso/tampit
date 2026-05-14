let d = '';
process.stdin.on('data', c => (d += c));
process.stdin.on('end', () => {
  try {
    const j = JSON.parse(d);
    const f = (j.tool_input || {}).file_path || (j.tool_response || {}).filePath;
    if (f) {
      require('child_process').execSync(`npx prettier --write "${f}" --ignore-unknown`, {
        stdio: 'pipe',
        cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
      });
    }
  } catch (_) {}
});
