const Logger = require('./Logger')
const time = 864000000;

module.exports.log = async () => {
    const Log = require('../models/Log');

    const logs = await Log.find({});

    if (logs.length > 0) {
        for (let i = 0; i < logs.length; i++) {
            const expiration = new Date(logs[i].at).getTime() + time;

            if (Date.now() >= expiration) {
                Logger.db(`Deleting log document with the id ${logs[i]._id}...`, 'system')
                Log.deleteOne({ at: logs[i].at }, function(err){
                    if (err) {
                        return Logger.error(`There was an error attempting to delete log document with the id ${logs[i]._id}.\n${err}`, 'system')
                    }else {
                        Logger.success(`Successfully deleted a log document that was older than 10 days!`, 'system')
                    }
                })
            }else {
                return;
            }
        }
    }
}

module.exports.user = async () => {
    const User = require('../models/User');

    const users = await User.find({});

    if (users.length > 0) {
        for (let i = 0; i < users.length; i++) {

            if (users[i].isBanned) {
                const expiration = new Date(users[i].bannedAt).getTime() + time;

                if (Date.now() >= expiration) {
                    Logger.db(`Deleting user document with the id ${users[i]._id}...`, 'system')
                    User.deleteOne({ bannedAt: users[i].bannedAt }, function(err){
                        if (err) {
                            return Logger.error(`There was an error attempting to delete user document with the id ${users[i]._id}.\n${err}`, 'system')
                        }else {
                            Logger.success(`Successfully deleted a user document that was older than 10 days!`, 'system')
                        }
                    })
                }else {
                    return;
                }
            }
        }
    }
}