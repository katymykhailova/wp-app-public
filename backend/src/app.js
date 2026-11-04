import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import compression from "compression";

import serverConfig from "./_config/server.js";

// middleware
import authenticateToken from "./middleware/authenticate.js";
import requireAuth from "./middleware/requireAuth.js";
import requireRole from "./middleware/requireRole.js";

// routers
import authRouter from "./routers/auth.router.js";

import fileSystemRouter from "./routers/fileSystem.routes.js";
import newsRouter from "./routers/news.router.js";
import personalRouter from "./routers/personal.router.js";
import suppliersRouter from "./routers/suppliers.router.js";
import branchesRouter from "./routers/branches.router.js";
import storesRouter from "./routers/stores.router.js";

import salesRouter from "./routers/sales.router.js";
import visitorsRouter from "./routers/visitors.router.js";
import purchasesRouter from "./routers/purchases.router.js";
import customersRouter from "./routers/customers.router.js";

// import kundenRouter from "./routers/index.js";

const app = express();
app.use(cookieParser());

app.use(
  compression({ filter: (req, res) => !req.headers["x-no-compression"] })
);

app.enable("trust proxy");

const allowedOrigins = serverConfig.frontendUrl
  ? serverConfig.frontendUrl
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean)
  : [];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  })
);
// app.use(express.static("public"));
app.use(compression());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(authenticateToken);
if (serverConfig.isDev) {
  const passLogin = function (req, res, next) {
    req.user = { isAdmin: true };
    next();
  };

  app.use(passLogin);
}
app.use(
  "/app/",
  requireAuth,
  requireRole(["admin", "edv", "intranet-reporting"])
);
app.get("/", (req, res) => {
  res.send("alles ist Okay");
});

app.use("/auth", authRouter);

app.use("/fileSystem", fileSystemRouter);
app.use("/news", newsRouter);
app.use("/personal", personalRouter);
app.use("/suppliers", suppliersRouter);
app.use("/branches", branchesRouter);
app.use("/stores", storesRouter);

//? middleware requireRole(["admin", "edv", "Maxpro"])
app.use("/app/sales", salesRouter);
app.use("/app/visitors", visitorsRouter);
app.use("/app/purchases", purchasesRouter);
app.use("/app/customers", customersRouter);

// app.use("", notFoundRouter); // fallthrough to 404

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!", error: err.message });
});

export default app;
