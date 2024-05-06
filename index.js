import express from "express";
import "dotenv/config";
import { initiateApp } from "./src/initiate-app.js";

export const app = express();

initiateApp(app, express);
