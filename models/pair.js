'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pair = sequelize.define('Pair', {

  }, {
    classMethods: {
      associate: function(models) {
        Pair.belongsTo(models.Chat);
        Pair.belongsTo(models.Word, {as: 'first'});
        Pair.belongsTo(models.Word, {as: 'second'});
        Pair.hasMany(models.Reply);
      }
    }
  });
  return Pair;
};