const fs = require("fs");
const express = require("express");
const multer = require("multer");

const utils = require("./Oauthmodule");
const driveutils = require("./Drivmodule");
const calendarutils = require("./Calendarutils");

var name, pic



const app = express();



var authed = false;



app.set("view engine", "ejs");

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("file"); //Field name and max count

app.get("/", (req, res) => {
  if (!authed) {
    //Generate an OAuth URL and redirect there
    var url = utils.gEtURL();
    res.render("index", { url: url });
  }
  else {
    var oauth2 = utils.oauth2();
    oauth2.userinfo.get(function (err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log(response.data);
        name = response.data.name
        pic = response.data.picture
        res.render("success", {
          name: response.data.name,
          pic: response.data.picture,
          success: false
        });
      }
    });
  }
});



app.post("/upload", (req, res) => {
  upload(req, res, async function (err) { 
    if (err) {
      console.log(err);
      return res.end("Something went wrong");
    }
    else {

      console.log(req.file.path);
      var FID = await driveutils.iSfolderExist();
      console.log("FID" + FID);

      if (FID != '') {


        const fileMetadata = {
          name: req.file.filename,
          parents: [FID],
        };
        const media = {
          mimeType: req.file.mimetype,
          body: fs.createReadStream(req.file.path),
        };

        const resdata = driveutils.sEndFile(fileMetadata, media);
        if (resdata != err) {

          fs.unlinkSync(req.file.path)
          //     //console.log(file);
          res.render("success", { name: name, pic: pic, success: true })
        }
 
      }
    }

  });
});

app.get('/logout', (req, res) => {
  authed = false
  res.redirect('/')
});

app.get("/google/callback", function (req, res) {
  const code = req.query.code;
  if (code) {
    
    // Check if we have previously stored a token.
    fs.readFile(utils.TOKEN_PATH, (err, token) => {
      if (err){
        utils.oAuth2Client.getToken(code, function (err, tokens) {
          if (err) {
            console.log("Error authenticating");
            console.log(err);
          } else {
            console.log("Successfully authenticated");
    
            console.log(tokens)
            utils.sToreToken(tokens);
    
    
            utils.oAuth2Client.setCredentials(tokens);
    
    
            authed = true;
            res.redirect("/");
          }
        });


      } 
      else{

        console.log("Reading token from file");
        utils.oAuth2Client.setCredentials(JSON.parse(token));
        authed = true;
        res.redirect("/");
        // callback(oAuth2Client);
      }
    });
    // Get an access token based on our OAuth code
    
  }
});



app.post("/calander", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.end("Something went wrong");
    }
    else {
      await calendarutils.insertEvent();
      calendarutils.calendareventList();

      res.render("calendar")
    }

  });
});




app.listen(5000, () => {
  console.log("App is listening on Port 5000");
});
