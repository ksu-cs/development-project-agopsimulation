import CommandStack from "./CommandStack";

// This is the new "Model". It only manages data.
// It has NO canvas or drawing code.
export default class Simulation {
  constructor() {
    // World and Field
    this.TILE_BASE_SIZE = 64;
    this.FIELD_SCALE = 8;
    this.TILE_WIDTH = this.TILE_BASE_SIZE / this.FIELD_SCALE;
    this.TILE_HEIGHT = this.TILE_BASE_SIZE / this.FIELD_SCALE;
    this.WORLD_HEIGHT_IN_SCREENS = 5;
    this.WORLD_WIDTH_IN_SCREENS = 5;
    this.SCREEN_ROWS = Math.floor(500 / this.TILE_HEIGHT) + 2; // Assuming 500px canvas
    this.SCREEN_COLUMNS = Math.floor(500 / this.TILE_WIDTH) + 2; // Assuming 500px canvas
    this.rows = this.SCREEN_ROWS * this.WORLD_HEIGHT_IN_SCREENS;
    this.columns = this.SCREEN_COLUMNS * this.WORLD_WIDTH_IN_SCREENS;
    this.worldPixelWidth = this.columns * this.TILE_WIDTH;
    this.worldPixelHeight = this.rows * this.TILE_HEIGHT;
    this.field = [];

    // Tractor State
    this.tractorWorldX = this.worldPixelWidth / 2;
    this.tractorWorldY = this.worldPixelHeight / 2;
    this.angle = 0;
    this.goalAngle = 0;
    this.turnSpeed = 90; // degrees per second
    this.speed = 20; // pixels per second
    this.isHarvestingOn = false;
    this.isSeedingOn = false;

    // Simulation State
    this.START_WEEK = 1;
    this.GROWTH_DAYS = 1000.0;
    this.currentWeek = this.START_WEEK;
    this.yieldScore = 0;
    this.cumulativeGDD = 0;
    this.csvLines = [];
    this.Wheatgdd = 10;
    this.nightFadeProgress = -1.0;
    this.isFadingOutNight = false;

    // The new "Trigger Stack" / Command Queue
    // This is the list of instructions from Blockly
    this.commandStack = null;

    this.eventTriggers = {}; // { 10: "code...", 20: "code..." }
    this.triggeredEvents = new Set(); // To prevent re-running events
    this.pendingEventCode = []; // Code to be run in the update loop

    this.resetEverything();
  }

  // --- Public State Getter ---
  // The View (Renderer) will call this every frame
  getState() {
    return {
      tractorWorldX: this.tractorWorldX,
      tractorWorldY: this.tractorWorldY,
      angle: this.angle,
      field: this.field,
      rows: this.rows,
      columns: this.columns,
      worldPixelWidth: this.worldPixelWidth,
      worldPixelHeight: this.worldPixelHeight,
      currentWeek: this.currentWeek,
      yieldScore: this.yieldScore,
      cumulativeGDD: this.cumulativeGDD,
      nightFadeProgress: this.nightFadeProgress,

      stackLength: this.commandStack ? this.commandStack.commands.length : 0,
      stackIndex: this.commandStack ? this.commandStack.currentCommandIndex : 0,
      currentCommand: this.commandStack ? this.commandStack.currentCommand : null,
      isFinished: this.commandStack ? this.commandStack.isFinished : true,

    };
  }

