import SimManager from "../SimManager";
import BitmapFieldState from "../../BinaryArrayAbstractionMethods/BitmapFieldState";
import {
  getYieldScore,
  isGrowing,
  isMature,
  isUnplanted,
  plant,
  reset,
} from "../../States/StateClasses/CropState";
import {
  VEHICLE_FUEL_CAPACITY,
  VEHICLE_FUEL_CONSUMPTION,
  VEHICLES,
} from "../../States/StateClasses/ImplementState";

export default class TractorSimManager extends SimManager {
  constructor() {
    super();
    this.TILE_WIDTH = 8;
    this.TILE_HEIGHT = 8;
    this.HEADER_OFFSET = 20;
    this.HEADER_WIDTH = 64;
    this.FIELD_COLS = 300;
    this.SPRITE_SIZE = 64;
    this.COLLISION_RADIUS = 28;
    this.cameraX = 0;
    this.cameraY = 0;
    this.activeVehicleCamera = VEHICLES.HARVESTER;
  }

  update(deltaTime, oldState, newState) {
    const oldVehicles = oldState.vehicles;
    const newVehicles = newState.vehicles;
    const newField = newState.field;

    if (newState.isGameOver) return;

    if (!oldVehicles || !newVehicles || !newField) return;

    for (let i = 0; i < newVehicles.length; i++) {
      const oldTractor = oldVehicles[i];
      const newTractor = newVehicles[i];

      // Skip processing stationary structures like the silo
      if (newTractor.type === VEHICLES.SILO) continue;

      // Turning and Movement Logic
      const diff = newTractor.goalAngle - newTractor.angle;
      const isTurning = Math.abs(diff) > 0.1;
      let moveDistance = 0;

      if (isTurning) {
        const absDiff = Math.abs(diff);
        const turnStep = newTractor.turnSpeed * deltaTime;
        const alpha = Math.min(turnStep, absDiff) / absDiff;
        newTractor.angle =
          newTractor.angle * (1 - alpha) + newTractor.goalAngle * alpha;
        moveDistance = newTractor.basespeed * deltaTime;
      } else if (oldTractor.isMoving) {
        moveDistance = newTractor.basespeed * deltaTime;
      }

      if (moveDistance > 0) {
        const rad = (newTractor.angle * Math.PI) / 180;
        newTractor.x += Math.cos(rad) * moveDistance;
        newTractor.y += Math.sin(rad) * moveDistance;
        newTractor.totalFuelConsumed +=
          VEHICLE_FUEL_CONSUMPTION[newTractor.type] * deltaTime;
        newTractor.fuelInTankUsed +=
          VEHICLE_FUEL_CONSUMPTION[newTractor.type] * deltaTime;
      }

      // Interaction Logic

      // Check Harvesting
      if (oldTractor.isHarvestingOn) {
        this.handleHarvesting(newTractor, newField, newVehicles);
      } else if (oldTractor.isSeedingOn) {
        this.handleSeeding(newTractor, newField);
      }

      // Check if collector should transfer to silo
      if (newTractor.type === VEHICLES.COLLECTOR) {
        this.handleCollectorToSilo(newTractor, newVehicles);
      }
    }

    if (this.checkVehicleCollisions(newState)) {
      return;
    }

    if (this.checkVehicleFuel(newState)) {
      return;
    }
  }

  handleHarvesting(tractor, field, vehicles) {
    if (tractor.type !== VEHICLES.HARVESTER) return; // Only harvester harvests

    const collector = vehicles.find(v => v.type === VEHICLES.COLLECTOR);
    const isCollectorBeside = this.isBeside(tractor, collector);

    this.applyToolAction(
      tractor,
      field,
      (tile) => {
        if (isMature(tile)) {
          if (isCollectorBeside) {
            tractor.yieldScore += getYieldScore(tile);
          }
          reset(tile);
          return true;
        } else if (isGrowing(tile)) {
          reset(tile);
          return true;
        }
      },
      this.HEADER_OFFSET,
    );
  }

