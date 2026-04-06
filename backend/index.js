import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

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

const PORT = 3000;

app.get("/hello", (req, res) => {
  res.send("app listening");
});

app.post("/upload", upload.array("file"), async (req, res) => {
  if (!req.files?.length)
    res.status(400).json({ message: "No file uploaded!" });

  // res.status(200).json({ message: "File uploaded successfully!" });

  //   console.log(req.file);
  //   originalname mimetype

  // console.log(req.files);

  try {
    for (let each of req.files) {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: each.originalname,
        Body: each.buffer,
        ContentType: each.mimetype,
      });

      await client.send(command);
    }

    res.status(200).json({ message: "Uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/list", async (req, res) => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET,
  });

  try {
    const response = await client.send(command);

    console.log(response);

    const fileKeys = response.Contents.map((item) => item.Key);
    res.status(200).json({ data: fileKeys });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/image", async (req, res) => {
  const fileName = req.query.name;

  console.log(fileName);

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    // Key: "Screenshot 2025-12-11 at 22.44.53.png",
  });

  //   ?width=200&quality=80

  const getImageRes = await client.send(command);
  getImageRes.Body.pipe(res);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
