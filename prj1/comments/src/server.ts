import express, { Request, Response } from "express";
import cors from "cors";
import { v4 } from "uuid";
import axios from "axios";

const app = express();

app.use(express.json());
app.use(cors());

type Comments = {
  [id: string]: Array<{
    id: string;
    content: string;
    status: string;
  }>;
};

const commentsByPostId: Comments = {};

app.get("/posts/:id/comments", (req: Request, res: Response) => {
  const { id } = req.params;

  res.send(commentsByPostId[id] || []);
});

app.post("/posts/:id/comments", async (req: Request, res: Response) => {
  const commentId = v4();

  const { id } = req.params;
  const { content } = req.body;

  const comments = commentsByPostId[id] || [];

  comments.push({ id: commentId, content, status: "pending" });

  commentsByPostId[id] = comments;

  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      status: "pending",
      postId: req.params.id,
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req: Request, res: Response) => {
  console.log("Received Event", req.body.type);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;

    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => comment.id === id);

    comment!.status = status;

    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("Comment server on post 4001");
});
