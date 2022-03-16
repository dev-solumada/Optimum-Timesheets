const express = require("express");
const routeExp = express.Router();
const mongoose = require("mongoose");
const UserSchema = require("../models/User");
const TimesheetsSchema = require("../models/Timesheets");
const projectSchema = require("../models/Project");
const nodemailer = require('nodemailer');
const moment = require("moment");
const ExcelFile = require("sheetjs-style");
var hours = 0;
var minutes =0
const newsheet = ExcelFile.utils.book_new();
newsheet.Props = {
  Title: "Timesheets",
  Subject: "Logged Time",
  Author : "Optimum solution"
};
//Mailing
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'developpeur.solumada@gmail.com',
    pass: 'S0!um2d2'
  }
});
function sendEmail(receiver,subject,text){
  var mailOptions = {
    from: 'Timesheets Optimum solution',
    to: receiver,
    subject: subject,
    html: text
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

//Page login
routeExp.route("/").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "user"){
    res.redirect("/timedefine");
  }
  else if (session.occupation == "admin"){
    res.redirect('/management');
  }
  else{
    res.render("LoginPage.html", { erreur: "" });
  }
  
});
//Post login
routeExp.route("/login").post(async function (req, res) {
  session = req.session;
  var email = req.body.username;
  var password = req.body.pwd;
  mongoose
    .connect(
      "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      {
        useUnifiedTopology: true,
        UseNewUrlParser: true,
      }
    )
    .then(async () => {
      var logger = await UserSchema.findOne({ username: email, password: password });
      if (logger) {
        if (logger.occupation == "user") {
          session.occupation = logger.occupation;
          session.m_code = logger.m_code;
          session.num_agent = logger.num_agent;
          res.redirect("/timedefine");
        } else {
          session.occupation = logger.occupation;
          res.redirect("/management");
        }
      } else {
        res.render("LoginPage.html", {
          erreur: "Email or password is wrong",
        });
      }
    });
});

//New employee
routeExp.route("/newemployee").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "admin"){
    res.render("newemployee.html");
  }
  else{
    res.redirect("/");
  }
});
//Management Page
routeExp.route("/management").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "admin"){
    res.render("ManagementPage.html");
  }
  else{
    res.redirect("/");
  }
});
//Employees page
routeExp.route("/employees").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "admin"){
    mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
      var timesheets = await TimesheetsSchema.find({validation:true});
      res.render("employees.html",{timesheets:timesheets});
  });
  }
  else{
    res.redirect("/");
  }
});
//Validation page
routeExp.route("/validation").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "admin"){
    mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
      var timesheets = await TimesheetsSchema.find({validation:false});
      res.render("Validation.html",{timesheets:timesheets});
  });
  }
  else{
    res.redirect("/");
  }
});
//Define time page
routeExp.route("/timedefine").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "user"){
    mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
    var projects = await projectSchema.find({status:'In Progress'});
    res.render("Timedefine.html",{available_project:projects});
  });
  }
  else{
    res.redirect("/");
  }
});

