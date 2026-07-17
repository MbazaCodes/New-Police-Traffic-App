
import { CONFIG } from "../config";
import { startSimulation } from "../../src/lib/simulation-state";

export async function start() {
    if (!CONFIG.simulation) {
        console.log("Simulation disabled");
        return;
    }

    startSimulation();
    console.log("Simulation Started");
}

