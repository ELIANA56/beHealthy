let mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "Ofakim123?",
    database: "BeHealthyDB"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL!");

    // 1. יצירת טבלת משתמשים
    let sqlUsers = `CREATE TABLE IF NOT EXISTS Users (
        User_ID INT PRIMARY KEY AUTO_INCREMENT, 
        Full_Name VARCHAR(255), 
        Age INT, 
        Weight DECIMAL(5,2), 
        Height INT, 
        Daily_Calorie_Budget INT, 
        Goal_Type VARCHAR(50)
    )`;
    con.query(sqlUsers, function(err) {
        if (err) throw err;
        console.log("Table 'Users' created");
    });

    // 2. יצירת טבלת אבטחה (Login)
    let sqlAuth = `CREATE TABLE IF NOT EXISTS User_Auth (
        Auth_ID INT PRIMARY KEY AUTO_INCREMENT,
        User_ID INT,
        Email VARCHAR(255) UNIQUE,
        Password_Hash VARCHAR(255),
        Last_Login DATETIME,
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlAuth, function(err) {
        if (err) throw err;
        console.log("Table 'User_Auth' created");
    });

    // 3. יצירת טבלת יומן ארוחות (כולל חלבון, פחמימות, שומן וברזל)
    let sqlMeals = `CREATE TABLE IF NOT EXISTS Meals_Log (
        Meal_ID INT PRIMARY KEY AUTO_INCREMENT,
        User_ID INT,
        Meal_Type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
        Protein_Grams DECIMAL(5,2),
        Carbs_Grams DECIMAL(5,2),
        Fats_Grams DECIMAL(5,2),
        Iron_Mg DECIMAL(5,2),
        Total_Calories INT,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        Image_Path VARCHAR(255),
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlMeals, function(err) {
        if (err) throw err;
        console.log("Table 'Meals_Log' created");
    });

    // 4. יצירת טבלת אימונים
    let sqlWorkouts = `CREATE TABLE IF NOT EXISTS Workouts (
        Workout_ID INT PRIMARY KEY AUTO_INCREMENT,
        User_ID INT,
        Workout_Type VARCHAR(255),
        Duration_Minutes INT,
        Calories_Burned INT,
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlWorkouts, function(err) {
        if (err) throw err;
        console.log("Table 'Workouts' created");
    });

    // 5. יצירת טבלת ניתוח מגמות (Health Trends)
    let sqlTrends = `CREATE TABLE IF NOT EXISTS Health_Trends (
        Trend_ID INT PRIMARY KEY AUTO_INCREMENT,
        User_ID INT,
        Date DATE,
        Remaining_Calories INT,
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlTrends, function(err) {
        if (err) throw err;
        console.log("Table 'Health_Trends' created");
    });

    // 6. יצירת טבלת תוכן (המאמרים של אליענה ואליענה)
    let sqlContent = `CREATE TABLE IF NOT EXISTS Content_Hub (
        Article_ID INT PRIMARY KEY AUTO_INCREMENT,
        Title VARCHAR(255),
        Body_Content TEXT,
        Author_Name VARCHAR(255) DEFAULT 'Eliana & Eliana | BE HEALTHY'
    )`;
    con.query(sqlContent, function(err) {
        if (err) throw err;
        console.log("Table 'Content_Hub' created");
    });
});