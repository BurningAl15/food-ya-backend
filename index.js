const express=require('express');
const lowdDB=require('lowdb');
const FyleSync=require('lowdb/adapters/FileSync');
const joi=require('joi');
const {nanoid}=require('nanoid');
const cors=require('cors');

//Server Setup
const PORT=3001;

//Database Setup
const adapter=new FyleSync("db.json");
const db = lowdDB(adapter);
db.defaults({restaurants:[],users:[]}).write();

//Express Setup
const app=express();

// Global Middlewares
app.use(express.json());
app.use(cors({
    origin:'*'
}));

// Endpoint (Routes)
// -------- Restaurants -----------
// Get: fetch restaurants
app.get("/api/restaurants",(req,res)=>{
    const restaurants=db.get('restaurants');
    res.status(200).json({success:true,data:restaurants})
});

// Post: create new restaurant
app.post("/api/restaurants",(req,res)=>{
    // Get body from request
    const body = req.body;

    // Validate body
    const restaurantSchema=joi.object({
        company_name:joi.string().min(3).max(45).required(),
        ruc:joi.string().min(11).max(11).required(),
        company_phone:joi.string().min(9).max(12).required(),
        billing_email:joi.string().email().required(),
    })
    const result=restaurantSchema.validate(body);
    const { value, error } = result;

    // If there's no error, body is considered correct/valid
    if(error==null){
        // Validation success
        const restaurant={
            _id:nanoid(),
            ...value,
            createdAt:Date.now()
        };

        // Insert into database // mutation - write
        db.get('restaurants').push(restaurant).write();
        res.status(200).json({ success: true, message: 'Restaurant has been created', data: restaurant })
    }
    else{
        // Validation Error
        res.status(400).json({ success: false, message: 'Validation error', data: value, error: error.details })
    }
})

// --------- Users ------------
// Get: fetch users
app.get("/api/users",(req,res)=>{
    const users=db.get('users');
    res.status(200).json({success:true,data:users})
});

app.get("/api/users/:id",(req,res)=>{
    const {id}=req.params;
    const user=db.get('users').find({_id:id}).value();
    res.status(200).json({ success: true, data: user })
})

// Post: create new restaurant
app.post("/api/users",(req,res)=>{
    // Get body from request
    const body = req.body;

    // Validate body
    const userSchema=joi.object({
        name:joi.string().min(2).max(45).required(),
        surname:joi.string().min(2).max(45).required(),
        email: joi.string().email().required(),
        // photo: joi.string().required(),
        password: joi.string().required(),
        password_confirmation: joi.string().required(),
        dni: joi.string().min(8).max(8).required(),
        direction: joi.string().min(5).max(50).required(),
        district: joi.string().min(5).max(50).required(),
        city: joi.string().min(2).max(50).required(),
    })
    const result=userSchema.validate(body);
    const { value, error } = result;

    // If there's no error, body is considered correct/valid
    if(error==null){
        // Validation success
        const user={
            _id:nanoid(),
            ...value,
            createdAt:Date.now()
        };

        // Insert into database // mutation - write
        db.get('users').push(user).write();
        res.status(200).json({ success: true, message: 'User has been created', data: user })
    }
    else{
        // Validation Error
        res.status(400).json({ success: false, message: 'Validation error', data: value, error: error.details })
    }
})


app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});