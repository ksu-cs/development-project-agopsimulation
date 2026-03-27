export default class RenderState {
  /**
   * Loads all the images necesssary to render this object
   * @param {Object.<string, string>} imagePaths The key for each image and it's path
   * @param {number} imageCount The number of images to load
   */
  constructor(imagePaths, imageCount) {
    this.imageCount = imageCount;
    this.imageLoadCount = 0;
    /** @type {{[key: string] : Image}} */
    this.images = {};

    if (!imagePaths) return;

    Object.entries(imagePaths).forEach(([key, path]) => {
      this.images[key] = new Image();
      this.images[key].src = path;
      this.images[key].onload = () => {
        console.log(`${key} loaded`);
        this.#onImageLoad();
      };
      this.images[key].onerror = () => {
        console.log(`Failed to load ${key}`);
      };
    });
  }
  /**
   * Renders the this item based on the information stored in the class
   * @param {import("react").Context} context The context handed out by the top level renderer to allow this method to render
   * @param {Object} mouduleData The data needed to render this module
   */
  render(context, mouduleData) {}

  #onImageLoad() {
    this.imageLoadCount++;
  }
}
