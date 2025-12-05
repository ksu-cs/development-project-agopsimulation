export default class SimManager {
  constructor() {}

  update(deltaTime, oldState, newState) {
    if (deltaTime < 0 || !oldState || !newState) {
      console.warn("SimManager: Invalid update arguments provided.");
    }
    throw new Error("Method 'update()' must be implemented.");
  }
}
