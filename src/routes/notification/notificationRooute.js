import router from 'express';
import Validate from '../../validators/index.js';
import { authentication } from '../../middlewares/authentication.js';
import { fetchNotificaitonsHandler, markAsReadHandler } from '../../controller/notification/notificationController.js';

const notificationRoutes = router.Router();

const notificationRoot = () => {
  notificationRoutes.get('/', authentication, fetchNotificaitonsHandler);
  notificationRoutes.delete('/mark-as-read', authentication, markAsReadHandler);

  return notificationRoutes;
};

export default notificationRoot;
