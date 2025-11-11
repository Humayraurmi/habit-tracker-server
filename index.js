const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vafxttx.mongodb.net/?appName=Cluster0`;

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
        const habitsCollection = db.collection('habits');
        const usersCollection = db.collection('users');
        const benefitsCollection = db.collection('benefits');
        const stepsCollection = db.collection('steps');
        const testimonialsCollection = db.collection('testimonials');

        //testimonials api
        app.get('/testimonials', async (req, res) => {
            const cursor = testimonialsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/testimonials', async (req, res) => {
            const newTestimonials = req.body;
            const result = await testimonialsCollection.insertOne(newTestimonials);
            res.send(result);
        })

        //steps api
        app.get('/how-it-works', async (req, res) => {
            const cursor = stepsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/how-it-works', async (req, res) => {
            const newSteps = req.body;
            const result = await stepsCollection.insertOne(newSteps);
            res.send(result);
        })

        //benefits api
        app.get('/benefits', async (req, res) => {
            const cursor = benefitsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/benefits', async (req, res) => {
            const newBenefits = req.body;
            const result = await benefitsCollection.insertOne(newBenefits);
            res.send(result);
        })

        //users api
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'user already existingUser.Do not need to insert again' })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }

        })

        //habits api
        app.get('/habits', async (req, res) => {
            const cursor = habitsCollection.find().sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/featured-habits', async (req, res) => {
            try {

                const query = { is_public: true };
                const cursor = habitsCollection.find(query).sort({ createdAt: -1 }).limit(6);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching featured habits:", error);
                res.status(500).send({ message: 'Failed to fetch featured habits' });
            }
        });


        app.get('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await habitsCollection.findOne(query);
            res.send(result);
        })

        app.get('/public-habits', async (req, res) => {
            const query = { is_public: true };
            const cursor = habitsCollection.find(query).sort({ createdAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });


        app.post('/habits', async (req, res) => {
            const newHabit = {
                ...req.body,
                completionHistory: [] 
            };
            const result = await habitsCollection.insertOne(newHabit);
            res.send(result);
        })

        app.patch('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const updatedHabit = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updatedHabit
            }
            const result = await habitsCollection.updateOne(query, update);
            res.send(result);
        })

        //my habits api
        app.get('/my-habits', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                return res.status(400).send({ message: 'User email is required' });
            }
            try {
                const query = {
                    userEmail: email
                };
                const cursor = habitsCollection.find(query).sort({ createdAt: -1 });
                const result = await cursor.toArray();
                return res.status(200).send(result);

            } catch (error) {
                console.error("Error:", error);
                return res.status(500).send({ message: 'Failed to fetch habits' });
            }
        });

        //task complete api
        app.patch('/habits/complete/:id', async (req, res) => {
            const id = req.params.id;
            const { userEmail, userName } = req.body;
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            try {
                const habit = await habitsCollection.findOne({ _id: new ObjectId(id) });
                if (!habit) return res.status(404).send({ message: 'Habit not found.' });

                if (habit.is_public === true) {
                    const userHabitExists = await habitsCollection.findOne({
                        originalHabitId: id,
                        userEmail
                    });

                    if (!userHabitExists) {
                        const userHabit = {
                            ...habit,
                            originalHabitId: id,
                            userEmail,
                            userName,
                            is_public: false, 
                            completionHistory: [new Date().toISOString()],
                            createdAt: new Date(),
                        };

                        delete userHabit._id;

                        const insertResult = await habitsCollection.insertOne(userHabit); 

                        return res.send({
                            success: true,
                            isNewHabit: true,
                            newHabitId: insertResult.insertedId, 
                            message: 'Private habit created for user. Redirecting to My Habits.'
                        });
                    }
                    const alreadyCompletedToday = userHabitExists.completionHistory?.some(dateStr => {
                        const entryDate = new Date(dateStr);
                        return entryDate >= startOfToday;
                    });

                    if (alreadyCompletedToday) {
                        return res.send({ modifiedCount: 0, message: 'Already completed today.' });
                    }

                    const updateResult = await habitsCollection.updateOne(
                        { _id: userHabitExists._id },
                        { $push: { completionHistory: new Date().toISOString() } }
                    );

                    return res.send({ success: true, modifiedCount: updateResult.modifiedCount });
                }

                const alreadyCompletedToday = habit.completionHistory?.some(dateStr => {
                    const entryDate = new Date(dateStr);
                    return entryDate >= startOfToday;
                });

                if (alreadyCompletedToday) {
                    return res.status(200).send({ modifiedCount: 0, message: 'Already completed today.' });
                }

                const updateResult = await habitsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $push: { completionHistory: new Date().toISOString() } }
                );

                res.send({ success: true, modifiedCount: updateResult.modifiedCount });

            } catch (error) {
                console.error("Mark Complete error:", error);
                res.status(500).send({ message: 'An error occurred.' });
            }
        });



        app.delete('/habits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
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