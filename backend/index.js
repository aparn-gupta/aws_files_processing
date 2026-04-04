import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

// console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
// const upload = multer({ dest: "upload/" });

const app = express();

const PORT = 3000;

app.get("/hello", (req, res) => {
  res.send("app listening");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) res.status(400).json({ message: "No file uploaded!" });

  // res.status(200).json({ message: "File uploaded successfully!" });

  //   console.log(req.file);
  //   originalname mimetype

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  });

  const uploadResponse = await client.send(command);

  res.status(200).json({ uploadResponse });
});

app.get("/image", async (req, res) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: "tea-rose-garden-roses-plants-stem-flowers.webp",
    // Key: "Screenshot 2025-12-11 at 22.44.53.png",
  });

  //   ?width=200&quality=80

  const getImageRes = await client.send(command);
  getImageRes.Body.pipe(res);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
