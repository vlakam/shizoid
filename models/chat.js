"use strict";

module.exports = function (sequelize, DataTypes) {
  let Chat = sequelize.define(
    "Chat",
    {
      telegram_id: DataTypes.STRING,
      chat_type: DataTypes.ENUM("private", "group", "supergroup"),
      random_chance: {
        type: DataTypes.INTEGER(2),
        defaultValue: 10,
      },
    },
    {
      indexes: [
        {
          fields: ["telegram_id"]
        },
      ],
      classMethods: {
        associate: function (models) {
          Chat.hasMany(models.Pair);
        },
        getChat: async function (tg_message) {
          let chat = tg_message.chat;
          let tg_id = chat.id;
          let response = await Chat.findOrCreate({
            where: {
              telegram_id: tg_id.toString(),
            },
          });

          return response[0];
        },
      },
    }
  );
  return Chat;
};
