let bootstrapStarted = false;

export async function bootstrap() {
  if (bootstrapStarted) return;
  if (process.env.NEXT_PUBLIC_SIMULATION !== "true") return;

  bootstrapStarted = true;
  // Simulation engine disabled in sandbox
}