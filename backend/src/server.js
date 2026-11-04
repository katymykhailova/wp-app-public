import serverConfig from "./_config/server.js";
import app from "./app.js";

app.listen(serverConfig.port, () => {
  console.log(`listening on http://localhost:${serverConfig.port}`);
});
