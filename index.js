const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require('dotenv').config()
const stripe = require('stripe')('sk_test_51NEOh0J6vP03PB2IYLUQMU3ol2sM8jIvCuIY7rCh7saHtgifFFFBbZxLnRtzeOByCxL7oPhtWnxnXhaSMXFWOaBc00FH0XMu1u')
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
const { default: Stripe } = require("stripe");

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  console.log('authorization---',authorization)
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

// MongoDb Starts
// TODO:secure pass
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
    const appointmentsCollection = client.db("docHouseDB").collection("appointments");
    const mainCollection = client.db("docHouseDB").collection("main");
    const paymentCollection = client.db("docHouseDB").collection("payment");


    // JWT
app.post('/jwt',(req,res)=>{
  const user = req.body;
  console.log('user from jwt',user);
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
    expiresIn: '1h'
  });
  console.log('token from jwt',token);
  res.send({token})
})

  // Warning: use verifyJWT before using verifyAdmin

  const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email }
    const user = await usersCollection.findOne(query);
    if (user?.role !== 'admin') {
      return res.status(403).send({ error: true, message: 'forbidden message' });
    }
    next();
  }
 

  app.get('/users/admin/:email',verifyJWT, async (req, res) => {
    const email = req.params.email;
    console.log(email)

    if (req.decoded?.email !== email) {
      console.log(req.decoded?.email,{email})
      res.send({ admin: false })
    }

    const query = { email: email }
    const user = await usersCollection.findOne(query);
    const result = { admin: user?.role === 'admin' }
    res.send(result);
  }) 


  app.get('/users/doctor/:email',verifyJWT, async (req, res) => {
    const email = req.params.email;
    console.log(email)

    if (req.decoded?.email !== email) {
      console.log(req.decoded?.email,{email})
      res.send({ doctor: false })
    }

    const query = { email: email }
    const user = await usersCollection.findOne(query);
    const result = { doctor: user?.role === 'doctor' }
    res.send(result);
  }) 



    app.get("/services", async (req, res) => {
      const query = {};
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    // POst services


    app.post('/api/services', async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service)
      res.send(result);
    })

    app.get('/api/services', async (req, res) => {
     
      const query ={}
      const result = await servicesCollection.find(query).toArray()
      res.send(result);
    })

    app.get('/api/services/:email',async(req,res) => {
      const email = req.params.email;
      const query={doctorEmail: email}
      const result = await servicesCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/api/services-by/:id',async(req,res) => {
      const id = req.params.id;
      const query={_id: new ObjectId(id)}
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })

    app.delete('/api/services-by/:id',async(req,res) => {
      const id = req.params.id;
      const query={_id: new ObjectId(id)}
      const result = await servicesCollection.deleteOne(query)
      res.send(result)
    })
    app.patch('/api/services-by/:id',async(req,res) => {
      const id = req.params.id;
      const query={_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          status: "active",
        },
      };
      const result = await servicesCollection.updateOne(query,updateDoc)
      res.send(result)
    })



    app.put('/api/services/:id', async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;
      const query = { _id: new ObjectId(id) };
    
      const updateDoc = {
        $set: updatedService, 
      };
    
      const result = await servicesCollection.updateOne(query, updateDoc);
      
     res.send(result)
    });

    app.get("/get-service-data/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const result = await subCategoryCollection.find(query).toArray();
      res.send(result);
    });

    // Post APIS

    // USERS APIs

   

    // Get all users
    app.get("/users",  async (req, res) => {
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


    app.get('/get-users/admin/:email',async(req,res)=>{
      const email = req.params.email;
      // console.log(status);
      let query = {
        email:email
      }
      console.log(query)
      
      const result = await usersCollection.findOne(query)
    res.send({isAdmin :result?.role ==='admin'})
    })


    app.delete('/users/:id',async(req,res)=>{
      const id = req.params.id;
      console.log(id)
      const query = { _id :new ObjectId(id)};
      const result = await usersCollection.deleteOne(query)
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


  app.patch('/api/users/:id',async(req,res)=>{
    const id = req.params.id;
    const filter = {_id : new ObjectId(id)};
    const updateDoc = {
      $set:{
        role: 'admin',
      }
    }

    const updatedUser = await usersCollection.updateOne(filter, updateDoc);
    res.send(updatedUser)
  })


// Appointment APIs

app.post('/appointments',async(req,res)=>{
  const appointment = req.body;
  const result = await appointmentsCollection.insertOne(appointment);
  console.log(result)
})
app.get('/appointments/:email',async(req,res)=>{
  const email = req.params.email;
  const query = {email: email}
  const result = await appointmentsCollection.find(query).toArray();
  res.send(result)
})

app.get('/api/appointments/:doctorId',async(req,res)=>{
  const id = req.params.doctorId;
  console.log(id)
  const query ={doctorID : parseInt(id)}
  console.log(query)
  const appointment = await appointmentsCollection.find(query).toArray()
  // console.log(appointment)
  res.send(appointment)
})

app.get('/api/appointment/:id',async(req,res)=>{
  const id = req.params.id;
  const query ={_id : new ObjectId(id)}
  const appointment = await appointmentsCollection.find(query).toArray()
  res.send(appointment)
})


app.get('/api/appointments',async(req,res)=>{
  const query = {};
  const result = await appointmentsCollection.find(query).toArray();
  console.log(result)
  res.send(result)
})

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


app.patch('/api/doctor/:id',async(req,res)=>{
  const id = req.params.id;
  const filter = {_id:new ObjectId(id)}
  const updateDoc ={
    $set:{
      status:'active'
    }
  }
  const updatedDoctor = await usersCollection.updateOne(filter,updateDoc)
  res.send(updatedDoctor)
})



// Get all the doctors
app.get('/doctors',async(req,res)=>{
  const query = {};
  const result = await doctorsCollection.find(query).toArray();
  res.send(result)
})


// Get single Doctor
app.get('/api/doctors/:email',async(req,res)=>{
  const {email} = req.params.email;
  console.log(email)
  const query = {email : email};
  console.log(query)
  const result = await doctorsCollection.findOne(query)

  res.send(result)
})



app.get('/doctor/:id',async(req,res)=>{
  const id = req.params.id;
  const query ={_id :new ObjectId(id)}
  const result =await doctorsCollection.findOne(query)
  res.send(result)
})

// Main collection

app.get('/api/all-info',async(req,res)=>{
  const result = await mainCollection.find().toArray()
  res.send(result)
})

app.get('/api/all-info/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await mainCollection.findOne(query);
  res.send(result)
})

/* app.put('/api/update-about/:id',async(req,res)=>{
  const id = req.params.id;
const {updatedAbout} = req.body;
  console.log(updatedAbout)
  const filter = {_id: new ObjectId(id)}
 const option = {
  upsert :true
 }
  const updateDoc = {
    $set :{aboutMe :updatedAbout }
  }
  const result = await mainCollection.findOneAndUpdate(filter,updateDoc,option);
  console.log(result)
  res.send(result)
}) */


app.get('/api/all-info-by-id/:doctorID',async(req,res)=>{
  const doctorID = req.params.doctorID;
  console.log(doctorID)
  const query ={doctorID : doctorID};
  const doctorInfo = await mainCollection.findOne(query)
  res.send(doctorInfo)
})

app.get('/api/all-info-by/:email',async(req,res)=>{
  const email = req.params.email;
  const query ={email : email};
  const doctorInfo = await mainCollection.findOne(query);
  res.send(doctorInfo)
})


//update steward text
app.put("/api/all-info/:id", async (req, res) => {
  const {updatedAbout} = req.body;
  console.log(updatedAbout)
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const option = {
    upsert :true
   }
  const updateDoc = {
    $set: {
      aboutMe: updatedAbout,
    },
  };
  const result = await mainCollection.updateOne(filter, updateDoc,option);
  console.log(result);
  res.send(result);
});


// Payments


app.post('/create-payment-intent',async(req,res)=>{
  const {fee}= req.body;
  console.log(fee,'fee')
  const amount = fee *100;


  const paymentIntent =await stripe.paymentIntents.create({
    amount :amount,
    currency :'usd',
    payment_method_types: ['card']

  })
  res.send({
    clientSecret: paymentIntent.client_secret,
  })
})

// Payments api
app.post('/payment',async(req,res)=>{
  const paymentInfo = req.body;
  const result = await paymentCollection.insertOne(paymentInfo)
  res.send(result);
})
app.get('/payment',async(req,res)=>{
  
  const result = await paymentCollection.find().toArray()
  res.send(result);
})
app.get('/payment/:email',async(req,res)=>{
  const email = req.params.email;
  const query = { userEmail: email}
  const payment = await paymentCollection.find(query).toArray();
  res.send(payment);

})





// -----------------------------
// SOCKET.IO
// ------------------------------
 const chats = require('./chats.json');

app.get('/api/chats',(req,res)=>{
  res.send(chats)
})

app.get('/api/chats/:id',(req,res)=>{
   const singleChat = chats.find(c => c._id== req.params.id )
   res.send(singleChat)
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
