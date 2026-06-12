import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth";
import "dotenv/config";
import linksRouter from "./routes/links";
import { config } from "dotenv";
import redirectRouter from "./routes/redirect"
const app = express();
config();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
app.use("/api/links", linksRouter);
app.get("/health", (_, res) => {
    res.json({
        status: "ok",
    });
});

app.use("/", redirectRouter);
app.listen(4000, () => {
    console.log("Server running on port 4000");
});