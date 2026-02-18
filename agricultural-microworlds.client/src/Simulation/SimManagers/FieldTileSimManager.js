// import FieldTileState from "../../States/StateClasses/FieldTileState";
// import SimManager from "../SimManager";

// export default class FieldTileSimManager extends SimManager {
//   update(deltaTime, oldState, newState)
//   {
//       if (deltaTime <= 0) return;
//       const cropState = oldState.cropState;
//       const waterLevel = oldState.waterLevel;
//       const minerals = oldState.minerals;

//       if (!cropState || !waterLevel || !minerals) return;

//       const fieldTileState = new FieldTileState();
//   }
// }
// 
// I think that this CropSimManager should be in charge of updating the cropstate and FieldTileSimManager should only be in charge of updating the fieldtilestate. Your code makes it to where it updates the cropstate. How do I integrate both?

