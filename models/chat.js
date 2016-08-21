'use strict';
module.exports = function(sequelize, DataTypes) {
  var Chat = sequelize.define('Chat', {
    telegram_id: DataTypes.INTEGER(8),
    chat_type: DataTypes.INTEGER(1),
    random_chance: DataTypes.INTEGER(2)
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Chat;
};