import express from 'express'
import path from 'path';
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


mongoose.connect("mongodb://127.0.0.1:27017" , {
    dbname :"backend",
}).then(()=> console.log("database connected")).catch((err)=>console.log(err));
const app = express();


const users = [];

//setting up view engine
app.set("view engine" , "ejs")

//using middle ware
// console.log(path.join(path.resolve() , "public"));
app.use(express.static(path.join(path.resolve() , "public"))) 
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());





//schema for datbase 
const msgschema = new mongoose.Schema({
    Name : String,
    Email:String , 
    Password : String
});
//models for database means calling for collections
const msg = mongoose.model("userLogin" , msgschema);







///////////////set cookies in login
const isautheticated = async(req, res , next)=>{
    const {token} = req.cookies; //// 
    if(token){
        //decoding the web token first
        const decodedjwt = jwt.verify(token ,"afaafafafasfafqerewrfdf" )
        //console.log(decodedjwt)
        req.user = await msg.findById(decodedjwt._id);
        console.log(req.user)

        next(); 
    }
    else res.redirect("/login");

}
app.get("/",isautheticated , (req, res)=>{res.render("logout.ejs" , {name : req.user.Name , email : req.user.Email} );}
)

app.get("/login", (req,res)=>{
    res.render("login.ejs")
})
app.get("/register" , (req,res)=>{
    res.render("register.ejs");
})
// app.get("/logout" , isautheticated , (req, res)=>{res.render("logout.ejs" , {name : req.user.Name , email : req.user.Email} );})

app.post("/login" ,async (req,res)=>{
    const {email , password } = req.body;
    let userall = await msg.findOne({Email : email});
    // const passwrd = await msg.findOne({Password : password});
    if(!userall){
        return res.redirect("/register");
    }
    // const isMatch = userall.Password === password ;
    const isMatch = await bcrypt.compare(password , userall.Password) ; 
    if(!isMatch) return res.render("login.ejs" , { email: email,message : "Incorrect Password"});
    const token = jwt.sign( {_id : userall._id} ,"afaafafafasfafqerewrfdf")
    res.cookie("token",token ,{
     httpOnly : true,
    expires : new Date(Date.now()+ 60*2000)

 });
    res.redirect("/");
    // 
})




//l



app.post("/register" , async (req , res)=>{

    // console.log(req.body); ///  data comes from input field inthe req.body
    const {name , email , password} = req.body; // from req.body we take out name and email
    



    let userall = await msg.findOne({Email : email}); //if user already registered then useremail !=Null
    // console.log(usermail);
    if(userall){
        // return console.log("Register First");
        // return res.redirect("/register")
        return res.redirect("/login")
    }
/////////////////////////////////////////////////////////////jwt tokens
const hashedpasswrd = await bcrypt.hash(password , 10);
const user = await msg.create({Name : name , Email : email , Password : hashedpasswrd}); // send data into mongo and save it in user datatypes
const token = jwt.sign( {_id : user._id} ,"afaafafafasfafqerewrfdf")
// console.log(token)


    res.cookie("token",token ,{
     httpOnly : true,
    expires : new Date(Date.now()+ 60*1000)

 });
    res.redirect("/")
})

app.get("/logout" , (req , res)=>{
    res.cookie("token", null ,{
    httpOnly : true,
    expires : new Date(Date.now())/// abhi ke abhi delete karna hai

});
    res.redirect("/")

})

//*************************************************database  */




////////////////////**************************************************************************** */
app.listen(5000 , ()=>{
    console.log("server is working");
})