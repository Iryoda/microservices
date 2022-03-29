import express, { Request, Response } from "express";
import axios from "axios";

const app = express();

app.use(express.json());

app.post("/events", async (req: Request, res: Response) => {
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "aproved";

    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentModerated",
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }

  res.send({});
});

app.listen(4003, () => {
  console.log("MODERATION SERVER -> Listening on 4003");
});