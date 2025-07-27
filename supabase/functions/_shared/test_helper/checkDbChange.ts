export function checkDbChange() {
  if (!Deno.args.includes("--allow_db_change_for_test")) {
    console.error(`
🚨 Test aborted:
You must pass '--allow_db_change_for_test' after '--' to run destructive database tests.

Example:
deno test --allow-all path/to/test.ts -- --allow_db_change_for_test
`);
    Deno.exit(1);
  }
}
