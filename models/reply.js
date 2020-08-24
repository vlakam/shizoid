"use strict";
module.exports = function (sequelize, DataTypes) {
  var Reply = sequelize.define(
    "Reply",
    {
      counter: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        {
          fields: ["PairId"],
        },
      ],
      classMethods: {
        associate: function (models) {
          Reply.belongsTo(models.Pair);
          Reply.belongsTo(models.Word);
        },
      },
    }
  );
  return Reply;
};
