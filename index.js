const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json())


const uri = "mongodb+srv://habitdbUser:zR6uvtycZzGLpI81@cluster0.vafxttx.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Habit Tracker is running')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('habit_db');
        const habitsCollection = db.collection('products');

        app.post('/habits', async(req,res)=>{
            const cursor = habitsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/habits/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await habitsCollection.findOne(query);
            res.send(result);
        })

        app.post('/habits', async(req,res)=>{
            const newHabit = req.body;
            const result = await habitsCollection.insertOne(newHabit);
            res.send(result);
        })

        app.delete('/habits/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await habitsCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Habit Tracker is running on port: ${port}`)
})