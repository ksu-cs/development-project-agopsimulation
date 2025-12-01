export default class CropState {
    constructor() {
        this.cropHealth = 100; //The current health of the crop. Depleting to 0 means destroying the crop.
        this.soilMinerals = 10; //The growth speed should be better, and produce a better crop, with more minerals.
        this.cropWater = 100; //Uses up water at a constant rate. If depleted, the crop won't grow.
        this.timeGrown = 0; //How many days this crop has grown for.
        this.growthProgress = 0.0; //A more value-based progress representative of the crop, affected by all the above factors.
        this.cropState = 0;
    }

    updateGrowth(daysPassed) {
        this.timeGrown += daysPassed;

        let healthAlpha = Math.min(this.cropHealth / 100.0, 1.0);
        
        if (this.cropWater > 0)
            this.growthProgress += daysPassed*(0.5*(1-healthAlpha) + 1.0*healthAlpha);
    }

    getGrowthTime() {
        return 100 - 25*(this.soilMinerals / 10.0);
    }

    getCropYield() {
        let currentYield = 5;
        currentYield += 5*(this.soilMinerals / 10.0);
        currentYield *= this.cropHealth / 100.0;
        currentYield *= Math.min(this.timeGrown / this.getGrowthTime(), 1.0);
        return currentYield;
    }
}