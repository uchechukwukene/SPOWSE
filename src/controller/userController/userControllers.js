import appResponse from "../../lib/appResponse.js";
import {
  deleteUserProfile,
  followUser,
  getLeaderBoard,
  getUserPoint,
  updateUserProfile,
  viewConnection,
  viewUser,
  viewProfile,
  search,
} from "../../services/userServices/userServices.js";

export const viewProfileHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewProfile({ user });

  res.send(appResponse("viewing profile", profile));
};

export const viewUsereHandler = async (req, res) => {
  const { user_id } = req.query;
  const profile = await viewUser({ user_id });

  res.send(appResponse("viewing another users profile", profile));
};

export const searchHandler = async (req, res) => {
  const { queryPage, queryLimit, query } = req.query;
  const results = await search(query, queryPage, queryLimit);
  res.send(appResponse("searching", results));
};

export const viewConnectionHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewConnection({ user });

  res.send(appResponse("viewing connections", profile));
};

export const viewMemberHandler = async (req, res) => {
  const { user } = req;
  const profile = await viewMember({ user });

  res.send(appResponse("viewing connections", profile));
};

export const getUserPointHandler = async (req, res) => {
  const { user } = req;
  const profile = await getUserPoint({ user });

  res.send(appResponse("points fetched successfully", profile));
};

export const followUserHandler = async (req, res) => {
  const { user } = req;
  const { userIdToFollow } = req.query;
  const profile = await followUser({ user, userIdToFollow });

  res.send(appResponse("followed or unfollowed a user successfully", profile));
};

export const updateUserProfileHandler = async (req, res) => {
  const { user, body } = req;
  const profile = await updateUserProfile({ user, body });

  res.send(appResponse("profile updated successfully", profile));
};

export const leaderBoardHandler = async (req, res) => {
  const { user } = req;
  const { query } = req;

  const board = await getLeaderBoard({ query, user });

  res.send(appResponse("leaderboard fetched succefully", board));
};

export const deleteUserProfileHandler = async (req, res) => {
  const { user } = req;
  const profile = await deleteUserProfile({ user });

  res.send(appResponse("profile deleted successfully", profile));
};
