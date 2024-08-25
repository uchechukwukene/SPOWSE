import appResponse from "../../lib/appResponse.js";
import {
  fetchNotificaitons,
  markAsReadNotification,
} from "../../services/notificationService/notificationService.js";

export const fetchNotificaitonsHandler = async (req, res) => {
  const { user, query } = req;

  const response = await fetchNotificaitons({ user, query });

  res.send(appResponse("fetched notifications successfully", response));
};

export const markAsReadHandler = async (req, res) => { 
  const { user } = req;
  const { notification_id } = req.query;

  const response = await markAsReadNotification({ user, notification_id });

  res.send(appResponse("marked notification as read", response));
};
