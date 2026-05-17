let mysql=require('mysql2')
let con= mysql.createConnection({
    host: "localhost",
    user : "root",
    password :"Ofakim123?"    

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