  handleSeeding(tractor, field) {
    this.applyToolAction(
      tractor,
      field,
      (tile) => {
        if (isUnplanted(tile)) {
          plant(tractor.cropBeingPlanted, tile);
          return true;
        }
        return false;
      },
      -this.HEADER_OFFSET,
    );
  }
  handleCollectorToSilo(collector, vehicles) {
    const silo = vehicles.find(v => v.type === VEHICLES.SILO);
    if (!silo) return;

    const isCollectorBesideSilo = this.isBeside(collector, silo);
    if (!isCollectorBesideSilo) return;

    // Transfer collector's yield to silo storage
    const transferAmount = collector.yieldScore;
    if (transferAmount > 0) {
      const availableCapacity = silo.storageCapacity - silo.currentStorage;
      const amountToTransfer = Math.min(transferAmount, availableCapacity);

      silo.currentStorage += amountToTransfer;
      collector.yieldScore -= amountToTransfer;
    }
  }

  isBeside(vehicle1, vehicle2) {
    if (!vehicle1 || !vehicle2) return false;
    const dx = vehicle1.x - vehicle2.x;
    const dy = vehicle1.y - vehicle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 100; // Beside if within 100 pixels
  }

  /**
   * Gets all tiles that the tractor is currently over.
   * @param {any} tractor The tractor.
   * @param {any} field The crop field.
   * @return {any} Returns an array of all tiles the tractor is currently over.
   */
  *getTilesCurrentlyOver(tractor, field, offset) {
    const centerX = tractor.x + 32;
    const centerY = tractor.y + 32;
    const rad = (tractor.angle * Math.PI) / 180;
    const frontX = centerX + Math.cos(rad) * offset;
    const frontY = centerY + Math.sin(rad) * offset;

    const pSin = Math.sin(rad);
    const pCos = Math.cos(rad);
    const pointsToCheck = 10;

    for (let i = 0; i < pointsToCheck; i++) {
      const t = i / (pointsToCheck - 1) - 0.5;
      const offset = t * this.HEADER_WIDTH;
      const checkX = frontX - pSin * offset;
      const checkY = frontY + pCos * offset;

      const targetCrop = this.getTileAtLocation(checkX, checkY, field);
      if (targetCrop) yield targetCrop;
    }
  }

  /**
   * Gets all tiles that the tractor is currently over.
   * @param {any} tractor The tractor.
   * @param {BitmapFieldState} field The crop field.
   * @param {any} actionCallback The action to take on a valid tile.
   * */
  applyToolAction(tractor, field, actionCallback, offset) {
    for (const targetCrop of this.getTilesCurrentlyOver(
      tractor,
      field,
      offset,
    )) {
      if (targetCrop) {
        const didChange = actionCallback(targetCrop[0]);

        if (didChange) {
          field.setTile(targetCrop[1], targetCrop[2], targetCrop[0]);
        }
      }
    }
  }

  /**
   * Gets a tile at a specific coordinate on the field
   * @param {number} x The x-coordinate.
   * @param {number} y The y-coordinate.
   * @param {BitmapFieldState} field The crop field.
   * @returns {[targetCrop: Object.<string, number>, tileX: number, tileY: number]} An array of a field tile, and each of its proper coordinates.
   * */
  getTileAtLocation(x, y, field) {
    const tileX = Math.floor(x / this.TILE_WIDTH);
    const tileY = Math.floor(y / this.TILE_HEIGHT);

    if (
      tileY >= 0 &&
      tileY < this.FIELD_COLS &&
      tileX >= 0 &&
      tileX < this.FIELD_COLS
    ) {
      const targetCrop = field.getTileAt(tileX, tileY);
      return [targetCrop, tileX, tileY];
    }

    return null;
  }

