export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initialize } = await import("./instrumentation-node");
    initialize();
  }
}
