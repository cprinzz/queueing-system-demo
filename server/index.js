import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./constants";
import routes from "./routes";

const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use("/api", routes);

app.listen(PORT, () => console.log(`Queue server listening on port ${PORT}!`));
export default app;
