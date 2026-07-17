import { start } from "../Simulation/engine/engine";

let bootstrapStarted = false;

export async function bootstrap() {
  if (bootstrapStarted) return;
  if (process.env.NEXT_PUBLIC_SIMULATION !== "true") return;

  bootstrapStarted = true;
  await start();
}