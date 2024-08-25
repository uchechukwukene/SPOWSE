import router from 'express';
import { findAllEmailsHandler, onBoardMailHandler } from "../controller/emailController.js";


const userSignUpRoutes = router.Router();

const signUpRoute = ()=>{
    userSignUpRoutes.post('/user-sign-up', onBoardMailHandler);
    userSignUpRoutes.get('/all-spowes-emails', findAllEmailsHandler);

    return userSignUpRoutes;
};

export default signUpRoute;
