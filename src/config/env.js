import 'dotenv/config';

export default {
    port: process.env.PORT || 4000,
    db_uri: process.env.DB_URI,
    sendgrid_key: process.env.SENDGRID_API_KEY,
    sendgrid_sender: process.env.SENDGRID_EMAIL_SENDER,
    jwt_key: process.env.JWT_SECRET,
    otpKey: process.env.OTP_KEY,
    live_uri: process.env.LIVE_URI,
    node_env: process.env.NODE_ENV,
    payatittude_marchanid: process.env.PAYATITTUDE_MERCHANTID,
    payatittude_secret_key: process.env.PAYATITTUDE_SECRETKEY,
    paystack_api_url: process.env.PAYSTACK_API_URL,
    paystack_secret_key: process.env.PAYSTACK_SECRET_KEY,
    sandbox: process.env.SANDBOX,
    akilaah_api_url: process.env.AKLAAH_API_URL,
    akilaah_api_secret: process.env.AKLAAH_API_SECRET,
    termii_api_secret: process.env.TERMII_API_SECRET,
    termii_api_url: process.env.TERMII_API_URL,
    termii_sender_id: process.env.TERMII_SENDER_ID,
    dev_base_url_org: `https://akilaah-organization.vercel.app`,
    dev_base_url_member: `https://akilaah-member.vercel.app`,
    prod_base_url_member: `https://member.akilaah.com`,
    prod_base_url_org: `https://organization.akilaah.com`,
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    cloudinary_url: process.env.CLOUDINARY_URL
}