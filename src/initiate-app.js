import { connectDB } from "../DB/connection.js";
import * as routers from "./modules/index.router.js";
import cors from "cors";
import { rollbackSavedDocuments } from "./utils/roll-Back-docs.js";
import { rollBackUploadedFiles } from "./utils/roll-back-files.js";
import { cron1, cron2 } from "./utils/crons.js";
export const initiateApp = async (app, express) => {
  const port = process.env.port;
  app.use(cors());
  app.use(express.json());
  await connectDB();

  app.use("/Auth", routers.authRouter);
  app.use("/User", routers.userRouter);
  app.use("/Category", routers.categoryRouter);
  app.use("/Course", routers.courseRouter);
  app.use("/Course-content", routers.courseContentRouter);
  app.use("/get-courses", routers.getCoursesRouter);
  app.use("/Admin", routers.adminPriviligesRouter);
  app.use("/Coupon", routers.couponRouter);

  app.use("/Cart", routers.cartRouter);
  app.use("/Order", routers.orderRouter);
  app.use("/Enroll", routers.enrollementRouter);
  app.use("/Review", routers.reviewRouter);
  app.use("/contactUs", routers.contactUsRouter);
  app.use("/Post", routers.postRouter);
  app.use("/Comment", routers.commentRouter);
  app.use("/Like", routers.likeRouter);

  app.all("*", (req, res, next) => {
    return next(new Error("page not found"));
  });

  app.use(
    (error, req, res, next) => {
      console.log(error);
      res.status(error.cause || 500).json({
        success: false,
        message: error.message,
        stack: error.stack, //dev
      });

      next();
    },
    rollBackUploadedFiles(),
    rollbackSavedDocuments()
  );
  cron1();
  cron2();

  app.listen(port, () => {
    console.log(`server is running on port ${port}....`);
  });
};
