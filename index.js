import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const secretKey = "key123";

app.get("/", (req, res) => {
  res.send("Welcome There!");
});

const users = {};

app.post("/user", async (req, res) => {
  try {
    const payload = req.body;
    const salt = "450d0b0db2bcf4adde5032eca1a7c416e560cf44";

    const existingUser = Object.values(users).find(
      (user) => user.email === payload.email
    );

    if (existingUser) {
      res.status(400).json({
        error: "User already exists",
      });
      return;
    }

    const hasedId = crypto
      .createHash("SHA1")
      .update(`${payload.email}${salt}`, 10)
      .digest("hex");

    const accessToken = jwt.sign(hasedId, secretKey);

    const user = {
      id: hasedId,
      ...payload,
    };

    users[user.id] = user;

    res.status(200).json({ id: user.id, accessToken });
  } catch (error) {
    console.error("Error during creating user: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/user/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: "Invalid params",
      });
    }
    const user = users[id];

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.marketingConsent) delete user.email;

    res.status(200).json(user);
  } catch (error) {
    console.error(
      `Error during getting a user by id ${req.params.id} : `,
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    process.exit(1);
  }
  console.log(`Server is running on port ${PORT}`);
});
