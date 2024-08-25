import env from "../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnAuthorizedError,
} from "../../lib/appErrors.js";
import postModel from "../../models/postModel.js";
import likeModel from "../../models/likeModel.js";
import commentModel from "../../models/commentModel.js";
import userModel from "../../models/userModel.js";
import { getUserPoint } from "../userServices/userServices.js";
import notificationModel from "../../models/notificationModel.js";
import mongoose from "mongoose";

export const makePost = async ({ user, body }) => {
  const hashtagRegex = /#[\w-]+/g;

  const mentionRegex = /@(\w+)/g;

  const hashtags = body.content.match(hashtagRegex) || [];

  const mentionMatches = body.content.match(mentionRegex) || [];
  const mentions = [];

  for (const match of mentionMatches) {
    const username = match.slice(1);

    const mentionedUser = await userModel.findOne({ username });

    if (mentionedUser) {
      mentions.push(mentionedUser._id);
    }
  }

  // Prepare post data
  const postData = {
    userId: user._id,
    content: body.content,
    media: body.media,
    hashtags,
    mentions,
  };

  // Create the new post
  const newPost = await postModel.create(postData);

  if (!newPost) {
    throw new InternalServerError(
      "Failed to create post. Please try again later."
    );
  }

  user.posts.push(newPost._id);

  await user.save();

  // create notification for member
  await notificationModel.create({
    note: `You have successfully  created a new post`,
    user_id: user._id,
  });

  return newPost;
};

export const viewMyPosts = async ({ user, query }) => {
  const { limit = 10, page = 1 } = query;
  const skip = (page - 1) * limit;

  try {
    const myPosts = await postModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 }) // Sorting posts by creation date, most recent first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "originalPostId",
        populate: {
          path: "userId",
          select: "username avatar",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "username avatar",
        },
      })
      .populate("userId", "username avatar");

    if (!myPosts || myPosts.length === 0) {
      throw new NotFoundError("No posts found");
    }

    const totalPosts = await postModel.countDocuments({ userId: user._id });
    const totalPages = Math.ceil(totalPosts / limit);

    return {
      page,
      limit,
      totalPages,
      totalPosts,
      posts: myPosts,
    };
  } catch (error) {
    console.error("Failed to fetch user's posts:", error);
    throw new Error(`Failed to fetch user's posts: ${error.message}`);
  }
};

