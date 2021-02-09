//creating an Api for restaurent search page with filters, sorting and paginatin
const express = require('express');
const app = express();
const port = process.env.PORT || 9785;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');

const mongourl = "mongodb+srv://Bandi:bandi4002@cluster0.2bfat.mongodb.net/bandi?retryWrites=true&w=majority";
let db;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

//health Check
app.get('/',(req,res) => {
    res.send("Health Ok");
});

//city Route making sorting and pagination with city route
app.get('/city',(req,res) => {
    let sortcondition = {city_name:1};
    let limit =100
    //making sorting
    if(req.query.sort && req.query.limit ){
      sortcondition = {city_name:Number(req.query.sort)};
      limit =Number(req.query.limit)
    }
    else if(req.query.sort){
      sortcondition = {city_name:Number(req.query.sort)}
    } //making pagination
    else if(req.query.limit){
      limit =Number(req.query.limit)
    }
    db.collection('city').find().sort(sortcondition).limit(limit).toArray((err,result) => {
      if(err) throw err;
      res.send(result);
    })
   
});

//getting restauent by city name
app.get('/rest/:id',(req,res) =>{
  var id = req.params.id
  db.collection('restaurent').find({_id:id}).toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

//*Rest route and filtering restaurent based on mealtype,cost,city and using both of them as well *//
app.get('/rest',(req,res) => {
  var condition ={};
    // getting rest data based on (meal and cost) filter
    if(req.query.mealtype && req.query.lcost && req.query.hcost){
      condition={$and:[{"type.mealtype":req.query.mealtype},{cost:{$lt:Number(req.query.hcost),$gt:Number(req.query.lcost)}}]}
    }
    // getting rest data based on meal and city
    else if(req.query.mealtype && req.query.city){
      condition={$and:[{"type.mealtype":req.query.mealtype},{city:req.query.city}]}
    }
    // getting rest data based on meal and cuisine
    else if(req.query.mealtype && req.query.cuisine){
      condition={$and:[{"type.mealtype":req.query.mealtype},{"Cuisine.cuisine":req.query.cuisine}]}
    }
    // getting rest data based on meal
    else if(req.query.mealtype){
      condition={"type.mealtype":req.query.mealtype}
    }
    // getting rest data based on city
    else if(req.query.city){
      condition={city:req.query.city}
    }
    //getting rest based on name of rest
    else if(req.query.name){
      condition={name:req.query.name}
    }
  db.collection('restaurent').find(condition).toArray((err,result)=>{
    if(err) throw err;
    res.send(result)
  }) 
})

//getting mealtype deatails
app.get('/meal',(req,res) => {
  db.collection('mealtype').find().toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

//getting cuisine deatails
app.get('/cuisine',(req,res) => {
  db.collection('cuisine').find().toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

//placing the order in the collection caled orders
app.post('/placeorder',(req,res)=>{
  db.collection('orders').insert(req.body,(err,result) => {
    if(err) throw err;
    res.send('data added');
  })
})

//get all orders from collections called orders
app.get('/orders',(req,res) => {
  db.collection('orders').find({}).toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

//connection with mongo serer
MongoClient.connect(mongourl,(err,connection) => {
  if(err) console.log(err);
  db = connection.db('bandi');

//checking port connection
  app.listen(port,(err) => {
    if(err) throw err;
    console.log(`Server is running on port ${port}`)
  })

})
