const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId; 
var admin = require("firebase-admin");


const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



var serviceAccount = require('./internship-task-f50ab-firebase-adminsdk-gzbfx-c897879e2f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mnesf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req,res,next){
    if(req.headers.authorization?.startsWith('Bearer ')){
        const idToken = req.headers.authorization.split('Bearer ')[1];
        // console.log(idToken);
        try{
            const decodedUser = await admin.auth().verifyIdToken(idToken);
            console.log(decodedUser.email);
        }
        catch{
            
        }
    }
    next();
}

async function run() {
    try {
      await client.connect();
      const database = client.db("Users");
      const userList = database.collection("userList");

      

      
  app.post('/addUser',verifyToken, async (req,res)=>{
    //   console.log(req.body);
    const result = await userList.insertOne(req.body);
    // console.log(result);
    res.send(result);
  })

  app.get('/showUsers',verifyToken, async(req,res)=>{
     
      const result = await userList.find({}).toArray();
      res.send(result);
  })
  app.delete('/deleteUser/:id',verifyToken, async(req,res)=>{
    //   console.log(req.params.id);
    const result = await userList.deleteOne({
        _id: ObjectId(req.params.id)
    })
    res.send(result);

  })

    
    
      
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);





app.get('/', (req,res)=>{

    res.send('Server ready to run');

})

app.listen(port,(req,run)=>{
    console.log('listening to port', port);
})
