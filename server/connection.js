let mysql=require('mysql2')
let con= mysql.createConnection({
    host: "localhost",
    user : "root",
    password :"balet2balet"
    

});
con.connect(function(err){
if(err) throw err;
console.log("Connnected");
let sql = "CREATE DATABASE BeHealthyDB"
con.query(sql,function(err, result ){
    if(err) throw err;
    console.log(" database created");
});
 
});