  // --- The New "Heart" of the Simulation ---
  // This is called by the game loop in the React component
  update(deltaTime) {

    while (this.pendingEventCode.length > 0) {
      const code = this.pendingEventCode.shift();
      try {
        const run = new Function("simulation", code);
        run(this); // This will call simulation.queue... commands
      } catch (e) {
        console.error("Error running event code:", e);
      }
    }

    // 1. Check if a stack exists AND if it's not finished
    if (this.commandStack && !this.commandStack.isFinished) {
      this.commandStack.update(deltaTime, this);
    }

    const stackIsRunning = this.commandStack && !this.commandStack.isFinished;
    const isWaiting = stackIsRunning && this.commandStack.currentCommand?.type === 'WAIT';

    if (!isWaiting && this.nightFadeProgress > 0 && !this.isFadingOutNight) {
      this.isFadingOutNight = true;
    }
    if (this.isFadingOutNight) {
      // Fading OUT
      this.nightFadeProgress -= deltaTime * 2.0; // Fade out speed
      if (this.nightFadeProgress <= 0.0) {
        this.nightFadeProgress = -1.0; // Off
        this.isFadingOutNight = false; // Done fading
      }
    } else if (isWaiting) {
      // Fading IN or HOLDING
      this.nightFadeProgress = Math.min(
        this.nightFadeProgress + deltaTime * 1.0, // Fade in speed
        1.0,
      );
    }
  }

  // --- Helper for processing movement ---
  moveTractor(deltaTime) {
    const moveX = this.speed * Math.cos((this.angle * Math.PI) / 180);
    const moveY = this.speed * Math.sin((this.angle * Math.PI) / 180);

    this.tractorWorldX += moveX * deltaTime;
    this.tractorWorldY += moveY * deltaTime;
    
    // Clamp to world bounds
    this.tractorWorldX = Math.max(0, Math.min(this.tractorWorldX, this.worldPixelWidth - this.TILE_WIDTH));
    this.tractorWorldY = Math.max(0, Math.min(this.tractorWorldY, this.worldPixelHeight - this.TILE_HEIGHT));

    // Handle harvesting/seeding while moving
    this.CheckIfPlantInFront(-1); // -1 means "change tiles"
  }

  // --- API for Blockly Blocks (now queue commands) ---
  // These are called instantly by the generated JS code
  
  runScript(commands) {
    this.commandQueue = commands;
    this.currentCommand = null;
  }
  
  queueMove(duration) {
    if (this.commandStack) {
      this.commandStack.addCommand({ type: "MOVE", duration: duration });
    }
  }

  queueTurn(amount) {
    if (this.commandStack) {
      // this.goalAngle += amount;
      this.commandStack.addCommand({ type: "TURN" , amount: amount});
    }
  }

  queueWait(weeks) {
    if (this.commandStack) {
      this.commandStack.addCommand({ 
          type: "WAIT", 
          weeksRemaining: weeks, 
          lastWeekTime: -1 
      });
    }
  }

  queueToggleHarvesting(isOn) {
    if (this.commandStack) {
      this.commandStack.addCommand({ type: "TOGGLE_HARVESTING", value: isOn });
    }
  }

  queueToggleSeeding(isOn) {
    if (this.commandStack) {
      this.commandStack.addCommand({ type: "TOGGLE_SEEDING", value: isOn });
    }
  }

  toggleHarvesting(isOn) {
    this.isHarvestingOn = isOn;
    if (isOn) this.isSeedingOn = false;
  }

  toggleSeeding(isOn) {
    this.isSeedingOn = isOn;
    if (isOn) this.isHarvestingOn = false;
  }

  // --- Logic / Fetching (Unchanged from simulationMethods.js) ---

  async loadStations() {
    // ... (This logic is fine, it just updates the DOM)
    const response = await fetch(
      "https://mesonet.k-state.edu/rest/stationnames/",
    );
    const text = await response.text();
    const lines = text.split("\n").slice(1);
    const stationSelect = document.getElementById("station");
    stationSelect.innerHTML = ""; 

    lines.forEach((line) => {
      const cols = line.split(",");
      const NAME = cols[0];
      const ABBR = cols[0];
      if (NAME && ABBR) {
        const option = document.createElement("option");
        option.value = ABBR;
        option.textContent = NAME;
        stationSelect.appendChild(option);
      }
    });

    stationSelect.value = "Flickner Tech Farm";
  }
  
