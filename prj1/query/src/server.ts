import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

type Posts = {
  [id: string]: {
    id: string;
    title: string;
    comments: Array<{
      id: string;
      content: string;
      status: string;
    }>;
  };
};

const posts: Posts = {} as Posts;

const handleEvent = (type: string, data: any) => {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];

    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    console.log("Comment Updated", data);
    const { id, content, postId, status } = data;

    const post = posts[postId];

    const comment = post.comments.find((comment) => comment.id === id);

    if (comment) {
      comment.status = status;
      comment.content = content;
    }
  }
};

app.get("/posts", (_req: Request, res: Response) => {
  res.send(posts);
});

app.post("/events", (req: Request, res: Response) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("QUERIE SERVER => Listening to 4002");

  const { data } = await axios.get("http://event-bus-srv:4005/events");

  for (let event of data) {
    console.log("Processing event:", event.type);

    handleEvent(event.type, event.data);
  }
});
