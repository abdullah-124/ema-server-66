const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()


const app = express();

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 4001;


// mongodb area 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1aqvj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
    try{
        await client.connect();
        // console.log('database connected successfully');
        const database = client.db('online_shop')
        const productCollection = database.collection('products')
        const orderCollection = database.collection('orders')

        //get product api
        app.get('/products', async(req, res)=>{
            // console.log(req.query)
            const cursor = productCollection.find({})
            const count = await cursor.count()
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            if(page){
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                products = await cursor.toArray()
            }
            

            res.send({
                count, 
                products
            })

            // USE POST TO GET DATA BY KEYS 
            app.post('/products/byKeys', async(req, res)=>{
                const keys = req.body;
                console.log(keys)
                const query = {key: {$in: keys}}
                const products = await productCollection.find(query).toArray();
                res.send(products)
            })

            // ADD ORDER API 
            app.post('/shipping', async(req, res)=>{
                const order = req.body;
                console.log(order)
                const result = await orderCollection.insertOne(order)
                res.json(result)
            })

        })


    }
    finally{
        // await client.close()
        // console.log('closer')
    }
}
run().catch(console.dir())

app.get('/', (req, res)=>{
    res.send('ema john server is running')
})

app.listen(port, ()=>{
    console.log('ema server running with ', port)
})