  /**
   * Calculates the camera coordinates for the active implement based on the information in that implement state
   * @param {ImplementState} implement The active implement that the camera is tracking
   * @param {number} fieldWidth The width of the field
   * @param {number} canvasWidth The width of the canvas
   * @param {number} canvasHeight The height of the canvas
   */
  updateCameraCoordinates(implement, fieldWidth, canvasWidth, canvasHeight) {
    if (!implement) return;

    const tractorX = implement.x + 32;
    const tractorY = implement.y + 32;

    let targetX = tractorX - canvasWidth / 2;
    let targetY = tractorY - canvasHeight / 2;

    const maxCameraX = fieldWidth * this.TILE_WIDTH - canvasWidth;
    const maxCameraY = fieldWidth * this.TILE_WIDTH - canvasHeight;

    targetX = Math.min(targetX, maxCameraX);
    targetY = Math.min(targetY, maxCameraY);

    this.cameraX = Math.max(-150, targetX);
    this.cameraY = Math.max(0, targetY);
  }

  areVehiclesColliding(a, b) {
    const ax = a.x + this.SPRITE_SIZE / 2;
    const ay = a.y + this.SPRITE_SIZE / 2;
    const bx = b.x + this.SPRITE_SIZE / 2;
    const by = b.y + this.SPRITE_SIZE / 2;

    const dx = ax - bx;
    const dy = ay - by;

    const distanceSq = dx * dx + dy * dy;
    const radius = this.COLLISION_RADIUS * 2;

    if (distanceSq <= radius * radius) {
      return {
        collided: true,
        x: (ax + bx) / 2,
        y: (ay + by) / 2,
      };
    }

    return { collided: false };
  }

  checkVehicleCollisions(newState) {
    const vehicles = newState.vehicles;
    if (!vehicles || vehicles.length < 2) return false;

    // Don't re-trigger crash if already happened
    if (newState.isGameOver) return true;

    for (let i = 0; i < vehicles.length; i++) {
      // Skip collision checks for stationary structures like the silo
      if (vehicles[i].type === VEHICLES.SILO) continue;

      for (let j = i + 1; j < vehicles.length; j++) {
        // Skip collision checks for stationary structures like the silo
        if (vehicles[j].type === VEHICLES.SILO) continue;

        const result = this.areVehiclesColliding(vehicles[i], vehicles[j]);

        if (result.collided) {
          newState.isGameOver = true;
          newState.crash = {
            x: result.x,
            y: result.y,
          };

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks if all vehicles are waiting, so we can speed up the night cycle waiting time.
   * @param {any} stateManager The state manager.
   * @returns {boolean} Whether or not there are vehicles that are waiting.
   **/
  areAllVehiclesWaiting(stateManager) {
    if (!stateManager) return false;

    const vehicles = stateManager.getState("vehicles");
    if (!vehicles || vehicles.length <= 0) return false;

    for (const vehicle of vehicles) {
      if (!vehicle) continue;
      // Skip checking stationary structures like the silo
      if (vehicle.type === VEHICLES.SILO) continue;
      if (vehicle.isMoving) return false;
      if (Math.abs(vehicle.goalAngle - vehicle.angle) > 0.1) return false;
    }

    return true;
  }

  /**
   * Checks if any vehicle has consumed all of its fuel, and if so ends the game.
   * @param {any} newState The new state of the game, which may have updated fuel consumption values.
   * @returns {boolean} Returns true if a vehicle has run out of fuel and the game is now over, otherwise false.
   */
  checkVehicleFuel(newState) {
    const vehicles = newState.vehicles;
    if (!vehicles) return false;

    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      // Skip checking fuel for stationary structures like the silo
      if (vehicle.type === VEHICLES.SILO) continue;
      
      const fuelCapacity = VEHICLE_FUEL_CAPACITY[vehicle.type];
      if (vehicle.fuelInTankUsed >= fuelCapacity) {
        newState.isGameOver = true;
        return true;
      }
    }
    return false;
  }
}
