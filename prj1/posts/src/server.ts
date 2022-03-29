import express, { Request, Response } from "express";
import cors from "cors";
import { v4 } from "uuid";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(cors());

interface IPost {
  [id: string]: {
    id: string;
    title: string;
  };
}

const posts: IPost = {} as IPost;

app.get("/posts", (_req: Request, res: Response) => {
  res.status(200).send(posts);
});

app.post("/posts/create", async (req: Request, res: Response) => {
  const id = v4();
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  await axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });

  res.status(201).send(posts[id]);
});

app.post("/events", (req: Request, res: Response) => {
  console.log("Received Event", req.body.type);

  res.send({});
});

app.listen(4000, () => {
  console.log("POST SERVER -> listening on 4000", "v4");
});
