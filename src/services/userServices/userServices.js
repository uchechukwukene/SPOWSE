import env from "../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appErrors.js";
import postModel from "../../models/postModel.js";
import userModel from "../../models/userModel.js";
import likeModel from "../../models/likeModel.js";
import commentModel from "../../models/commentModel.js";
import cloudinary from "../../utils/cloudinary.js";
import notificationModel from "../../models/notificationModel.js";

export const viewProfile = async ({ user }) => {
  const userProfile = await userModel.findOne(user._id).populate({
    path: "posts",
    populate: { path: "comments" }, // Populate comments within posts
  });
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  return userProfile;
};

export const viewUser = async ({ user_id }) => {
  const userProfile = await userModel
    .findById(user_id)
    .select("-password")
    .populate({
      path: "posts",
      populate: { path: "comments" }, // Populate comments within posts
    });
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  return userProfile;
};

export const followUser = async ({ user, userIdToFollow }) => {
  try {
    // Find the user to be followed/unfollowed from the database
    const userToFollow = await userModel.findById(userIdToFollow);

    // Check if the user to be followed/unfollowed exists
    if (!userToFollow) {
      throw new Error("User not found");
    }

    // Check if the current user is already following the user to be followed/unfollowed
    const isFollowing = user.following.includes(userIdToFollow);

    // Toggle follow/unfollow action based on current following status
    if (isFollowing) {
      // If the current user is already following the user to be followed, unfollow them
      // Remove the user to be unfollowed from the current user's following array
      const followingIndex = user.following.indexOf(userIdToFollow);
      if (followingIndex !== -1) {
        user.following.splice(followingIndex, 1);
      }

      // Remove the current user from the user to be unfollowed's followers array
      const followerIndex = userToFollow.followers.indexOf(user._id);
      if (followerIndex !== -1) {
        userToFollow.followers.splice(followerIndex, 1);
      }
    } else {
      // If the current user is not following the user to be followed, follow them
      // Add the user to be followed to the current user's following array
      user.following.push(userIdToFollow);

      // Add the current user to the user to be followed's followers array
      userToFollow.followers.push(user._id);

      // create notification for member
      await notificationModel.create({
        note: `${user.username} followed you`,
        user_id: userToFollow._id,
      });
    }

    // Save the changes to both user documents
    await user.save();
    await userToFollow.save();

    // Return success message
    return {
      message: "Operation successful",
      user: user,
      userToFollow: userToFollow,
    };
  } catch (error) {
    // Handle errors
    console.error(error);
    throw new Error("Failed to follow/unfollow user");
  }
};

export const viewConnection = async ({ user }) => {
  const userProfile = await userModel
    .findOne(user._id)
    .populate({ path: "followers" })
    .populate({ path: "following" });
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  const followers = userProfile.followers;
  const following = userProfile.following;
  return { followers: followers, following: following };
};

export const updateUserProfile = async ({ user, body }) => {
  try {
    const { displayName, bio, avatar, cover_img } = body;

    // Find the user by ID
    const userDetails = await userModel.findById(user._id);

    // Check if user exists
    if (!userDetails) {
      throw new NotFoundError("User not found");
    }

    // Set default displayName if it doesn't exist
    if (!userDetails.displayName) {
      userDetails.displayName = "Default DisplayName"; // or generate a displayName based on your logic
    }

    // Update user's profile fields
    userDetails.displayName = displayName || userDetails.displayName;
    userDetails.bio = bio || userDetails.bio;
    userDetails.avatar = avatar || userDetails.avatar;
    userDetails.cover_img = cover_img || userDetails.cover_img;

    // Save the updated user profile
    await userDetails.save();

    // Create notification for user
    await notificationModel.create({
      note: `You have updated your profile details successfully`,
      user_id: user._id,
    });

    // Return the updated user profile
    return userDetails;
  } catch (e) {
    console.error("error", e);
    throw new BadRequestError("An error occurred");
  }
};

// export const deleteUserProfile = async (user) => {
//   try {
//     // Delete all posts created by the user
//     await postModel.deleteMany({ userId: user._id });

//     // Delete all comments created by the user
//     await commentModel.deleteMany({ userId: user._id });

//     // Delete all likes by the user
//     await likeModel.deleteMany({ userId: user._id });

