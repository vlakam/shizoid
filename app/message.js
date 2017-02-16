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
    var words = _(this.getTextWithoutEntities()
        .replace(/\n|\r/, '')
        .split(' '))
        .map(function (word) {
            return _.trim(word);
        })
        .filter(function (word) {
            return word.length > 0 && word[0] !== '@';
        })
        .map(function (word) {
            return _.lowerCase(word);
        }).value();
    console.log(words);
    return words;
};


message.prototype.getTextWithoutEntities = function () {
    var text = _.clone(this.text);
    _.each(this.message.entitites, function (entity) {
        text.replace(text.substring(entity.offset, entity.length), '');
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
    this.bot.sendMessage(this.message.chat.id, msg);
};

message.prototype.reply = function (msg) {
    this.bot.sendMessage(this.message.chat.id, msg, {
        reply_to_message_id: this.message.message.id
    });
};

message.prototype.process = function () {
    models.Pair.learn(this);
    if(this.hasAnchors() || this.isReplyToBot() || this.randomAnswer()) {
        models.Pair.generate(this).then(function (replyArray) {
            if(!_.size(replyArray)) {
                return;
            }

            let reply = replyArray.join(' ');

            if(reply) {
                this.answer(reply);
            }
        });
    }
};

message.prototype.randomAnswer = function () {
    return Math.random() * 100 >= this.chat.dataValues.random_chance;
};

module.exports = message;