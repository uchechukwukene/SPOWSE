import "express-async-errors";
import "dotenv/config";
import express, { Router, urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import env from "./config/env.js";
import baseRoutes from "./routes/index.js";
import "./db/connection.js";
import { ErrorHandler } from "./middlewares/errorHandler.js";

const router = Router();
const rootRouter = baseRoutes(router);

const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(morgan("combined"));

const port = env.port;
const baseURL =
  env.node_env === "development" ? "/axislink/api/v1" : "/axislink/api/v1/stag";

app.use(baseURL, rootRouter);

app.use("*", (req, res) => {
  res
    .status(404)
    .send({ message: "Resource URL not found", success: false, data: null });
});

app.use(ErrorHandler);

app.listen(port, () => {
  console.log(`server up and running @ port ${port}`);
});
