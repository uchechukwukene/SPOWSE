import { NotFoundError } from "../../lib/appErrors.js";
import notificationModel from "../../models/notificationModel.js";

// export const fetchNotificaitons = async ({ user }) => {
//   const unread_notifications = await notificationModel.countDocuments({
//     user_id: user._id,
//     is_read: false,
//   });

//   const notifications = await notificationModel
//     .find({
//       user_id: user._id,
//     })
//     .sort({ createdAt: -1 })
//     .populate('user_id', 'username')

//   for (let notification of notifications) {
//     notification.is_read = true;

//     await notification.save();
//   }

//   return { unread_notifications, notifications };
// };

export const markAsReadNotification = async ({ user, notification_id }) => {
  const data = await notificationModel.findOne({
    user_id: user._id,
    _id: notification_id,
  });
  console.log(data);
  const notification = await notificationModel.deleteOne({
    user_id: user._id,
    _id: notification_id,
  });

  if (notification.deletedCount === 0) {
    throw new NotFoundError("Notification not found");
  }

  return data;
};

// export const fetchNotificaitons = async ({ user, query }) => {
//   const { limit = 10, page = 1 } = query;
//   const skip = (page - 1) * limit;

//   // Run count and find queries in parallel
//   const [unreadNotificationsCount, notifications, unreadNotifications] =
//     await Promise.all([
//       notificationModel.countDocuments({
//         user_id: user._id,
//         is_read: false,
//       }),
//       notificationModel
//         .find({
//           user_id: user._id,
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("user_id", "username"),
//       notificationModel
//         .find({
//           user_id: user._id,
//           is_read: false,
//         })
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("user_id", "username"),
//     ]);

//   // Batch update notifications to mark them as read
//   await notificationModel.updateMany(
//     { _id: { $in: notifications.map((notification) => notification._id) } },
//     { $set: { is_read: true } }
//   );

//   return {
//     page: page,
//     limit: limit,
//     unread_notifications: unreadNotificationsCount,
//     notifications,
//     unreadNotifications,
//   };
// };

export const fetchNotificaitons = async ({ user, query }) => {
  const { limit = 10, page = 1 } = query;
  const skip = (page - 1) * limit;

  // Run count and find queries in parallel
  const [totalNotificationsCount, unreadNotificationsCount, notifications, unreadNotifications] = await Promise.all([
    notificationModel.countDocuments({
      user_id: user._id,
    }),
    notificationModel.countDocuments({
      user_id: user._id,
      is_read: false,
    }),
    notificationModel
      .find({
        user_id: user._id,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "username"),
    notificationModel
      .find({
        user_id: user._id,
        is_read: false,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id", "username"),
  ]);

  // Batch update notifications to mark them as read
  await notificationModel.updateMany(
    { _id: { $in: notifications.map((notification) => notification._id) } },
    { $set: { is_read: true } }
  );

  const totalPages = Math.ceil(totalNotificationsCount / limit);

  return {
    current_page: page,
    limit: limit,
    total_pages: totalPages,
    unread_notifications: unreadNotificationsCount,
    notifications,
    unreadNotifications,
  };
};
