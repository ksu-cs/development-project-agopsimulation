import RenderState from "./renderState";

export default class RenderDayCycleState extends RenderState {
  constructor() {
    super({}, 0);
  }

  render(context, data) {
    // Basic colorization option, using a rectangle draw. Formula for the color should be expanded to account for seasons / weather.
    let nightAlpha = 0.0;
    if (data.currentTime < 12)
      nightAlpha =
        1.0 - Math.min(Math.max(data.currentTime - 5.0, 0.0) / 4.0, 1.0);
    else
      nightAlpha =
        1.0 - Math.min(Math.max(22.0 - data.currentTime, 0.0) / 4.0, 1.0);

    context.fillStyle = `rgba(0, 0, 150, ${0.45 * nightAlpha})`;
    context.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
  }
}
