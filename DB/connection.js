import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(process.env.CONNECTION_URL_CLOUD)
    .then(console.log(`DB connection success`))
    .catch((error) => {
      console.log(`failed connect...${error}`);
    });
};
