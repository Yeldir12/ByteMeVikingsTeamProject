const express = require("express");
const app = express();

app.use(express.json());

app.post("/test", (req, res) => {
  console.log("🎉 POST /test HIT");
  console.log("Body:", req.body);
  res.json({ message: "POST received!" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
