import { CropState } from "./CropState";

export class WorldStateManager {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    
    // Initialize the old field storage
    this.oldField = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => new CropState())
    );
  }

  // Get the Read-Only version of the world (The Old State)
  getOldState() {
    return this.oldField;
  }

  // Save the new calculation as the official Old State for the next frame
  commitNewState(newFieldState) {
    this.oldField = newFieldState;
  }
}