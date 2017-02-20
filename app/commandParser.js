const {config} = require('../config/config.js');
const models = require('../models');
const _ = require('lodash');


function CommandParser(bot) {
    this.bot = bot;
}

CommandParser.prototype.isCommand = function (msg) {
    return msg.entities && _.size(_.find(msg.entities, {type: 'bot_command', offset: 0}));
};

CommandParser.prototype.process = function (msg) {
    let commandEntity = _.find(msg.entities, {type: 'bot_command', offset: 0});
    let command = msg.text.substr(commandEntity.offset, commandEntity.length);
    msg.text = msg.text.substr(commandEntity.length);

    if (_.includes(command, 'isCommand') || _.includes(command, 'process')) {
        return;
    }

    if (msg.chat.type === 'supergroup' || msg.chat.type === 'group') {
        if (!_.includes(command, this.bot.me.username)) {
            return;
        }
    }

    command = command.split('@')[0].substr(1);

    if (this[command]) {
        this[command](msg);
    }
};

CommandParser.prototype.ping = function (msg) {
    this.bot.sendMessage(msg.chat.id, 'Pong!', {
        reply_to_message_id: msg.message_id
    });
};

CommandParser.prototype.get_gab = async function (msg) {
    let self = this;
    let chat = await models.Chat.getChat(msg);

    self.bot.sendMessage(msg.chat.id, chat[0].get('random_chance'), {
        reply_to_message_id: msg.message_id
    });
};

CommandParser.prototype.set_gab = async function (msg) {
    let self = this;
    let chance = parseInt(msg.text) || 0;
    if ((msg.chat.type === 'supergroup' || msg.chat.type === 'group') && msg.from.id !== 36586950) {
        let admins = await this.bot.getChatAdministrators(msg.chat.id);
        let user = _.find(admins, function (admin) {
            return admin.user.id === msg.from.id
        });

        console.log(admins);

        if (!user) {
            return self.bot.sendMessage(msg.chat.id, 'Not allowed', {
                reply_to_message_id: msg.message_id
            });
        }
    }

    let chat = await models.Chat.getChat(msg);
    chat[0].set('random_chance', chance);
    chat[0].save();
    self.bot.sendMessage(msg.chat.id, 'Setting gab to ' + chance, {
        reply_to_message_id: msg.message_id
    });
};

CommandParser.prototype.get_pairs = async function (msg) {
    let chat = (await models.Chat.getChat(msg))[0];
    let counter = await models.Pair.count({where: {ChatId: chat.get('id')}});

    this.bot.sendMessage(msg.chat.id, 'Known pairs for this chat ' + counter, {
        reply_to_message_id: msg.message_id
    });
};

module.exports = CommandParser;