  calculateGDDForWeek(weekIndex, daysPerWeek = 7) {
    let sum = 0;
    const startIdx = weekIndex * daysPerWeek;
    if (startIdx >= this.csvLines.length) return 0;
    
    for (
      let i = startIdx;
      i < startIdx + daysPerWeek && i < this.csvLines.length;
      i++
    ) {
      if (this.csvLines[i] && this.csvLines[i][2]) {
        const temp = parseFloat(this.csvLines[i][2]);
        if (!isNaN(temp)) {
            sum += Math.max(0, temp - this.Wheatgdd);
        }
      }
    }
    return sum;
  }

  async fetchData(waitingweeksCount) {
    const station = document.getElementById("station").value;
    const startInput = document.getElementById("start").value;
    const startDate = new Date(startInput);
    const weeks = Number(waitingweeksCount) || 52; // Fetch a full year by default

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7 * weeks);

    const start = startInput.replaceAll("-", "");
    const end = `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, "0")}${endDate.getDate().toString().padStart(2, "0")}`;

    const url = `https://mesonet.k-state.edu/rest/stationdata?stn=${station}&int=day&t_start=${start}000000&t_end=${end}000000&vars=TEMP2MAVG`;
    
    const response = await fetch(url);
    const data = await response.text();

    const lines = data.trim().split("\n");
    this.csvLines = lines.slice(1).map((line) => line.split(","));
    this.cumulativeGDD = 0;
    this.currentWeek = this.START_WEEK;
  }

  resetField() {
    this.field = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => ({
        state: 2, // 2 = Grown
        growth: 0.0,
      }))
    );
  }

  resetEverything() {
    this.commandStack = null;

    this.tractorWorldX = this.worldPixelWidth / 2;
    this.tractorWorldY = this.worldPixelHeight / 2;
    this.angle = 0;
    this.goalAngle = 0;
    this.isHarvestingOn = false;
    this.isSeedingOn = false;
    this.yieldScore = 0;
    this.nightFadeProgress = -1.0;
    this.isFadingOutNight = false;
    this.currentWeek = this.START_WEEK;
    this.cumulativeGDD = 0;

    this.eventTriggers = {};
    this.triggeredEvents = new Set();
    this.pendingEventCode = [];

    this.resetField();
  }

  // --- Pure Simulation Logic (Moved from simulationMethods.js) ---

  growCrops(weeklyGDD) {
    const daysToAdd = weeklyGDD;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let tile = this.field[i][j];
        if (tile.state === 1) { // Seeded
          tile.growth += daysToAdd;
          if (tile.growth >= this.GROWTH_DAYS) {
            tile.state = 2; // Fully grown
            tile.growth = this.GROWTH_DAYS;
          }
        }
      }
    }
  }

  CheckIfPlantInFront(type) {
    // ... (This code is complex and purely logical, so it's moved directly)
    // ... (This now calls changeTile() if type === -1)
    const FRAME_WIDTH = 64;
    const FRAME_HEIGHT = 64;
    const topLeft = { x: -FRAME_WIDTH / 2, y: -FRAME_HEIGHT / 2 };
    const topRight = { x: FRAME_WIDTH / 2, y: -FRAME_HEIGHT / 2 };
    const bottomRight = { x: FRAME_WIDTH / 2, y: FRAME_HEIGHT / 2 };
    const bottomLeft = { x: -FRAME_WIDTH / 2, y: FRAME_HEIGHT / 2 };
    const center = {
      x: this.tractorWorldX + FRAME_WIDTH / 2,
      y: this.tractorWorldY + FRAME_HEIGHT / 2,
    };

    const corners = [
      this.rotatePoint(topLeft.x, topLeft.y, this.angle, center.x, center.y),
      this.rotatePoint(topRight.x, topRight.y, this.angle, center.x, center.y),
      this.rotatePoint(bottomRight.x, bottomRight.y, this.angle, center.x, center.y),
      this.rotatePoint(bottomLeft.x, bottomLeft.y, this.angle, center.x, center.y),
    ];

    const frontSide = [corners[1], corners[2]]; // right side
    return this.detectWhatTilesAreHit(
      frontSide[0].x,
      frontSide[0].y,
      frontSide[1].x,
      frontSide[1].y,
      type,
    );
  }

  detectWhatTilesAreHit(x0, y0, x1, y1, checkTiles = -1) {
    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
      if (x0 > x1) return this.detectGentleSlope(x1, y1, x0, y0, checkTiles);
      else return this.detectGentleSlope(x0, y0, x1, y1, checkTiles);
    } else {
      if (y0 > y1) return this.detectSteepSlope(x1, y1, x0, y0, checkTiles);
      else return this.detectSteepSlope(x0, y0, x1, y1, checkTiles);
    }
  }
  
  detectGentleSlope(x0, y0, x1, y1, checkTiles = -1) {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;
    let yi = 1;
    if (deltaY < 0) {
      yi = -1;
      deltaY = -deltaY;
    }
    let D = 2 * deltaY - deltaX;
    let y = y0;
    let hasChecked = false;

    for (let x = x0; x < x1; x++) {
      const tileX = Math.floor(x / this.TILE_WIDTH);
      const tileY = Math.floor(y / this.TILE_HEIGHT);
      if (checkTiles < 0) this.changeTile(tileX, tileY);
      
      const tile = (tileX >= 0 && tileX < this.columns && tileY >= 0 && tileY < this.rows) ? this.field[tileY][tileX] : null;
      hasChecked = hasChecked || (checkTiles >= 0 && tile != null && tile.state == checkTiles);

      if (D > 0) {
        y = y + yi;
        D = D + 2 * (deltaY - deltaX);
      } else D = D + 2 * deltaY;
    }
    return hasChecked;
  }
  
  detectSteepSlope(x0, y0, x1, y1, checkTiles = -1) {
    let deltaX = x1 - x0;
    let deltaY = y1 - y0;
    let xi = 1;
    if (deltaX < 0) {
      xi = -1;
      deltaX = -deltaX;
    }
    let D = 2 * deltaX - deltaY;
    let x = x0;
    let hasChecked = false;
    
    for (let y = y0; y < y1; y++) {
      const tileX = Math.floor(x / this.TILE_WIDTH);
      const tileY = Math.floor(y / this.TILE_HEIGHT);
      if (checkTiles < 0) this.changeTile(tileX, tileY);
      
      const tile = (tileX >= 0 && tileX < this.columns && tileY >= 0 && tileY < this.rows) ? this.field[tileY][tileX] : null;
      hasChecked = hasChecked || (checkTiles >= 0 && tile != null && tile.state == checkTiles);

      if (D > 0) {
        x = x + xi;
        D = D + 2 * (deltaX - deltaY);
      } else D = D + 2 * deltaX;
    }
    return hasChecked;
  }

  changeTile(x, y) {
    if (x >= 0 && x < this.columns && y >= 0 && y < this.rows) {
      let tile = this.field[y][x];

      if (this.isHarvestingOn) {
        if (tile.state === 2) {
          tile.state = 0;
          tile.growth = 0.0;
          this.yieldScore++;
        } else if (tile.state === 1) {
          tile.state = 0;
          tile.growth = 0.0;
        }
      } else if (this.isSeedingOn) {
        if (tile.state === 0) {
          tile.state = 1;
          tile.growth = 0.0;
          // You had yieldScore++ here, which seemed odd for seeding. I left it.
          this.yieldScore++; 
        }
      }
    }
  }

  rotatePoint(x0, y0, angle, centerX, centerY) {
    const angleInRadians = angle * (Math.PI / 180);
    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);
    var newX = centerX + (x0 * cos - y0 * sin);
    var newY = centerY + (x0 * sin + y0 * cos);
    return { x: newX, y: newY };
  }

  setEventTriggers(triggers) {
    this.eventTriggers = triggers;
  }

  queueEventCode(code) {
    this.pendingEventCode.push(code);
  }

}