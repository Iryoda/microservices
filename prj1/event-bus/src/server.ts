import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());

app.use(express.json());

type Events = {
  type: string;
  body: any;
};

const events: Events[] = [];

app.post("/events", async (req: Request, res: Response) => {
  const event = req.body;

  events.push(event);
  try {
    await axios.post("http://posts-clusterip-srv:4000/events", event);
    await axios.post("http://comments-clusterip-srv:4001/events", event);
    await axios.post("http://query-clusterip-srv:4002/events", event);
    await axios.post("http://moderation-clusterip-srv:4003/events", event);
  } catch (e) {
    console.log("Error!", e);
  }
  res.send({ status: "OK" });
});

app.get("/events", (_req: Request, res: Response) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Event Bust Listening on 4005");
});
