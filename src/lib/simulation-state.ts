type SimulationStatus = {
  running: boolean;
  startedAt: string | null;
  updatedAt: string;
};

const globalForSimulation = globalThis as typeof globalThis & {
  __tzPoliceSimulationState?: SimulationStatus;
};

function createInitialState(): SimulationStatus {
  return {
    running: false,
    startedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export function getSimulationState(): SimulationStatus {
  if (!globalForSimulation.__tzPoliceSimulationState) {
    globalForSimulation.__tzPoliceSimulationState = createInitialState();
  }

  return globalForSimulation.__tzPoliceSimulationState;
}

export function startSimulation() {
  const state = getSimulationState();
  const nextState: SimulationStatus = {
    running: true,
    startedAt: state.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  globalForSimulation.__tzPoliceSimulationState = nextState;
  return nextState;
}

export function stopSimulation() {
  const state = getSimulationState();
  const nextState: SimulationStatus = {
    running: false,
    startedAt: state.startedAt,
    updatedAt: new Date().toISOString(),
  };

  globalForSimulation.__tzPoliceSimulationState = nextState;
  return nextState;
}