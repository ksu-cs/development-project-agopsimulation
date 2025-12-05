export class StateManager {
  constructor() {
    // Container for all simulation states
    // Example: { field: [...], tractor: {...}, weather: {...} }
    this.states = {};
  }

  // Register a new state type
  initState(key, initialState) {
    this.states[key] = initialState;
  }

  // Get the Old State of an object
  getState(key) {
    return this.states[key];
  }

  // Save the new calculation as the official Old State for the next frame
  commitState(key, newState) {
    this.states[key] = newState;
  }
}
