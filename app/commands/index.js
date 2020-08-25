const setupGabCommands = require("./gab");
const setupPairsCommand = require("./pairs");
const setupPingCommand = require("./ping");
const setupEightballCommand = require("./eightball");

const setupCommands = (bot) => {
    setupGabCommands(bot);
    setupPairsCommand(bot);
    setupPingCommand(bot);
    setupEightballCommand(bot);
};

module.exports = setupCommands;
