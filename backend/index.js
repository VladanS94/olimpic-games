const express = require("express");
const app = express();
const cors = require("cors");
const results = require("./controllers/resultsController");

app.use(cors());

app.get("/results", results.getTurnamentResults);

const port = 5000;
app.listen(port, () => {
  console.log(`SERVER IS ON ${port}`);
});
