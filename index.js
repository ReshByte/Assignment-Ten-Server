const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = 5000;

app.use(cors())
app.use(express.json())





const uri = "mongodb+srv://Assignment-Ten-Artify:jrnB4UrgbXyZZCKg@cluster0.tdc5fzi.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();

    const db = client.db('artify-db');
    const artifyCollection = db.collection('artify-collection')

    app.get('/arts',async(req,res) => {
        const result = await artifyCollection.find().toArray()
        res.send(result)
    })

    app.post('/arts', async(req,res) => {
        const data = req.body
        console.log(data);
        const result = await artifyCollection.insertOne(data)
        res.send({
            success:true,
            result
        })
    })

      app.get('/arts/user', async (req, res) => {
      const { email } = req.query;
      console.log(email);
      
      const result = await artifyCollection.find({email:email}).toArray();
      res.send(result);
    });

    app.get('/arts/:id', async(req,res) => {
        const {id} = req.params;
        console.log(id);
        const result = await artifyCollection.findOne({_id: new ObjectId(id)});

        res.send({
            success: true,
            result
        })
    })




   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Server is running fine!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
