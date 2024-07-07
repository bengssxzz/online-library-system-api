const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");


const mongoose = require("mongoose");
require("../Schema/regStudents");
const regStudentsSchema = mongoose.model("regStudents");

require("../Schema/adminDetails");
const adminSchema = mongoose.model("admin");

require("../Schema/auditLogs");
const auditSchema = mongoose.model("auditLog")

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: "digital.archive.otp@gmail.com",
        pass: "dihjer-raswaG-6rexvo"
    },

    tls: {
        rejectUnauthorized: false
    }

});

router.post("/getToken", async (req, res) => {
    console.log()
    if(req.body.user === "Student")
    {
        const lrn = req.body.lrn;
        const password = req.body.password;
        //123546asdf
        try {
            const student = await regStudentsSchema.findOne({lrn})
        
            if(student) {
                if (password === student.password) {
                    const token = jwt.sign({_id: student._id}, "Secret", {
                        expiresIn: '6h',
                    });
                    

                    res.json({status: "Success!", token: token});

                }
                else {
                    res.json({status: "Incorrect Password!"});
                }
            }
            else {
                res.json({status: "Incorrect LRN!"});
            }    
            
        } catch (error) {
            res.send(error);
        }
    }

    else {
        const email = req.body.email;
        const password = req.body.password;
        const action = "Admin Sign in" 
        const date = Date.now()

        try {
            const admin = await adminSchema.findOne({email});
        
            if(admin) {
                

                if (password === admin.password) {
                    const token = jwt.sign({_id: admin._id}, "Secret", {
                        expiresIn: '3h',
                    });
                    
                    var code = "";

                    for (let i = 0; i < 6; i++){
                        code += Math.floor((Math.random() * 10));;
                    }

                    generate2fa(admin.email, code);
                    
                    await auditSchema.create({
                        action: action,
                        date: date
                    })
                    console.log(code);
                    res.json({status: "Success!", token: token, otp: code});

                }
                else {
                    res.json({status: "Incorrect Password!"});
                }
            }
            else {
                res.json({status: "Incorrect Email!"});
            }    
            
        } catch (error) {
            res.send(error);
        }
    }
})

router.post("/authorizeUser", async(req, res) => {
    const token = req.body.token.split("\"")[1];

    const decode = jwt.verify(token, "Secret");

    const id = decode._id;
    try {
        const student = await regStudentsSchema.findById(id)

        if (student) {
            res.json({status: "Student"});
        }
        else{
            res.json({status: "Error"});
        }
    } catch (error) {
        res.json({status: "Error"})
    }
    
})


router.post("/authorizeAdmin", async(req, res) => {

    const token = req.body.token.split("\"")[1];

    const decode = jwt.verify(token, "Secret")
   
    const id = decode._id;
    try {
        const admin = await adminSchema.findById(id)
        if (admin) {
            res.json({status: "Admin"});
        }
        else{
            res.json({status: "Error"});
        }
    } catch (error) {
        res.json({status: "Error"})
    }

})



const generate2fa = (email, code) => {

    const receive = {
        from: "digital.archive.otp@gmail.com",
        to: email,
        subject: "Test-Run",
        text: "Your One Time Password is: " + code + "\nPlease use this to log-in"
    };

    transporter.sendMail(receive, function(error, info)
    {
        if (error) {
            console.log(error);
            generate2fa();
        }
        else{
            console.log("Code Sent to " + email);
        }
    });

    
}

module.exports = router;

