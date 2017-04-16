'use strict';

'use strict';
module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define('User', {
        telegram_id: DataTypes.STRING,
        banned: DataTypes.BOOLEAN
    }, {
        classMethods: {
            getUser: async function (id) {
                let user = await
                this.findOrCreate({
                    where: {
                        telegram_id: id.toString()
                    }
                });


                return user[0];
            }
        }
    });
    return User;
};