//Add employee
routeExp.route("/addemp").post(async function (req, res) {
    var email = req.body.email;
    var mcode = req.body.mcode;
    var num_agent = req.body.num_agent;
    mongoose
      .connect(
        "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        {
          useUnifiedTopology: true,
          UseNewUrlParser: true,
        }
      )
      .then(async () => {
        if ( await UserSchema.findOne({$or :[{username:email},{m_code:mcode},{num_agent:num_agent}]})) {
          res.send("error");
        } else {
          var passdefault = randomPassword();
          var new_emp = {
            username: email,
            password: passdefault,
            m_code: mcode,
            num_agent: num_agent,
            occupation: "user",
          };
          await UserSchema(new_emp).save();
          sendEmail(email,"Authentification Timesheets",htmlRender(email,passdefault));
          res.send(email);
        }
      });
  
});
//Savetime user
routeExp.route("/savetime").post(async function (req, res) {
  session = req.session;
    var project = req.body.project;
    var date = req.body.date;
    var start_time = req.body.start;
    var end_time = req.body.end;
    var task = req.body.task;
    var new_time = {
      m_code:session.m_code,
      num_agent:session.num_agent,
      projects: project,
      date:date,
      time_start: start_time,
      time_end:end_time,
      task:task,
      validation:false
    }
    mongoose
    .connect(
      "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      {
        useUnifiedTopology: true,
        UseNewUrlParser: true,
      }
    )
    .then(async () => {
        await TimesheetsSchema(new_time).save();
        sendEmail("ricardoramandimbisoa@gmail.com","Time logged",htmlAlert(session.m_code));
        res.send("Time for task "+ task+" saved");
    })
})
//add new project
routeExp.route("/addproject").post(async function (req, res) {

  var project = req.body.projet;
  var status = req.body.status;
  var new_project = {
      project_name:project,
      status:status
  }
  mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
    if (await projectSchema.findOne({project_name:project})){
      res.send("Project "+project+" already exist");
    }
    else{
      await projectSchema(new_project).save();
      res.send("Project "+project+" added successfuly");
    }
      
  })
})
//Validation
routeExp.route("/validate").post(async function (req, res) {
    var id = req.body.id;
    mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
    await TimesheetsSchema.findOneAndUpdate({_id:id},{validation:true});
    res.send("Ok");
  })
})
//Denied
routeExp.route("/denied").post(async function (req, res) {
  var id = req.body.id;
  var m_code = req.body.m_code;
  var message = req.body.message;
  var task = req.body.task;
  mongoose
.connect(
  "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useUnifiedTopology: true,
    UseNewUrlParser: true,
  }
)
.then(async () => {
  var user = await UserSchema.findOne({m_code:m_code});
  await TimesheetsSchema.findOneAndDelete({_id:id});
  var text = "<p>Hello,</p>"+"<p>Your task"+ task + " is rejected because:</p>"+"<p style='margin-left:30px;'>"+message+"<p><p>Regards</p>";
  sendEmail(user.username,"Rejected Time logged",text);
  res.send("Ok");
})
})
//Validate all
routeExp.route("/valideall").get(async function (req, res) {
  session = req.session;
  if (session.occupation == "admin"){
  mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
    await TimesheetsSchema.updateMany({validation:false},{validation:true});
    res.redirect("/employees");
  })
}
else{
  res.redirect("/");
}
})
//Reset password
routeExp.route("/reset").get(async function (req, res) {
  session = req.session;
  if (session.mailconfirm){
    res.redirect('/code');
  }
  else{
    res.render("reset.html",{err:""});
  }
})
//New password
routeExp.route("/code").post(async function (req, res) {
  session = req.session;
    var email = req.body.username;
    mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
    if (await UserSchema.findOne({username:email})){
        session.mailconfirm = email;
        session.code = randomCode();
        sendEmail(session.mailconfirm,"Verification code timesheets",htmlVerification(session.code));
        res.redirect("/code");
    }
    else{
      res.render('reset.html',{err:"Username does not exist"});
    }
  })
})
//code
routeExp.route("/code").get(async function (req, res) {
  session = req.session;
  if (session.mailconfirm){
    res.render("code.html",{err:""});
  }
  else{
    res.redirect("/");
  }
  
})
//Check code
routeExp.route("/check").post(async function (req, res) {
  session = req.session;
  if (session.code == req.body.code){
    res.send("match");
  }
  else{
    res.send("not");
  }
})
//Change password
routeExp.route("/change").post(async function (req, res) {
  var newpass = req.body.pass;
  session = req.session;
  mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
      await UserSchema.findOneAndUpdate({username:session.mailconfirm},{password:newpass});
      req.session.destroy();
      session = req.session;
      res.send("Ok");
  })
})
//Generate excel file
routeExp.route("/generate").post(async function (req, res) {
  var data=[];
  var totaltime="";
  mongoose
  .connect(
    "mongodb+srv://Rica:ryane_jarello5@cluster0.z3s3n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      UseNewUrlParser: true,
    }
  )
  .then(async () => {
    var all_employes = await UserSchema.find({occupation:"user"});
    for (e=0;e<all_employes.length;e++){
      newsheet.SheetNames.push(all_employes[e].num_agent);
      var datatowrite = await TimesheetsSchema.find({num_agent:all_employes[e].num_agent});
      data.push(["MCODE","Number of Agent","Project Name","Date","Task ","Start Time","End Time"]);
      for (i=0;i<datatowrite.length;i++){
          var ligne = [
            datatowrite[i].m_code,
            datatowrite[i].num_agent,
            datatowrite[i].projects,
            datatowrite[i].date,
            datatowrite[i].task,
            datatowrite[i].time_start,
            datatowrite[i].time_end
          ]
          data.push(ligne);
          calcul_timediff(datatowrite[i].time_start, datatowrite[i].time_end);
      }
      totaltime = hours +"H "+ minutes +"MN";
      data.push(["","","","","","TOTAL",totaltime]);
      var ws = ExcelFile.utils.aoa_to_sheet(data);
      var cellule = ["A","B","C","D","E","F","G"];
      for (c=0;c<cellule.length;c++){
          for (i=1;i<=data.length;i++){
              if (ws[cellule[c]+""+i]){
                if (i==1){
                  ws[cellule[c]+""+i].s = {						// set the style for target cell
                    font: {
                      name: 'Times New Roman',
                      bold:true
                    },
                    border:{
                      left: { style: 'thin', color: { rgb: 'FF000000' } },
                      right: { style: 'thin', color: { rgb: 'FF000000' } },
                      top: { style: 'thin', color: { rgb: 'FF000000' },
                      bottom: { style: 'thin', color: { rgb: 'FF000000' } }
                    }
                  }
                };
                }
                else{
                  ws[cellule[c]+""+i].s = {									// set the style for target cell
                    font: {
                      name: 'Times New Roman',
                    },
                    border:{
                      left: { style: 'thin', color: { rgb: 'FF000000' } },
                      right: { style: 'thin', color: { rgb: 'FF000000' } },
                      top: { style: 'thin', color: { rgb: 'FF000000' },
                      bottom: { style: 'medium', color: { rgb: 'FF000000' } }
                    }
                  }
                };
                }
                
              }
          }
      }
      console.log("Sheetnames",all_employes[e].num_agent);
    newsheet.Sheets[all_employes[e].num_agent] = ws;
    hours=0;minutes=0;data=[];
    }
    if (newsheet.SheetNames.length != 0){
      ExcelFile.writeFile(newsheet,"Timesheets.xlsx",);
    }
    res.send("Done");
  })
  
})
//download
routeExp.route("/download").get(async function (req, res) {
    var file = "Timesheets.xlsx";
    res.download(file);
})
//Logout
routeExp.route("/logout").get(function (req, res) {
  req.session.destroy();
  session = req.session;
  res.redirect("/");
});
//Function Random code for verification
function randomCode() {
  var code = "";
  let v = "012345678";
  for (let i = 0; i < 6; i++) { // 6 characters
    let char = v.charAt(Math.random() * v.length - 1);
    code += char;
  }
  return code;
}

