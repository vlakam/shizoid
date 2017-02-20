const { config } = require('../config/config.js');
const models = require('../models');
const _ = require('lodash');



function CommandParser(bot) {
    this.bot = bot;
}

CommandParser.prototype.isCommand = function(msg) {
    return msg.entities && _.size(_.find(msg.entities, {type: 'bot_command', offset: 0}));
};

CommandParser.prototype.process = function (msg) {
    let commandEntity = _.find(msg.entities, {type: 'bot_command', offset: 0});
    let command = msg.text.substr(commandEntity.offset, commandEntity.length);
    msg.text = msg.text.substr(commandEntity.length);

    if(_.includes(command, 'isCommand') || _.includes(command, 'process')) {
        return;
    }

    if(msg.chat.type === 'supergroup' || msg.chat.type === 'group') {
        if(!_.includes(command, this.bot.me.username)) {
            return;
        }
    }

    command = command.split('@')[0].substr(1);

    if(this[command]) {
        this[command](msg);
    }
};

CommandParser.prototype.ping = function (msg) {
    this.bot.sendMessage(msg.chat.id, 'Pong!', {
        reply_to_message_id: msg.message_id
    });
};

CommandParser.prototype.get_gab = function (msg) {
    let self = this;
    models.Chat.find({where: {telegram_id: msg.chat.id}}).then(function (chat) {
        self.bot.sendMessage(msg.chat.id, chat.get('random_chance'), {
            reply_to_message_id: msg.message_id
        });
    });
};

CommandParser.prototype.set_gab = function (msg) {
    let self = this;
    let chance = parseInt(msg.text) || 0;
    models.Chat.find({where: {telegram_id: msg.chat.id}}).then(function (chat) {
        chat.set('random_chance', chance);
        chat.save();
        self.bot.sendMessage(msg.chat.id, 'Setting gab to ' + chance, {
            reply_to_message_id: msg.message_id
        });
    });
};

module.exports = CommandParser;
