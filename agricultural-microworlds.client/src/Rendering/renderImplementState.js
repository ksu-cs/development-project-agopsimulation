import { VEHICLES } from "../States/StateClasses/ImplementState";
import { FRAME_HEIGHT, FRAME_WIDTH } from "./renderingConstants";
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

  render(context, data) {
    if (!data.vehicles) return;

    data.vehicles.forEach((vehicle) => {
      const screenX = vehicle.x - data.cameraX;
      const screenY = vehicle.y - data.cameraY;

      const normalizedAngle = ((vehicle.angle % 360) + 360) % 360;
      var angleInRadians = (normalizedAngle * Math.PI) / 180;

      const sprite =
        vehicle.type === VEHICLES.SEEDER
          ? this.seederSprite
          : this.harvesterSprite;

      context.save();
      context.translate(screenX + FRAME_WIDTH / 2, screenY + FRAME_HEIGHT / 2);
      context.rotate(angleInRadians);
      context.drawImage(sprite, -FRAME_WIDTH / 2, -FRAME_HEIGHT / 2);
      context.restore();
    });
  }
}
