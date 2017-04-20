const {config} = require('../config/config.js');
const models = require('../models');
const _ = require('lodash');


function message(bot, msg) {
    this.bot = bot;
    this.message = msg;
    this.text = this.message.text;
    this.words = this.get_words();
}

message.prototype.has_text = function () {
    return this.message.text;
};

message.prototype.get_words = function () {
    return _.map(_.split(this.getTextWithoutEntities(), /\s+|\\n/), (word) => {
        return _.toLower(word);
    });
};


message.prototype.getTextWithoutEntities = function () {
    if (!this.message.entities) {
        return this.text;
    }

    let self = this;
    let text = _.clone(this.text);
    _.each(this.message.entities, function (entity) {
        text = text.replace(self.text.substr(entity.offset, entity.length), '');
    });
    return text;
};

message.prototype.isReplyToBot = function () {
    return this.message.reply_to_message && this.message.reply_to_message.from.id === config.myId;
};

message.prototype.hasAnchors = function () {
    return this.has_text() && _.includes(this.text.toLowerCase(), 'шизик');
};

message.prototype.answer = function (msg) {
    this.bot.sendMessage(this.message.chat.id, msg).catch((error) => console.error(error));
};

message.prototype.reply = function (msg) {
    this.bot.sendMessage(this.message.chat.id, msg, {
        reply_to_message_id: this.message.message_id
    });
};

message.prototype.process = async function () {
    let chat = await models.Chat.getChat(this.message);

    this.chat = chat;
    if (this.message.migrate_to_chat_id) {
        chat.migration(this.message.migrate_to_chat_id);
    }

    if (this.has_text()) {
        if (Math.abs(this.message.date - Math.floor(Date.now() / 1000)) > 20) {
            return;
        }
        await models.Pair.learn(this);

        if (this.hasAnchors() || this.isReplyToBot() || this.randomAnswer() || config.debug) {
            this.bot.sendChatAction(msg.chat.id, 'typing');
            let replyArray = await this.generateAnswer();
            if (!_.size(replyArray) || !_.size(replyArray[0])) {
                return;
            }

            let reply = replyArray.join(' ');

            if (reply) {
                config.debug ? this.reply(reply) : this.answer(reply);
            }
        }
    }
};

message.prototype.generateAnswer = async function () {
    if (!this.chat) {
        this.chat = await models.Chat.getChat(this.message);
    }
    return models.Pair.generate(this);
};

message.prototype.randomAnswer = function () {
    return _.random(0, 100) <= this.chat.get('random_chance');
};

module.exports = message;
