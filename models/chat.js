'use strict';
const { chatTypes } = require('../app/chatTypes.js');

module.exports = function (sequelize, DataTypes) {
  var Chat = sequelize.define('Chat', {
    telegram_id: DataTypes.INTEGER(8),
    chat_type: DataTypes.ENUM('private', 'group', 'supergroup'),
    random_chance: {
      type: DataTypes.INTEGER(2),
      defaultValue: 50
    }
  }, {
      classMethods: {
        associate: function (models) {
          Chat.hasMany(models.Pair);
        },
        getChat: function (tg_message) {
          var chat = tg_message.chat;
          var tg_id = chat.id;
          return Chat.findOrCreate({
            where: {
              telegram_id: tg_id,
              chat_type: chat.type
            }, defaults: {}
          });//promise??
        }
      },
      instanceMethods: {
        migration: function (chatId) {
          this.update({ telegram_id: chatId })
            .then(function (data) { console.log('Succesfully migrated to ' + chatId) })
            .catch(function () {
              console.log('Failed to migrate to chatId.');
            });
        }
      }
    });
  return Chat;
};