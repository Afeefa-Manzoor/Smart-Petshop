import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import petsRouter from "./pets";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import aiRouter from "./ai";
import adminRouter from "./admin";
import { demoUser } from "../middlewares/demoUser";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(demoUser, petsRouter);
router.use(demoUser, cartRouter);
router.use(demoUser, ordersRouter);
router.use(demoUser, aiRouter);
router.use(demoUser, adminRouter);

export default router;
