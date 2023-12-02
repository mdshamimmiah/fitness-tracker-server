const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

console.log(process.env.STRIPE_SECRET_KEY);

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
    const ArticleCollection = client.db('FitnessDB').collection('article');
    const usersCollection = client.db('FitnessDB').collection('users');
    const clasCollection = client.db('FitnessDB').collection('clas');
    const slotCollection = client.db('FitnessDB').collection('slot');
    const photoCollection = client.db('photoDB').collection('photo');
    const beTrainerCollection = client.db('AppliedDB').collection('applied');
    const trainerCollection = client.db('TrainerDB').collection('trainer');
    const classSheduleCollection = client.db('ClassDB').collection('classSedule');

    const paymentHistory = [];

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
    app.get('/article', async (req, res) => {
      const result = await ArticleCollection.find().toArray();
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
    app.post('/slot', async (req, res) => {
      const slot = req.body;
      console.log(slot);
      const result = await slotCollection.insertOne(slot);
      res.send(result);

    })

    app.get('/slot', async (req, res) => {
      const result = await slotCollection.find().toArray();
      res.send(result);
    })

    // jwt

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })

    //  jwt middleware
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'forbidden access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized access' })
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';

      }
      res.send({ admin });
    })
    // trainer
    app.get('/users/trainer/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized access' })
      }
      const query = { email: email };
      const user = await trainerCollection.findOne(query);
      console.log(user);
      let trainer = false;
      if (user) {
        trainer = user?.role === 'Accepted';

      }
      res.send({ trainer });
    })
    // 

    // user related api
    app.post('/users', async (req, res) => {
      const users = req.body;
      console.log(users);
      const query = { email: users.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exit', insertedId: null })
      }
      const result = await usersCollection.insertOne(users);
      res.send(result);

    })
    app.get('/users', verifyToken, async (req, res) => {
      console.log(req.headers);
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result);
    })
    // ...............................
    app.get('/NewsLetter', async (req, res) => {
      const result = await NewsLetterCollection.find().toArray();
      res.send(result);
    })
    app.get('/applied', async (req, res) => {
      const result = await beTrainerCollection.find().toArray();
      res.send(result);
    })
    app.get('/clas', async (req, res) => {
      const result = await clasCollection.find().toArray();
      res.send(result);
    })

    app.post('/applied', async (req, res) => {
      const addTrainer = req.body;
      console.log(addTrainer);
      const result = await beTrainerCollection.insertOne(addTrainer);
      res.send(result);

    })
    // applied confirmation work

    app.patch('/applied/:Id', async (req, res) => {
      try {
        const id = req.params.Id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: { role: "Accepted" },

        };
        const trainer = await beTrainerCollection.findOne(filter)
        trainer.role = "Accepted";
        delete trainer._id
        const result = await trainerCollection.insertOne(trainer)
        const deleted = await beTrainerCollection.deleteOne(filter);

        res.send(result);

      } catch (error) {
        res
          .status(500)
          .send({ error: true, message: "server side error" });
      }


    })

    // payment


    // payment intent
    app.post('/create-payment-intent', async (req, res) => {
      try {
        const { price, trainerId } = req.body;
        const amount = parseInt(price * 100);
        const userId = trainerId
        console.log(trainerId);


        const lastPayment = paymentHistory.find(payment => {
          return (
            payment.userId === userId &&
            new Date(payment.timestamp).getMonth() === new Date().getMonth()
          );
        });

        if (lastPayment) {
          // User has already made a payment in the current month
          return res.status(400).send({ error: 'User has already made a payment this month' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
        });


        paymentHistory.push({
          userId: userId,
          timestamp: new Date().toISOString(),
          amount: amount
        });

        res.send({
          clientSecret: paymentIntent.client_secret
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: 'Error creating payment intent' });
      }
    });


    // payment end



    // profile update

    app.get('/profile', async (req, res) => {
      try {
        const query = {};
        if (req.query.email) {
          query.email = req.query.email;
        }
        const result = await usersCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });



    app.put('/update/:email', async (req, res) => {
      const filter = {email:req.params.email}
      const options = { upsert: true };
      const UpdateProfile = req.body;
      const profile = {
        $set: {
          userName: UpdateProfile.name,
          image: UpdateProfile.photo
        }
      }
      const result = await usersCollection.updateOne(filter, profile, options);
      res.send(result);
    })


    // ...................................

    // manage slot dash


app.get('/manage', async(req, res) =>{
 
  const email = req.params.email
const trainerQuery = { email }
const{ _id: trainer_id} =  await trainerCollection.findOne(trainerQuery);

const slotQuery = { trainer_id }
const slots = await slotCollection.find(slotQuery).toArray();
res.send(slots)

})


// const email = req.params.email
// const trainerQuery = { email }
// const{ _id: trainer_id} =  await trainnerCollection.findOne(trainerQuery);

// const slotQuery = { trainer_id }
// const slots = await slotCollection.find(slotQuery).toArray();


    // Send a ping to confirm a successful connection

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('fitness tracker is running no')
})

app.listen(port, () => {
  console.log(`Fitness Tracker Server is running on port ${port}`);
})