//     // Remove user ID from mentions in other posts
//     await postModel.updateMany(
//       { mentions: user._id },
//       { $pull: { mentions: user._id } }
//     );

//     // Remove user ID from repostedBy in other posts
//     await postModel.updateMany(
//       { repostedBy: user._id },
//       { $pull: { repostedBy: user._id } }
//     );

//     // Finally, delete the user profile
//     await userModel.findByIdAndDelete(user._id);

//     // Ensure that changes are saved
//     return { message: "User profile and associated data deleted successfully" };
//   } catch (error) {
//     throw new Error(`Failed to delete user profile: ${error.message}`);
//   }
// };

export const deleteUserProfile = async (user) => {
  const userId = user.user._id;
  if (!user || !userId) {
    throw new Error("Invalid user object or user ID");
  }

  try {
    // Delete all posts created by the user
    const deletedPosts = await postModel.deleteMany({ userId });
    console.log(`Deleted ${deletedPosts.deletedCount} posts`);

    // Delete all comments created by the user
    const deletedComments = await commentModel.deleteMany({ userId });
    console.log(`Deleted ${deletedComments.deletedCount} comments`);

    // Delete all likes by the user
    const deletedLikes = await likeModel.deleteMany({ userId });
    console.log(`Deleted ${deletedLikes.deletedCount} likes`);

    // Remove user ID from mentions in other posts
    const updatedMentions = await postModel.updateMany(
      { mentions: userId },
      { $pull: { mentions: userId } }
    );
    console.log(`Updated mentions in ${updatedMentions.modifiedCount} posts`);

    // Remove user ID from repostedBy in other posts
    const updatedReposts = await postModel.updateMany(
      { repostedBy: userId },
      { $pull: { repostedBy: userId } }
    );
    console.log(`Updated repostedBy in ${updatedReposts.modifiedCount} posts`);

    // Finally, delete the user profile
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }

    // Ensure that changes are saved
    return { message: "User profile and associated data deleted successfully" };
  } catch (error) {
    console.error(`Failed to delete user profile: ${error.message}`);
    throw new Error(`Failed to delete user profile: ${error.message}`);
  }
};

export const getUserPoint = async ({ user }) => {
  const userPosts = await postModel
    .find({ userId: user._id })
    // .populate("likes");
  if (!userPosts) {
    throw new NotFoundError("likes not found");
  }
  console.log(userPosts)
  const userComments = await commentModel
    .find({ userId: user._id })
    // .populate("likes");
  if (!userComments) {
    throw new NotFoundError("likes not found");
  }
  // Combine likes from both posts and comments into one array
  let allLikes = [];
  userPosts.forEach((post) => {
    allLikes = allLikes.concat(post.likes);
  });
  userComments.forEach((comment) => {
    allLikes = allLikes.concat(comment.likes);
  });
  const likeCount = allLikes.length;
  const points = likeCount / 10;
  user.likes = likeCount;
  user.points = points;
  await user.save();

  return { points, likeCount, user };
};

