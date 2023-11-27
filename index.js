const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());

// user - FitnessTracker
// pass - WhzRq9FRxuxJepeG
console.log(process.env.DB_PASS);


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ouqbod.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)

    const NewsLetterCollection = client.db('newsDB').collection('news');
    const FitnessCollection = client.db('FitnessDB').collection('team');
    const photoCollection = client.db('photoDB').collection('photo');
    const beTrainerCollection = client.db('photoDB').collection('addTrainer');
    const trainerCollection = client.db('TrainerDB').collection('trainer');
    const classSheduleCollection = client.db('ClassDB').collection('classSedule');

    app.get('/trainer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await trainerCollection.findOne(query);
      res.send(result);

    })


    app.get('/classSedule', async (req, res) => {
      const result = await classSheduleCollection.find().toArray();
      res.send(result);
    })
    app.get('/photo', async (req, res) => {
      const result = await photoCollection.find().toArray();
      res.send(result);
    })
    app.get('/trainer', async (req, res) => {
      const result = await trainerCollection.find().toArray();
      res.send(result);
    })
    app.get('/team', async (req, res) => {
      const result = await FitnessCollection.find().toArray();
      res.send(result);
    })


    app.post('/NewsLetter', async (req, res) => {
      const newNewsLetter = req.body;
      console.log(newNewsLetter);
      const result = await NewsLetterCollection.insertOne(newNewsLetter);
      res.send(result);

    })

    app.get('/NewsLetter', async (req, res) => {
      const result = await NewsLetterCollection.find().toArray();
      res.send(result);
    })
    app.get('/addTrainer', async (req, res) => {
      const result = await beTrainerCollection.find().toArray();
      res.send(result);
    })

    app.post('/addTrainer', async (req, res) => {
      const addTrainer = req.body;
      console.log(addTrainer);
      const result = await beTrainerCollection.insertOne(addTrainer);
      res.send(result);

    })



    // Send a ping to confirm a successful connection

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('fitness tracker is running ')
})

app.listen(port, () => {
  console.log(`Fitness Tracker Server is running on port ${port}`);
})