var { parse } = require('json2csv');
 
exports.get = function(req, res) {
 
    var fields = [
        'code',
        'value'
    ];
    const opts = { fields };

    var csv = parse({ },opts);
 
    res.set("Content-Disposition", "attachment;filename=codes.csv");
    res.set("Content-Type", "application/octet-stream");
 
    res.send(csv);
 
};