export const search = async (query, queryPage, queryLimit) => {
  if (!query) {
    throw new Error("Query is required");
  }

  // Parse page and limit from the query parameters, defaulting to 1 and 10 respectively
  const page = queryPage ? parseInt(queryPage, 10) : 1;
  const limit = queryLimit ? parseInt(queryLimit, 10) : 10;
  const skip = (page - 1) * limit;

  try {
    // Perform searches in parallel
    const [userResults, postResults] = await Promise.all([
      userModel.find({
        $or: [
          { username: new RegExp(query, "i") }, // Search usernames
          { displayName: new RegExp(query, "i") }, // Search displayName
          { bio: new RegExp(query, "i") }, // Search bios
        ],
      }),
      postModel.find({
        $or: [
          { content: new RegExp(query, "i") }, // Search post content
          { hashtags: new RegExp(query, "i") }, // Search hashtags
        ],
      }),
    ]);

    // Combine users and posts into a single array
    const combinedResults = [
      ...userResults.map((user) => ({ type: "user", ...user.toObject() })),
      ...postResults.map((post) => ({ type: "post", ...post.toObject() })),
    ];

    // Calculate total number of combined results
    const totalCombinedResults = combinedResults.length;

    // Apply pagination to the combined results
    const paginatedResults = combinedResults.slice(skip, skip + limit);

    // Calculate total number of pages for the combined results
    const totalPages = Math.ceil(totalCombinedResults / limit);

    // Return paginated combined results
    return {
      currentPage: page,
      totalPages,
      totalResults: totalCombinedResults,
      results: paginatedResults,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getLeaderBoard = async ({ query, user }) => {
  const { search, page = 1, limit = 10 } = query;
  // Build the search query
  const searchQuery = search
    ? { username: { $regex: search, $options: "i" } }
    : {};

  try {
    // Find all users to calculate positions
    const allUsers = await userModel
      .find(searchQuery, "username points avatar")
      .sort({ points: -1 });

    if (!allUsers.length) {
      throw new BadRequestError("No leaderboard found");
    }

    // Add positions to all users based on their points
    const allUsersWithPosition = allUsers.map((user, index) => ({
      position: index + 1,
      ...user._doc,
    }));

    // Calculate pagination
    const skip = (page - 1) * limit;
    const paginatedUsers = allUsersWithPosition.slice(skip, skip + limit);

    // Calculate total number of pages
    const totalPages = Math.ceil(allUsersWithPosition.length / limit);

    // Find the current user's points and position if the user object is provided
    let currentUserPoints = null;
    let currentUserPosition = null;
    let currentUserName = null;
    let currentUserAvatar = null;
    let currentUser_Id = null;
    if (user && user._id) {
      const currentUserId = user._id.toString();
      const currentUser = allUsersWithPosition.find(
        (u) => u._id.toString() === currentUserId
      );
      if (currentUser) {
        currentUserPoints = currentUser.points;
        currentUserPosition = currentUser.position;
        currentUserName = currentUser.username;
        currentUserAvatar = currentUser.avatar;
        currentUser_Id = currentUser._id;
      }
    }

    return {
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      leaderboard: paginatedUsers,
      currentUser: {
        points: currentUserPoints,
        position: currentUserPosition,
        name: currentUserName,
        avatar: currentUserAvatar,
        _id: currentUser_Id,
      },
    };
  } catch (error) {
    throw new BadRequestError(error.message || "Error fetching leaderboard");
  }
};

// export const getLeaderBoard = async ({ query, user }) => {
//   const { search, page = 1, limit = 10 } = query;
//   const searchQuery = search ? { username: { $regex: search, $options: "i" } } : {};

//   try {
//     // Find all users matching the search query
//     const allUsers = await userModel.find(searchQuery, "username avatar").lean();

//     if (!allUsers.length) {
//       throw new BadRequestError("No leaderboard found");
//     }

//     // Calculate points for each user
//     for (const eachUser of allUsers) {
//       const { points } = await getUserPoint({ user: eachUser });
//       eachUser.points = points;
//     }

//     // Sort users by points in descending order
//     allUsers.sort((a, b) => b.points - a.points);

//     // Add positions to all users based on their points
//     const allUsersWithPosition = allUsers.map((user, index) => ({
//       position: index + 1,
//       ...user,
//     }));

//     // Calculate pagination
//     const skip = (page - 1) * limit;
//     const paginatedUsers = allUsersWithPosition.slice(skip, skip + limit);

//     // Calculate total number of pages
//     const totalPages = Math.ceil(allUsersWithPosition.length / limit);

//     // Find the current user's points and position if the user object is provided
//     let currentUserPoints = null;
//     let currentUserPosition = null;
//     let currentUserName = null;
//     let currentUserAvatar = null;
//     let currentUser_Id = null;

//     if (user && user._id) {
//       const currentUserId = user._id.toString();
//       const currentUser = allUsersWithPosition.find(
//         (u) => u._id.toString() === currentUserId
//       );
//       if (currentUser) {
//         currentUserPoints = currentUser.points;
//         currentUserPosition = currentUser.position;
//         currentUserName = currentUser.username;
//         currentUserAvatar = currentUser.avatar;
//         currentUser_Id = currentUser._id;
//       }
//     }

//     return {
//       currentPage: page,
//       totalPages: totalPages,
//       limit: limit,
//       leaderboard: paginatedUsers,
//       currentUser: {
//         points: currentUserPoints,
//         position: currentUserPosition,
//         name: currentUserName,
//         avatar: currentUserAvatar,
//         _id: currentUser_Id,
//       },
//     };
//   } catch (error) {
//     throw new BadRequestError(error.message || "Error fetching leaderboard");
//   }
// };