//Function random password for new user
function randomPassword() {
  var code = "";
  let v = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!é&#";
  for (let i = 0; i < 8; i++) { // 6 characters
    let char = v.charAt(Math.random() * v.length - 1);
    code += char;
  }
  return code;
}
//Function html render
function htmlRender(username,password){
  var html = '<center><h1>Your Timesheets Authentification</h1>'+
  '<table border="1" style="border-collapse:collapse;width:25%;border-color: lightgrey;">'+
        '<thead style="background-color: #619FCB;color:white;font-weight:bold;height: 50px;">'+
            '<tr>'+
                '<td align="center">Username</td>'+
                '<td align="center">Password</td>'+
            '</tr>'+
        '</thead>'+
        '<tbody style="height: 50px;">'+
            '<tr>'+
                '<td align="center">'+username+'</td>'+
                '<td align="center">'+password+'</td>'+
            '</tr>'+
        '</tbody>'+
    '</table>';
return html;
}
function htmlAlert(user){
    var html = '<p> Hello,</p>'+
    '<br>'+
    '<p>Employee with M-CODE : <b>'+user+'</b> logged a time</p>'+
    '<p>Please check it in a timesheets validation page</p>'+
    '<br>'+
    '<p>Regards</p>';
    return html;
    
}
function calcul_timediff(startTime,endTime){
   startTime = moment(startTime, 'HH:mm:ss a');
   endTime = moment(endTime, 'HH:mm:ss a');
  var duration = moment.duration(endTime.diff(startTime));
  //duration in hours
  hours += parseInt(duration.asHours());

  // duration in minutes
  minutes += parseInt(duration.asMinutes()) % 60;
  while(minutes>60){
    hours+=1;
    minutes = minutes - 60;
  }

}
function htmlVerification(code){
  return "<center><h1>YOUR TIMESHEETS CODE AUTHENTIFICATION</h1>"+"<h3 style='width:250px;font-size:50px;padding:8px;background-color:#619FCB; color:white'>"+code+"<h3></center>"
}
module.exports = routeExp;
