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