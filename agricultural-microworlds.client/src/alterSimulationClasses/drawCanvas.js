export default class drawCanvas {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 500;
        this.canvas.height = 500;

        // --- Sprite setup ---
        this.tractorSprite = new Image();
        this.wheatImage = new Image();
        this.seedImage = new Image();
        this.dirtImage = new Image();

        // Paths for the images
        this.tractorSprite.src = "./src/assets/combine-harvester.png";
        this.wheatImage.src = "./src/assets/wheat.png";
        this.seedImage.src = "./src/assets/T2D_Planted_Placeholder.png";
        this.dirtImage.src = "./src/assets/T2D_Dirt_Placeholder.png";

        // Variables to aid in image loading
        this.imageLoadCount = 0;
        this.imageCount = 4;
        this.isInitialized = false;
    }

    handleTimeStep(simulationData) {
        console.log(simulationData.detail);
    }


    // Image loading
    onImageLoad() {
        this.imageLoadCount++;
        if (this.imageLoadCount === this.imageCount && !this.isInitialized) {
            console.log("All images loaded!");
            this.isInitialized = true;

            // Initialize the field array
            console.log(`Initalizing world: ${this.columns}x${this.rows} tiles`);
            this.field = Array.from({ length: this.rows }, () =>
                Array.from({ length: this.columns }, () => {
                    // eslint-disable-next-line no-unused-labels
                    state: 2;
                    // eslint-disable-next-line no-unused-labels
                    growth: 0.0;
                }),
            );

            // Set initial position and draw
            this.resetPosition();
        }
    }

    setSpriteOnLoadMethods() {
        // Loading methods for images
        this.tractorSprite.onload = () => {
            console.log("✅ Tractor sprite loaded!");
            this.onImageLoad();
        };
        this.tractorSprite.onerror = () => {
            console.error("❌ Failed to load tractor sprite!");
        };
        this.dirtImage.onload = () => {
            console.log("DirtImage loaded!");
            this.onImageLoad();
        };
        this.dirtImage.onerror = () => {
            console.error("failed to load DirtImage");
        };
        this.seedImage.onload = () => {
            console.log("SeedImage loaded!");
            this.onImageLoad();
        };
        this.seedImage.onerror = () => {
            console.error("failed to load SeedImage");
        };
        this.wheatImage.onload = () => {
            console.log("WheatImage loaded!");
            this.onImageLoad();
        };
        this.wheatImage.onerror = () => {
            console.error("failed to load WheatImage");
        };
    }
}