export const viewAllPosts = async ({ page, limit }) => {
  try {
    // Parse page and limit parameters to integers, defaulting to 1 and 10 respectively
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    // Calculate the number of documents to skip based on the current page and page size
    const skip = (pageNumber - 1) * pageSize;

    // Fetch posts and total post count concurrently
    const [posts, totalPosts] = await Promise.all([
      postModel
        .find({})
        .sort({ createdAt: -1 }) // Sort posts by creation date in descending order
        .skip(skip) // Skip the documents based on the calculated skip value
        .limit(pageSize) // Limit the number of documents returned to pageSize
        .lean() // Use lean queries for better performance
        .populate({
          path: "originalPostId",
          populate: {
            path: "userId",
            select: "username avatar", // Populate original post's user details
          },
        })
        .populate({
          path: "comments",
          populate: {
            path: "userId",
            select: "username avatar", // Populate comment's user details
          },
        })
        .populate("userId", "username avatar"), // Populate post's user details
      postModel.countDocuments(), // Count the total number of posts
    ]);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalPosts / pageSize);

    // Return posts along with metadata
    return {
      totalPosts,
      currentPage: pageNumber,
      totalPages,
      posts,
    };
  } catch (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const viewFollowersPost = async ({ user, page, limit }) => {
  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    // Calculate the skip value based on the page and limit
    const skip = (pageNumber - 1) * pageSize;

    // Find the users followed by the current user
    const userId = user._id;
    const followingUsers = await userModel.findById(userId).select("following");

    // Extract the IDs of the users followed by the current user
    const followingUserIds = followingUsers.following;

    // Fetch posts from the database made by users followed by the current user,
    // sorted by createdAt field in descending order (newest first)
    const [posts, totalPosts] = await Promise.all([
      postModel
        .find({ userId: { $in: followingUserIds } }) // Find posts by users followed by the current user
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: "originalPostId",
          populate: {
            path: "userId",
            select: "username avatar",
          },
        })
        .populate({
          path: "comments",
          populate: {
            path: "userId",
            select: "username avatar",
          },
        })
        .populate("userId", "username avatar"),
      postModel.countDocuments({ userId: { $in: followingUserIds } }), // Count total posts by users followed by the current user
    ]);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalPosts / pageSize);

    // Return posts along with total posts count, current page number, and total pages
    return {
      totalPosts,
      currentPage: pageNumber,
      totalPages,
      posts,
    };
  } catch (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const viewSinglePost = async ({ post_id }) => {
  const post = await postModel
    .findById(post_id)
    .populate({
      path: "originalPostId",
      populate: {
        path: "userId",
        select: "username avatar",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "userId",
        select: "username avatar",
      },
    })
    .populate("userId", "username avatar");
  if (!post) throw new NotFoundError("Post not found");

  return post;
};

export const likePost = async ({ user, post_id }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await postModel.findById(post_id).session(session);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    const like = await likeModel
      .findOne({
        postId: post_id,
        userId: user._id,
      })
      .session(session);

    let updatedPost;
    if (like) {
      await likeModel.findByIdAndDelete(like._id).session(session);
      updatedPost = await postModel.findByIdAndUpdate(
        post_id,
        { $pull: { likes: user._id } },
        { new: true, session }
      );
    } else {
      await likeModel.create(
        [
          {
            postId: post_id,
            userId: user._id,
            type: "comment",
          },
        ],
        { session }
      );

      updatedPost = await postModel.findByIdAndUpdate(
        post_id,
        { $push: { likes: user._id } },
        { new: true, session }
      );

      await notificationModel.create(
        [
          {
            note: `${user.username} liked your post`,
            user_id: post.userId,
          },
        ],
        { session }
      ); 
    }

    await session.commitTransaction();
    session.endSession();

    const updatedUser = await userModel.findById(post.userId);
    await getUserPoint({ user: updatedUser });

    return updatedPost;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to like/unlike post: ${error.message}`);
  }
};

export const repostPost = async ({ user, post_id, body }) => {
  try {
    // Find the original post
    const originalPost = await postModel.findById(post_id);
    if (!originalPost) {
      throw new NotFoundError("Original post not found");
    }
    const hashtagRegex = /#[\w-]+/g;

    const mentionRegex = /@(\w+)/g;

    const hashtags = body.content.match(hashtagRegex) || [];

    const mentionMatches = body.content.match(mentionRegex) || [];
    const mentions = [];

    for (const match of mentionMatches) {
      const username = match.slice(1);

      const mentionedUser = await userModel.findOne({ username });

      if (mentionedUser) {
        mentions.push(mentionedUser._id);
      }
    }

    // Create the repost post object
    const repostPost = new postModel({
      userId: user._id,
      content: body.content || originalPost.content,
      media: body.media || originalPost.media,
      originalPostId: post_id,
      hashtags,
      mentions,
    });

    // Save the repost post
    const savedRepostPost = await repostPost.save();
    if (!savedRepostPost) {
      throw new InternalServerError("Failed to save repost post");
    }

    // Update the original post to track the users who reposted it
    originalPost.repostedBy.push(user._id);
    await originalPost.save();

    // create notification for member
    await notificationModel.create({
      note: `${user.username} reposted your post`,
      user_id: originalPost.userId,
    });
    return savedRepostPost;
  } catch (error) {
    throw new Error(`Failed to repost post: ${error.message}`);
  }
};

export const createComment = async ({ post_id, user, body }) => {
  try {
    // Step 1: Find the Post using Post ID
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    // Step 2: Create a New Comment
    const hashtagRegex = /#[\w-]+/g;

    const mentionRegex = /@(\w+)/g;

    const hashtags = body.content.match(hashtagRegex) || [];

    const mentionMatches = body.content.match(mentionRegex) || [];
    const mentions = [];

    for (const match of mentionMatches) {
      const username = match.slice(1);

      const mentionedUser = await userModel.findOne({ username });

      if (mentionedUser) {
        mentions.push(mentionedUser._id);
      }
    }
    const commentData = {
      postId: post_id,
      userId: user._id,
      content: body.content,
      hashtags,
      mentions,
    };

    const newComment = await commentModel.create(commentData);

    // Step 3: Save the Comment to the Comment Model
    if (!newComment) {
      throw new BadRequestError("Failed to create comment");
    }

    // Step 4: Update the Post Model with the Comment ID
    post.comments.push(newComment._id);

    // Step 5: Save the Updated Post
    await post.save();

    // create notification for member
    await notificationModel.create({
      note: `${user.username} commented on your post`,
      user_id: post.userId,
    });

    return newComment;
  } catch (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }
};

export const likeComment = async ({ user, comment_id }) => {
  try {
    // Find the comment
    const comment = await commentModel.findById(comment_id);
    if (!comment) {
      throw new NotFoundError("comment not found");
    }

    // Find the like document in the likes model
    const like = await likeModel.findOne({
      postId: comment_id,
      userId: user._id,
    });

    // Check if the like already exists
    if (like) {
      // If like exists, remove it from the likes model
      await likeModel.findByIdAndDelete(like._id);

      // Remove the like ID from the comment.likes array
      const indexToRemove = comment.likes.indexOf(like._id);
      if (indexToRemove !== -1) {
        comment.likes.splice(indexToRemove, 1);
      }
    } else {
      // Create a new like document
      const newLike = await likeModel.create({
        postId: comment_id,
        userId: user._id,
        type: "comment",
      });

      // Add the like ID to the comment.likes array
      comment.likes.push(newLike._id);

      // create notification for member
      await notificationModel.create({
        note: `${user.username} liked your comment`,
        user_id: comment.userId,
      });
    }

    // Save the updated post
    await comment.save();
    const updatedUser = await userModel.findById(comment.userId);
    const { points } = await getUserPoint({ user: updatedUser });

    // Return the updated post
    return { comment, points };
  } catch (error) {
    throw new Error(`Failed to like/unlike a comment: ${error.message}`);
  }
};

export const viewPostComment = async ({ post_id, comment_id }) => {
  try {
    // Find the post
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Find the specific comment within the post's comments array
    const comment = post.comments.find((comment) => comment.equals(comment_id));
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const postComment = await commentModel.findById(comment);

    // Return the comment
    return { post: post, comment: postComment };
  } catch (error) {
    throw new Error(`Failed to fetch comment: ${error.message}`);
  }
};

export const viewAllPostComment = async ({ post_id, page, limit }) => {
  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    // Find the post
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Calculate skip value based on page and limit
    const skip = (pageNumber - 1) * pageSize;

    // Find all comments associated with the post, paginated
    const [comments, totalComments] = await Promise.all([
      commentModel
        .find({ postId: post_id })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .skip(skip)
        .limit(pageSize),
      commentModel.countDocuments({ postId: post_id }),
    ]);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalComments / pageSize);

    // Return the post along with the paginated comments and pagination metadata
    return {
      currentPage: pageNumber,
      totalPages: totalPages,
      totalComments: totalComments,
      post: post,
      comments: comments,
    };
  } catch (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }
};

export const deletePost = async ({ user, post_id }) => {
  try {
    // Find the post to be deleted
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Delete all associated comments
    await commentModel.deleteMany({ postId: post_id });

    // Delete all associated likes
    await likeModel.deleteMany({ postId: post_id });

    // Delete all associated reposts
    await postModel.deleteMany({ originalPostId: post_id });

    // Remove post ID from any original posts
    await postModel.updateMany(
      { originalPostId: post_id },
      { $unset: { originalPostId: 1 } }
    );

    // Remove post ID from any mentions
    await userModel.updateMany(
      { mentions: post_id },
      { $pull: { mentions: post_id } }
    );

    // Remove post ID from any hashtags
    await userModel.updateMany(
      { hashtags: post_id },
      { $pull: { hashtags: post_id } }
    );

    // Remove post ID from any reposts
    await userModel.updateMany(
      { repostedBy: post_id },
      { $pull: { repostedBy: post_id } }
    );

    // Finally, delete the post
    await postModel.findByIdAndDelete(post_id);

    // Remove post ID from the user's posts array
    await userModel.findByIdAndUpdate(
      user._id,
      { $pull: { posts: post_id } }
    );

    const updatedUser = await userModel.findById(user._id);
    const { points } = await getUserPoint({ user: updatedUser });

    return {
      message: "Post and associated items deleted successfully",
      points,
    };
  } catch (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

export const deleteComment = async ({ user, post_id, comment_id }) => {
  try {
    // Find the post by its ID
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Find the specific comment within the post's comments array
    const commentIndex = post.comments.findIndex((comment) =>
      comment.equals(comment_id)
    );
    if (commentIndex === -1) {
      throw new NotFoundError("Comment not found");
    }

    // Check if the user is authorized to delete the comment
    const comment = await commentModel.findById(comment_id);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // Ensure the user is either the author of the comment or the post
    const postOwnerId = post.userId.toString(); 
    const commentOwnerId = comment.userId.toString(); 

    if (
      commentOwnerId !== user._id.toString() &&
      postOwnerId !== user._id.toString()
    ) {
      throw new UnAuthorizedError(
        "You are not authorized to delete this comment"
      );
    }
    // Remove the comment from the post's comments array
    post.comments.splice(commentIndex, 1);

    // Save the updated post
    await post.save();

    // Delete the comment document itself from the commentModel
    await commentModel.findByIdAndDelete(comment_id);

    // Return a success message
    return { message: "Comment deleted successfully" };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};
