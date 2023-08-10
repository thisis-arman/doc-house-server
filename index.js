const { MongoClient, ServerApiVersion } = require("mongodb");
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
//middleware
app.use(cors(corsConfig));
app.options("", cors(corsConfig));
app.use(express.json());

const data = require("./data.json");

// MongoDb Starts
// TODO:Scequre pass
const uri =
  "mongodb+srv://docHouse:wn0vd7kRX9B4CfhJ@cluster0.kwah0lw.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const servicesCollection = client.db("docHouseDB").collection("services");
    const subCategoryCollection = client.db("docHouseDB").collection("subCategory");
    const usersCollection = client.db("docHouseDB").collection("users");
    const doctorsCollection = client.db("docHouseDB").collection("doctors");

    app.get("/services", async (req, res) => {
      const query = {};
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/get-service-data/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await subCategoryCollection.find(query).toArray();
      res.send(result);
    });

    // Post APIS

    // Get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // get a single user;
    app.get('/users/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email:email}
      const result = await usersCollection.findOne(query)
      res.send(result)
    })
    
    // User posting to mongoDB
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return console.log({ message: "User already Exist" });
      }
      const result = await usersCollection.insertOne(user);
      console.log(result);
    });


// Services API 


// Doctors APIs
app.post('/doctors',async(req,res)=>{
  const doctor = req.body;
  const query = {email: doctor.email}
  const existingDoctor = await doctorsCollection.findOne(query);
  if(existingDoctor){
    return console.log({message:"You're already in our list"})
  }
  const result = await doctorsCollection.insertOne(doctor)
})

// Get all the doctors
app.get('/doctors',async(req,res)=>{
  const query = {};
  const result = await doctorsCollection.find(query).toArray();
})
// Get single Doctor
app.get('/doctors/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {email : email};
  const result = await doctorsCollection.findOne(query)
  res.send(result)
})


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/doctors", async (req, res) => {
  res.send(data);
});

app.get("/doctors/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  const selectedDoctor = data.find((data) => data.profile._id == id);
  console.log(selectedDoctor);
  res.send(selectedDoctor);
});

app.get("/", (req, res) => {
  res.send("doc house server ");
});

app.listen(port, () => {
  console.log("running on port", port);
});