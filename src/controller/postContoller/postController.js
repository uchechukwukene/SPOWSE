import appResponse from "../../lib/appResponse.js";
import {
  createComment,
  deleteComment,
  deletePost,
  likeComment,
  likePost,
  makePost,
  repostPost,
  viewAllPostComment,
  viewAllPosts,
  viewFollowersPost,
  viewMyPosts,
  viewPostComment,
  viewSinglePost,
} from "../../services/postServices/postServices.js";

export const makePostHandler = async (req, res) => {
  const { body, user } = req;

  const newPost = await makePost({ body, user });

  res.send(appResponse("Succefully made a new post", newPost));
};

export const viewMyPostHandler = async (req, res) => {
  const { user, query } = req;

  const post = await viewMyPosts({ user, query });

  res.send(appResponse("viewing my post successfully", post));
};

export const createCommentHandler = async (req, res) => {
  const { body, user } = req;
  const { post_id } = req.params;

  const newPost = await createComment({ body, user, post_id });

  res.send(appResponse("Succefully made a comment", newPost));
};

export const viewAllPostsHandler = async (req, res) => {
  const { page, limit } = req.query;
  const posts = await viewAllPosts({ page, limit });

  res.send(appResponse("Fatched all post succefully", posts));
};

export const viewFollowersPostHandler = async (req, res) => {
  const { page, limit } = req.query;
  const { user } = req;
  const posts = await viewFollowersPost({ page, limit, user });

  res.send(appResponse("Fatched all users following post succefully", posts));
};

export const viewSinglePostHandler = async (req, res) => {
  const { post_id } = req.params;

  const post = await viewSinglePost({ post_id });

  res.send(appResponse("viewing single post successfully", post));
};

export const viewPostCommentHandler = async (req, res) => {
  const { comment_id, post_id } = req.params;

  const comment = await viewPostComment({ comment_id, post_id });

  res.send(appResponse("viewing single post comment successfully", comment));
};

export const viewAllPostCommentHandler = async (req, res) => {
  const { post_id } = req.params;
  const { page, limit } = req.query;

  const comments = await viewAllPostComment({ post_id, page, limit });

  res.send(appResponse("viewing all post comments successfully", comments));
};

export const likePostHandler = async (req, res) => {
  const { user } = req;
  const { post_id } = req.params;

  const post = await likePost({ user, post_id });

  res.send(appResponse("succefully liked or unliked a post", post));
};

export const likeCommentHandler = async (req, res) => {
  const { user } = req;
  const { comment_id } = req.params;

  const comment = await likeComment({ user, comment_id });

  res.send(appResponse("succefully liked or unliked a comment", comment));
};

export const repostPostHandler = async (req, res) => {
  const { user, body } = req;
  const { post_id } = req.params;
  console.log(post_id);

  const repost = await repostPost({ user, post_id, body });

  res.send(appResponse("succefully reposted a post", repost));
};

export const deletePostsHandler = async (req, res) => {
  const { user } = req;
  const { post_id } = req.params;

  const post = await deletePost({ user, post_id });

  res.send(appResponse("deleted post successfully", post));
};

export const deleteCommentsHandler = async (req, res) => {
  const { user } = req;
  const { post_id } = req.params;
  const { comment_id } = req.query;

  const comment = await deleteComment({ user, post_id, comment_id });

  res.send(appResponse("deleted comment successfully", comment));
};
