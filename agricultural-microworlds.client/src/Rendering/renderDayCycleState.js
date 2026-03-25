import RenderState from "./renderState";

export default class RenderDayCycleState extends RenderState {
  constructor() {
    super();
  }

  render(context, data) {
    if (data.nightFadeProgress >= 0.0) {
      context.fillStyle = `rgba(15, 15, 75, 0.5)`;
      context.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
    }
  }
}
