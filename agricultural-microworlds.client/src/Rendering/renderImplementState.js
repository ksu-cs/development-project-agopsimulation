import { VEHICLES } from "../States/StateClasses/ImplementState";
import { FRAME_HEIGHT, FRAME_WIDTH } from "./renderingConstants";
import RenderState from "./renderState";
import harvesterImage from "@/assets/combine-harvester.png";
import seederImage from "@/assets/seeder.png";
import collectorImage from "@/assets/collector.png";
import siloImage from "@/assets/silo.png";
import crashImage from "@/assets/crash_sprite_overlay.png";

const IMAGE_KEYS = {
  HARVESTER: "harvester",
  SEEDER: "seeder",
  COLLECTOR: "collector",
  SILO: "silo",
  CRASH: "crash",
};

export default class RenderImplementState extends RenderState {
  constructor() {
    // Send the paths of the images needed for the module to the parent class to load them and store them in the images object
    const paths = {
      [IMAGE_KEYS.HARVESTER]: harvesterImage,
      [IMAGE_KEYS.SEEDER]: seederImage,
      [IMAGE_KEYS.COLLECTOR]: collectorImage,
      [IMAGE_KEYS.SILO]: siloImage,
      [IMAGE_KEYS.CRASH]: crashImage,
    };
    super(paths, paths.length);
  }

  render(context, data) {
    if (!data.vehicles) return;

    data.vehicles.forEach((vehicle) => {
      // Calculate screen positions
      const screenX = vehicle.x - data.cameraX;
      const screenY = vehicle.y - data.cameraY;

      // Calculate rotation angle in radians
      const normalizedAngle = ((vehicle.angle % 360) + 360) % 360;
      var angleInRadians = (normalizedAngle * Math.PI) / 180;

      const sprite = this.#getImplementSprite(vehicle.type);

      context.save();
      context.translate(screenX + FRAME_WIDTH / 2, screenY + FRAME_HEIGHT / 2);
      // Don't rotate silo, as it's a stationary structure
      if (vehicle.type !== VEHICLES.SILO) {
        context.rotate(angleInRadians);
      }
      context.drawImage(sprite, -FRAME_WIDTH / 2, -FRAME_HEIGHT / 2);
      context.restore();
    });

    // Check to see if simulation must stop
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

  #getImplementSprite(type){
    return type === VEHICLES.SEEDER
          ? this.images[IMAGE_KEYS.SEEDER]
          : type === VEHICLES.COLLECTOR
            ? this.images[IMAGE_KEYS.COLLECTOR]
            : type === VEHICLES.SILO
              ? this.images[IMAGE_KEYS.SILO]
              : this.images[IMAGE_KEYS.HARVESTER];
  }
}
