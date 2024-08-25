import mongoose from "mongoose";
import env from "../config/env.js";

mongoose.set('strictQuery', false);
mongoose
    .connect(
        env.db_uri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        { autoIndex: false}
    )
    .then(()=>{
        console.log(`database seems functional now 🏢`)
    })
    .catch((e)=>{
        console.log(`Database day misbehave 𝍐 ${e}`)
    })