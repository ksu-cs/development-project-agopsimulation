import { VEHICLES } from "../States/StateClasses/ImplementState";
import RenderState from "./renderState";

const IMAGE_KEYS = {
  HARVESTER: "harvester",
  SEEDER: "seeder",
};

export default class RenderImplementState extends RenderState {
  constructor() {
    const paths = {
      [IMAGE_KEYS.HARVESTER]: "./src/assets/combine-harvester.png",
      [IMAGE_KEYS.SEEDER]: "./src/assets/seeder.png",
    };
    super(paths, paths.length);
  }
  render(context, simulationState) {
    if (!simulationState.vehicles) return;

    simulationState.vehicles.forEach((vehicle) => {
      const screenX = vehicle.x - simulationState.cameraX;
      const screenY = vehicle.y - simulationState.cameraY;

      const normalizedAngle = ((vehicle.angle % 360) + 360) % 360;
      var angleInRadians = (normalizedAngle * Math.PI) / 180;

      const sprite =
        vehicle.type === VEHICLES.SEEDER
          ? this.seederSprite
          : this.harvesterSprite;

      context.save();
      context.translate(
        screenX + this.FRAME_WIDTH / 2,
        screenY + this.FRAME_HEIGHT / 2,
      );
      context.rotate(angleInRadians);
      context.drawImage(sprite, -this.FRAME_WIDTH / 2, -this.FRAME_HEIGHT / 2);
      context.restore();
    });
  }
}
