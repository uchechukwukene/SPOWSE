import appResponse from '../lib/appResponse.js';

import { onBoardMail, findAllEmails } from "../services/emailService.js";

export const onBoardMailHandler =  async (req, res ) => {
    const {body} = req;
    const email = await onBoardMail({body});

    res.send(appResponse('new email address is added successfully', email))
};
export const findAllEmailsHandler =  async (req, res ) => {
    // const {body} = req;
    const emails = await findAllEmails();

    res.send(appResponse('all emails are fetched successfully', emails))
};