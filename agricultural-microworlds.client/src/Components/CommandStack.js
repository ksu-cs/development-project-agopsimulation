// This new class is the "Trigger Stack"
// It manages the list of commands and their state.
export default class CommandStack {
  constructor() {
    this.commands = []; // The list of commands from Blockly
    this.currentCommand = null;
    this.currentCommandIndex = 0;
    this.isFinished = false;
  }

  // This is called by the generator's code to add commands
  addCommand(commandObject) {
    this.commands.push(commandObject);
  }

  // This is called by Simulation.js's main game loop
  update(deltaTime, simulation) {
    if (this.isFinished) return;

    // Check if we need to get the next command
    if (!this.currentCommand) {
      if (this.currentCommandIndex >= this.commands.length) {
        // No more commands
        this.isFinished = true;
        return;
      }

      this.currentCommand = this.commands[this.currentCommandIndex];
      this.currentCommand.elapsed = 0; // Initialize timer

      // This calculates the new goal based on the *current* angle.
      if (this.currentCommand.type === "TURN") {
        simulation.goalAngle = simulation.angle + this.currentCommand.amount;
      }

      // If the new command is a WAIT, trigger the night fade NOW.
      if (this.currentCommand.type === "WAIT") {
        simulation.nightFadeProgress = 0.0;
      }

    }

    // Process the active command
    this.processCommand(deltaTime, simulation);
  }

  // This is the logic moved from Simulation.js
  processCommand(deltaTime, simulation) {
    const cmd = this.currentCommand;
    cmd.elapsed += deltaTime;

    let commandIsFinished = false;

    switch (cmd.type) {
      case "MOVE": {
        if (cmd.elapsed >= cmd.duration) {
          commandIsFinished = true;
          // Finish the command
          const overflowTime = cmd.elapsed - cmd.duration;
          simulation.moveTractor(deltaTime - overflowTime);
        } else {
          // Continue the command
          simulation.moveTractor(deltaTime);
        }
        break;
      }

      case "TURN": {
        // This logic now operates on the simulation's state
        const absDiff = Math.abs(simulation.goalAngle - simulation.angle);
        if (absDiff < 0.1) {
          simulation.angle = simulation.goalAngle;
          commandIsFinished = true;
        } else {
          var alpha =
            Math.min(simulation.turnSpeed * deltaTime, absDiff) / absDiff;
          simulation.angle =
            simulation.angle * (1 - alpha) + simulation.goalAngle * alpha;
          // Naturalistic turning move
          simulation.moveTractor(deltaTime);
        }
        break;
      }

      case "WAIT": {

        // Check if a week has passed
        if (simulation.nightFadeProgress >= 0.5 && cmd.elapsed > (cmd.lastWeekTime + 0.2)) {
          cmd.lastWeekTime = cmd.elapsed;

        const weekIndex = simulation.currentWeek - 1;
        const weekGDD = simulation.calculateGDDForWeek(weekIndex);

          simulation.cumulativeGDD += weekGDD;
          simulation.currentWeek++;
          simulation.growCrops(weekGDD);
          cmd.weeksRemaining--;

          document.getElementById("weekText").textContent = `Week ${simulation.currentWeek}`;
          document.getElementById("gddText").textContent = `GDD: ${simulation.cumulativeGDD.toFixed(2)}`;
          
          const currentWeek = simulation.currentWeek;
          const eventCode = simulation.eventTriggers[currentWeek];
          if (eventCode && !simulation.triggeredEvents.has(currentWeek)) {
            simulation.triggeredEvents.add(currentWeek);
            simulation.queueEventCode(eventCode);
          }

        }
        
        if (cmd.weeksRemaining <= 0) {
          commandIsFinished = true;
        }
        break;
      }

      case "TOGGLE_HARVESTING": {
        simulation.toggleHarvesting(cmd.value);
        commandIsFinished = true; // This is an instant command
        break;
      }

      case "TOGGLE_SEEDING": {
        simulation.toggleSeeding(cmd.value);
        commandIsFinished = true; // This is an instant command
        break;
      }

    }

    if (commandIsFinished) {
      this.currentCommand = null;
      this.currentCommandIndex++;
    }
  }
}