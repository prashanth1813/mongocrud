const express = require("express");
const app=express();
var bodyparser=require("body-parser")
app.use(express.json());
var jwt=require("jsonwebtoken")
app.use(express.static('public'))
const mongoclient=require('mongodb').MongoClient
//app.use(bodyparser.urlencoded({extended:false}))
app.use(express.urlencoded({ extended: true }));
//app.use(express.static(path.resolve(__dirname, 'public')));
mongoclient.connect("mongodb://localhost:27017",(err,client)=>{
    if(err){
        console.log("Error occured")
    }
    else{
        db=client.db("users")
        console.log("DATABASE CONNECTED SUCCESSFULL")
    }
})

app.listen(2000,()=> console.log("server started at port 2000"))
app.get('/',(req,res)=>{
    // res.sendFile(__dirname + "/index1.html")
    res.send("welcome")
})
app.get('/emps',verifyToken,(req,res)=>{
    db.collection('emp').find().toArray((err,items)=>{
        if(err){
            console.log("unable to display")
        }
        else{
            res.json(items);
            console.log(items);
        }

    })
})

app.get('/emps/:id',(req,res)=>{
    var id=Number(req.params.id)
    db.collection('emp').find({_id:{$eq:id}}).toArray((err,items)=>{
        if(err){
            console.log("unable to display")
        }
        else{
            res.json(items);
        }

    })
    
}) 
app.post('/login',(req,res)=>{
    uname=req.body.empname
    pass=req.body.pass
    db.collection('emp').find({"empname":uname,"pass":pass}).toArray((err,item)=>{
        if(item){
            const token=jwt.sign({"empname":uname},"FullStack",{})
            res.json({success:true, message:"Authentication successful", token:token})
            res.end();
        }
        else{
            res.json({success:false, message:"Authentication failed"})
            res.end();
            
        }})
})

function verifyToken(req,res,next){
    let token=req.headers['authorization']
    console.log(token)
    if(token){
        token=token.split(' ')[1]
        console.log(token)
        jwt.verify(token,"FullStack",(err,decoded)=>{
            if(err)
            {
                return res.json({
                    success:false,
                    message:"Token is not Valid"
                });
            }
            else{
                next();
            }
        })
    }
    else{
        return res.json({
            success:false,
            message:"A token is reqd for authorization"
        });
    }
}

app.post('/addemps',(req,res)=>{

   // res.json(user);
    //res.write('Inserted Successful')
   // console.log('inserted successful')
    
    db.collection('emp').insertOne(req.body)
    console.log("inserted successfull")
    res.redirect('/emps');
    console.log((req.body));
    


    
})

app.delete('/delemps',(req,res)=>{
    var id1=Number(req.body._id)

    db.collection('emp').removeOne({_id:req.body._id})
    res.redirect('/emps')
    console.log("DELETED SUCCESSFULL")
}) 
app.put('/updemps/:id',(req,res)=>{
    var id2=Number(req.params.id)
    db.collection('emp').update({_id:{$eq:id2}},{$set:{"name":"Rocky"}})
    console.log("updated successfull")
})


