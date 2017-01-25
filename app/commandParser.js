const { config } = require('../config/config.js');
const models = require('../models');
const _ = require('lodash');

function CommandParser(bot) {
    this.bot = bot;
}

CommandParser.prototype.isCommand = function(msg) {
    return msg.entities && _.size(_.find(msg.entities, {type: 'bot_command', offset: 0}));
};

module.exports = CommandParser;
