const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const port = process.env.PORT || 3001;
const User = require('./dbConnection');
const nodemailer = require('nodemailer');

mongoose.connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB is Connected");
}).catch((err) => {
    console.log("Error", err)
});

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post("/checkEmail", async function (req, res) {
    var Email = req.body.Email;
    var userEmailExist = await User.findOne({ Email });
    console.log(userEmailExist);
    if (userEmailExist) {
        res.status(422).send({message:"Email ID Exist"});
    }
    else {
        res.status(201).send({ message: "Go Ahead" });
    }
});

app.post("/register", async function (req, res) {
    try {
        const { Name, Email, Password } = req.body;
        if (!Name || !Email || !Password) {
            res.send({ message: "Please Enter All Feilds" });
        }

        const userRegister = await User.findOne({ Email });
        console.log(userRegister);
        if (userRegister) {
            res.status(422).send({ message: "Email ID Exist" });
        }
        else {
            const user = new User({ Name, Email, Password });
            const userData = await user.save();
            if (userData) {
                res.status(201).send({ message: "User is Registerd" });
            }
            else {
                res.status(422).send({ message: "Some Thing Went Wrong" });
            }
        }
    }
    catch (err) {
        console.log(err)
    }
});

app.post("/login", async function (req, res) {
    try {
        let token;
        const { Email, Password } = req.body;
        if (!Email || !Password) {
            res.status(422).send({ message: "Please Enter Vaild Email & Password" });
        }

        const userLogin = await User.findOne({ Email });

        if (userLogin) {
            if (userLogin.Password == Password) {
                token = await userLogin.generateAuth();
                console.log(token);
                res.status(202).send({ message: "Loged IN" });
            }
            else {
                res.status(422).send({ message: "Invalid Credentails" });
            }
        }
        else {
            res.status(422).send({ message: "Invalid Credentails" });
        }
    }
    catch (err) {
        console.log(err);
    }
});

var OTP = '';
app.post("/SendEmail", async function (req, res) {
    const { Name, Email } = req.body;
    OTP = Math.floor(100000 + Math.random() * 900000);
    try {
        var transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Gmail_APP_USER,
                pass: process.env.Gmail_APP_PASS
            }
        });
        var mailoption = {
            from: "kunaljethva0@gmail.com",
            to: Email,
            subject: "Email Verification Code",
            html: `
                <h3>Hello ${Name},</h3>
            <h5>To Verify Your Email, Code Is ${OTP}.</h5>
            <h5>Thanks,<br>
                Kunal Jethva
            </h5>
            `
        };

        transport.sendMail(mailoption, function (err, info) {
            if (err) {
                console.log(err)
            }
            else {
                res.status(201).send(info);
            };
        });
    }
    catch (err) {
        console.log(err);
    }
});

app.post("/verfiyOTP", function (req, res) {
    var ReqOTP = req.body.OTP;
    console.log("User Entered OTP", ReqOTP);
    console.log("Email OTP", OTP);
    if (ReqOTP == OTP) {
        res.status(201).send({ message: "Valid OTP" });
    }
    else {
        res.status(422).send("Invalid OTP");
    }
});

app.listen(`${port}`);



