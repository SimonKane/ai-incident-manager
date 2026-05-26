import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const PORT = parseInt(process.env.PORT || "");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
