import express from "express";
import Validate from "../../validators/index.js";
import { authentication } from "../../middlewares/authentication.js";
import {
  createCommentHandler,
  deleteCommentsHandler,
  deletePostsHandler,
  likeCommentHandler,
  likePostHandler,
  makePostHandler,
  repostPostHandler,
  viewAllPostCommentHandler,
  viewAllPostsHandler,
  viewFollowersPostHandler,
  viewMyPostHandler,
  viewPostCommentHandler,
  viewSinglePostHandler,
} from "../../controller/postContoller/postController.js";
import {
  likeComment,
  postSchema,
  rePostSchema,
  viewComment,
  viewPost,
} from "../../validators/postValidators.js";

const postServiceRoutes = express.Router();
const postRoute = () => {
  postServiceRoutes.post(
    "/make-post",
    Validate(postSchema),
    authentication,
    makePostHandler
  );
  postServiceRoutes.get(
    "/view-my-posts",
    authentication,
    viewMyPostHandler
  );
  postServiceRoutes.post(
    "/make-comment/:post_id",
    Validate(postSchema),
    authentication,
    createCommentHandler
  );
  postServiceRoutes.get("/view-all-posts", viewAllPostsHandler);
  postServiceRoutes.get(
    "/view-all-follow-posts",
    authentication,
    viewFollowersPostHandler
  );
  postServiceRoutes.get(
    "/view-single-posts/:post_id",
    Validate(viewPost, "params"),
    viewSinglePostHandler
  );
  postServiceRoutes.get(
    "/view-all-post-comment/:post_id",
    Validate(viewPost, "params"),
    viewAllPostCommentHandler
  );
  postServiceRoutes.get(
    "/view-single-post-comment/:post_id/:comment_id",
    Validate(viewComment, "params"),
    viewPostCommentHandler
  );
  postServiceRoutes.post(
    "/like-post/:post_id",
    Validate(viewPost, "params"),
    authentication,
    likePostHandler
  );
  postServiceRoutes.post(
    "/like-comment/:comment_id",
    Validate(likeComment, "params"),
    authentication,
    likeCommentHandler
  );
  postServiceRoutes.post(
    "/repost/:post_id",
    Validate(rePostSchema),
    authentication,
    repostPostHandler
  );
  postServiceRoutes.delete(
    "/delete-post/:post_id",
    Validate(viewPost, "params"),
    authentication,
    deletePostsHandler
  );
  postServiceRoutes.delete(
    "/delete-comment/:post_id",
    Validate(viewPost, "params"),
    authentication,
    deleteCommentsHandler
  );

  return postServiceRoutes;
};

export default postRoute;
