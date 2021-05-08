const User = require('../models/User');
const Post = require('../models/Post');
const Log = require('../models/Log');

module.exports.findUser = async (id) => {
    const user = await User.findOne({ uid: id });
    return user
};

module.exports.findUserPosts = async (id) => {
    const posts = await Post.find({ author: id });
    return posts
}

module.exports.followUser = async (userID, toFollowID) => {
    const guy = await User.findOne({ uid: userID });
    const guyToFollow = await User.findOne({ uid: toFollowID });

    guy.following.push(guyToFollow.uid);
    guyToFollow.followers.push(guy.uid);

    await guy.save();
    await guyToFollow.save();
}

module.exports.unfollowUser = async (userID, toUnfollowID) => {
    const guy = await User.findOne({ uid: userID });
    const guyToUnfollow = await User.findOne({ uid: toUnfollowID });

    guy.following.splice(0, guyToUnfollow.uid);
    guyToUnfollow.followers.splice(0, guy.uid);

    await guy.save();
    await guyToUnfollow.save();
}

module.exports.log = async (actionType, by, on, reason) => {
    const log = new Log({
        actiontype: actionType,
        by: by,
        onUser: on,
        reason: reason
    })

    await log.save();
}

module.exports.promote = async (user, toPromote, reason) => {
    const dude = await User.findOne({ uid: toPromote });
    dude.isAdmin = true;
    await dude.save();

    const log = new Log({
        actiontype: 'User Promotion',
        by: user.uid,
        onUser: toPromote,
        reason: reason
    })

    await log.save();
}

module.exports.demote = async (user, toDemote, reason) => {
    const dude = await User.findOne({ uid: toDemote });
    dude.isAdmin = false;
    await dude.save();

    const log = new Log({
        actiontype: 'User Demotion',
        by: user.uid,
        onUser: toDemote,
        reason: reason
    })

    await log.save();
}

module.exports.posRep = async (user, toRep) => {
    const dude = await User.findOne({ uid: user.uid }),
    guyToRep = await User.findOne({ uid: toRep.uid });

    if (!dude.hasPosRepped.includes(guyToRep.uid)) {
        guyToRep.posRep += 1;
        dude.hasPosRepped.push(guyToRep.uid);
        await dude.save();
        await guyToRep.save();
    }else {
        guyToRep.posRep -= 1;
        dude.hasPosRepped.slice(0, guyToRep.uid);
        await dude.save();
        await guyToRep.save();
    }
}

module.exports.negRep = async (user, toRep) => {
    const dude = await User.findOne({ uid: user.uid }),
    guyToRep = await User.findOne({ uid: toRep.uid });

    if (!dude.hasNegRepped.includes(guyToRep.uid)) {
        guyToRep.negRep += 1;
        dude.hasNegRepped.push(guyToRep.uid);
        await dude.save();
        await guyToRep.save();
    }else {
        guyToRep.negRep -= 1;
        dude.hasNegRepped.slice(0, guyToRep.uid);
        await dude.save();
        await guyToRep.save();
    }
}