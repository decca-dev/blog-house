const User = require("../models/User");
const Post = require("../models/Post");
const Log = require("../models/Log");

const timeout = 3600000; // 1 hour

module.exports.findUser = async (id) => {
  const user = await User.findOne({ uid: id });
  return user;
};

module.exports.findUserPosts = async (id) => {
  const posts = await Post.find({ author: id });
  return posts;
};

module.exports.followUser = async (userID, toFollowID) => {
  const guy = await User.findOne({ uid: userID });
  const guyToFollow = await User.findOne({ uid: toFollowID });

  guy.following.push(guyToFollow.uid);
  guyToFollow.followers.push(guy.uid);

  await guy.save();
  await guyToFollow.save();
};

module.exports.unfollowUser = async (userID, toUnfollowID) => {
  const guy = await User.findOne({ uid: userID });
  const guyToUnfollow = await User.findOne({ uid: toUnfollowID });

  for (let i = 0; i < guyToUnfollow.followers.length; i++) {
    if (guyToUnfollow.followers[i] === guy.uid) {
      guyToUnfollow.followers.splice(i, 1);
    }
  }

  for (let i = 0; i < guy.following.length; i++) {
    if (guy.following[i] === guyToUnfollow.uid) {
      guy.following.splice(i, 1);
    }
  }


  await guy.save();
  await guyToUnfollow.save();
};

module.exports.log = async (category, actionType, by, on, reason) => {
  const log = new Log({
    category: category,
    actionType: actionType,
    by: by,
    onUser: on,
    reason: reason,
  });

  await log.save();
};

module.exports.promote = async (user, toPromote, reason) => {
  const dude = await User.findOne({ uid: toPromote });
  dude.isAdmin = true;
  await dude.save();

  const log = new Log({
    actionType: "User Promotion",
    by: user.uid,
    onUser: toPromote,
    reason: reason,
  });

  await log.save();
};

module.exports.demote = async (user, toDemote, reason) => {
  const dude = await User.findOne({ uid: toDemote });
  dude.isAdmin = false;
  await dude.save();

  const log = new Log({
    actionType: "User Demotion",
    by: user.uid,
    onUser: toDemote,
    reason: reason,
  });

  await log.save();
};

module.exports.posRep = async (user, toRep, req) => {
  const dude = await User.findOne({ uid: user }),
    guyToRep = await User.findOne({ uid: toRep });

  const dudeAge = new Date(dude.registeredAt).getTime();

  if (timeout - (Date.now() - dudeAge) > 0) {
    let time = ms(timeout - (Date.now() - dudeAge));
    return req.flash(
      "error_msg",
      `Your account is too young. You still have ${time} left until you can Rep someone!`
    );
  }

  if (dude.hasNegRepped.includes(guyToRep.uid)) {
    return req.flash(
      "error_msg",
      `You already added a negative rep to this user!`
    );
  }

  if (!dude.hasPosRepped.includes(guyToRep.uid)) {
    guyToRep.posRep += 1;
    dude.hasPosRepped.push(guyToRep.uid);
    await dude.save();
    await guyToRep.save();
    req.flash(
      "success_msg",
      `Successfully added 1 postive rep point to ${guyToRep.name}`
    );
  } else {
    guyToRep.posRep -= 1;
    dude.hasPosRepped.splice(0, guyToRep.uid);
    await dude.save();
    await guyToRep.save();
    req.flash(
      "success_msg",
      `Successfully removed 1 postive rep point from ${guyToRep.name}`
    );
  }
};

module.exports.negRep = async (user, toRep, req) => {
  const dude = await User.findOne({ uid: user }),
    guyToRep = await User.findOne({ uid: toRep });

  const dudeAge = new Date(dude.registeredAt).getTime();

  if (timeout - (Date.now() - dudeAge) > 0) {
    let time = ms(timeout - (Date.now() - dudeAge));
    return req.flash(
      "error_msg",
      `Your account is too young. You still have ${time} left until you can Rep someone!`
    );
  }

  if (dude.hasPosRepped.includes(guyToRep.uid)) {
    return req.flash(
      "error_msg",
      `You already added a positive rep to this user!`
    );
  }

  if (!dude.hasNegRepped.includes(guyToRep.uid)) {
    guyToRep.negRep += 1;
    dude.hasNegRepped.push(guyToRep.uid);
    await dude.save();
    await guyToRep.save();
    req.flash(
      "success_msg",
      `Successfully added 1 negative rep point to ${guyToRep.name}`
    );
  } else {
    guyToRep.negRep -= 1;
    dude.hasNegRepped.splice(0, guyToRep.uid);
    await dude.save();
    await guyToRep.save();
    req.flash(
      "success_msg",
      `Successfully removed 1 negative rep point from ${guyToRep.name}`
    );
  }
};

module.exports.removeFromSeen = async (slug, userID) => {
  const post = await Post.findOne({ slug: slug });

  for (let i = 0; i < post.seenBy.length; i++) {
    if (post.seenBy[i] === userID) {
      post.seenBy.splice(i, 1);
    }
  }

  await post.save();
}

module.exports.deleteAccount = async (userID) => {
  const dude = await User.findOne({ uid: userID });

  const users = await User.find();
  for (let i = 0; i < users.length; i++){
    if (users[i].followers.includes(dude.uid)) {
      await unfollowUser(dude.uid, users[i].uid)
    }else if (users[i].following.includes(dude.uid)) {
      await unfollowUser(users[i].uid, dude.uid)
    }
  }

  const posts = await Post.find();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].seenBy.includes(dude.uid)) {
      await removeFromSeen(posts[i].slug, dude.uid)
    }
  }

  const logs = await Log.find();
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].by === dude.uid) {
      Log.findOneAndDelete({ _id: logs[i]._id });
    }else if (logs[i].onUser === dude.uid) {
      Log.findOneAndDelete({ _id: logs[i]._id });
    }
  }

  await User.findOneAndDelete({ uid: userID });
}