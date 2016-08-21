const { config } = require('../config/config.js');
const models = require('../models');


function message(bot, msg) {
    var self = this;
    this.bot = bot;
    this.message = msg;
    models.Chat.getChat(msg).spread(function (chatInst) {
        if( msg.migrate_to_chat_id ) {
            chatInst.migration(msg.migrate_to_chat_id);
        }
        if( self.has_text() ) {
            self.text = msg.text;
            if( _.startsWith(self.text, '/')) {
                self.command = get_command();
            }
            self.words = self.get_words();
        }
    
    });
}

message.prototype.has_text = function () {
    return this.message.text;
}

message.prototype.get_words() = function () {
    var words = _(this.getTextWithoutEntities()
    .replace(/\n|\r/, '')
    .split(/\b/))
    .map(function (word) {
        return _.trim(word);
    })
    .filter(function (word) {
        return word.length > 0 && word.chatAt(0) !== '@';
    })
    .map(function (word) {
        return _.lowerCase(word);
    }).value();
    ;
}

message.prototype.get_command() = function () {

}

message.prototype.getTextWithoutEntities() = function () {
    var text = _.clone(this.text);
    _.each(this.message.entitites, function (entity) {
        text.replace(text.substring(entity.offset, entity.length), '');
    });
    return text;
}

module.exports.message = message;