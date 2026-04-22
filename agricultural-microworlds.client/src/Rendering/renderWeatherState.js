import RenderState from "./renderState";

export default class RenderWeatherState extends RenderState {
  constructor() {
    super({}, 0);
  }

  render(context, data) {
    if (data.dailyRain > 0) {
      context.fillStyle = `rgb(30, 30, 75, 0.5)`;
      context.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
    }
  }
}
