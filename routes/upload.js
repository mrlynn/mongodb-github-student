var csv = require('fast-csv');
var mongoose = require('mongoose');
var Code = require('../models/code');
 
exports.post = function (req, res) {
    console.log("In Post");
    if (!req.files) {
        req.flash('error','No files were uploaded');
        return res.redirect("/upload");
        // return res.status(400).send('No files were uploaded.');
    }
     
    var codeFile = req.files.file;
 
    var codes = [];
         
    csv
     .parseString(codeFile.data.toString(), {
         headers: true,
         ignoreEmpty: true
     })
     .on("data", function(data){
         data['_id'] = new mongoose.Types.ObjectId();
         console.log("got: " + JSON.stringify(data));
         codes.push(data);
     })
     .on("end", function(){
         Code.create(codes, function(err, documents) {
            if (err) throw err;
         });
         res.send(codes.length + ' codes have been successfully uploaded.');
     });
};