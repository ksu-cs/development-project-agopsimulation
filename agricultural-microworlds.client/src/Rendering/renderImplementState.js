import { VEHICLES } from "../States/StateClasses/ImplementState";
import { FRAME_HEIGHT, FRAME_WIDTH } from "./renderingConstants";
import RenderState from "./renderState";

const IMAGE_KEYS = {
  HARVESTER: "harvester",
  SEEDER: "seeder",
  CRASH: "crash",
};

export default class RenderImplementState extends RenderState {
  constructor() {
    const paths = {
      [IMAGE_KEYS.HARVESTER]: "./src/assets/combine-harvester.png",
      [IMAGE_KEYS.SEEDER]: "./src/assets/seeder.png",
      [IMAGE_KEYS.CRASH]: "./src/assets/crash_sprite_overlay.png",
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
          ? this.images[IMAGE_KEYS.SEEDER]
          : this.images[IMAGE_KEYS.HARVESTER];

      context.save();
      context.translate(screenX + FRAME_WIDTH / 2, screenY + FRAME_HEIGHT / 2);
      context.rotate(angleInRadians);
      context.drawImage(sprite, -FRAME_WIDTH / 2, -FRAME_HEIGHT / 2);
      context.restore();
    });

    if (!data?.isGameOver) return;
    if (!data?.crashed) return;


    const crashX = data.crashed.x;
    const crashY = data.crashed.y;

    const screenX = crashX - data.cameraX;
    const screenY = crashY - data.cameraY;

    const size = 40;

    context.drawImage(
      this.images[IMAGE_KEYS.CRASH],
      screenX - size / 2,
      screenY - size / 2,
      size,
      size,
    );
  }
}
