const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tdc5fzi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("artify-db");
    const artifyCollection = db.collection("artify-collection");
    const favoritesCollection = db.collection("favorites-collection");

    // Get all arts
    app.get("/arts", async (req, res) => {
      const result = await artifyCollection.find().toArray();
      res.send(result);
    });

    // Get latest 6 arts
    app.get("/arts/latest", async (req, res) => {
      const result = await artifyCollection.find().sort({ _id: -1 }).limit(6).toArray();
      res.send(result);
    });

    // Get single art by ID
    app.get("/arts/:id", async (req, res) => {
      const { id } = req.params;
      const result = await artifyCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    // Add new art
    app.post("/arts", async (req, res) => {
      const data = req.body;
      const result = await artifyCollection.insertOne(data);
      res.send({ success: true, result });
    });

    // Update art
    app.put("/arts/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await artifyCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    // Delete art
    app.delete("/arts/:id", async (req, res) => {
      const { id } = req.params;
      const result = await artifyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result.deletedCount > 0 ? { success: true } : { success: false });
    });

    // Like an art
    app.post("/arts/:id/like", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await artifyCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } },
          { returnDocument: "after" }
        );
        console.log(result);
        if (result.likes) {
          res.send({ success: true, likes: result.likes });
        } else {
          res.send({ success: false });
        }
      } catch (err) {
        res.send({ success: false, error: err.message });
      }
    });

    // Add to favorites
    app.post("/favorites", async (req, res) => {
      const favorite = req.body;
      const exists = await favoritesCollection.findOne({
        userEmail: favorite.userEmail,
        artId: favorite.artId,
      });
      if (exists)
        return res.send({ success: false, message: "Already in favorites" });

      const result = await favoritesCollection.insertOne(favorite);
      res.send({ success: true, result });
    });

    // Get favorites by user email
    app.get("/favorites", async (req, res) => {
      const { email } = req.query;
      const result = await favoritesCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    // Delete favorite
    app.delete("/favorites/:id", async (req, res) => {
      const { id } = req.params;
      const result = await favoritesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


