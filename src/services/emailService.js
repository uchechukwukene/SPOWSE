import { messageBird } from "../utils/msgBird.js";
import { formattMailInfo  } from "../utils/mailFormatter.js";

import emailModels from "../models/emailModels.js";
import { onboardinMail } from '../config/mail.js'

import { DuplicateError, InternalServerError, NotFoundError } from "../lib/appErrors.js";
import env from "../config/env.js";

export const onBoardMail = async ({body}) => {
    const checkEmail = await emailModels.findOne({email: body.email})
    if (checkEmail) throw new DuplicateError('Email already exists')

    const data = {
        ...body
    }

    const addEmail = await emailModels.create({email: body.email})
    if (!addEmail) throw new InternalServerError(`Couldn't Add the email to database, our server day fuck up, try again later`)

    
    const mailData = {
        email: data.email,
        subject: 'Welcome to SPOWSE',
        type: 'html',
        html: onboardinMail(data).html,
        text: onboardinMail(data).text
    }

    const msg = await formattMailInfo(mailData,env);


    const msgDelivered = await messageBird(msg);
    if (!msgDelivered) throw new InternalServerError(`Couldn't send confirmation mail, our server day fuck up, try again later`);

    return data;
};

export const findAllEmails = async () => {
    const allMails = await emailModels.find();
    
    if(allMails.length === 0) throw new NotFoundError(`No emails found`);

    return allMails;
};