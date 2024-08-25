import sgMail from '@sendgrid/mail';
import env from '../config/env.js'

env;
sgMail.setApiKey(env.sendgrid_key);

export const messageBird = async (msg) => {
    return sgMail
    .send(msg)
    .then(() =>{
        console.log('Email sent');
        return true;
    })
    .catch(err => {
        console.error('Error sending', err);
        return false;
    });
};