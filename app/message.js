const {config} = require('../config/config.js');
const models = require('../models');
const _ = require('lodash');


function message(bot, msg) {
    let self = this;
    this.bot = bot;
    this.message = msg;
    models.Chat.getChat(msg).then(function (chatInst) {
        self.chat = chatInst[0];
        if (msg.migrate_to_chat_id) {
            chatInst.migration(msg.migrate_to_chat_id);
        }

        if (self.has_text()) {
            self.text = msg.text;
            self.words = self.get_words();
            self.process();
        }
    });
}

message.prototype.has_text = function () {
    return this.message.text;
};

message.prototype.get_words = function () {
    return _.map(_.split(this.getTextWithoutEntities(), /\s+?|\\n/), (word) => {
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
        reply_to_message_id: this.message.message.id
    });
};

message.prototype.process = async function () {
    await models.Pair.learn(this);
    if (this.hasAnchors() || this.isReplyToBot() || this.randomAnswer() || config.debug) {
        let replyArray = await models.Pair.generate(this);
        if (!_.size(replyArray)) {
            return;
        }

        let reply = replyArray.join(' ');

        if (reply) {
            this.answer(reply);
        }
    }
};

message.prototype.randomAnswer = function () {
    return _.random(0, 100) <= this.chat.dataValues.random_chance;
};

module.exports = message;