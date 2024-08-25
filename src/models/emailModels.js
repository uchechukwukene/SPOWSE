import { Schema, model } from "mongoose";

const emailSchema = new Schema(
    {
        email: {type: String, required: true, trim: true, lowercase: true, index: true}
    },
    { timestamps: true }
);

export default model('Email', emailSchema);