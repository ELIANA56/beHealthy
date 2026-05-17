let mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ofakim123?",
    database: "BeHealthyDB"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to BeHealthyDB successfully!");

    // 1. טבלת משתמשים (Users)
    let sqlUsers = `CREATE TABLE IF NOT EXISTS Users (
        User_ID INT AUTO_INCREMENT PRIMARY KEY,
        Full_Name VARCHAR(50),
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

    // 2. טבלת יומן ארוחות (Meals_Log)
    let sqlMeals = `CREATE TABLE IF NOT EXISTS Meals_Log (
        Meal_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Meal_Type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
        Protein_Grams DECIMAL(5,2),
        Carbs_Grams DECIMAL(5,2),
        Fats_Grams DECIMAL(5,2),
        Timestamp DATETIME,
        Total_Calories INT,
        Image_Path VARCHAR(255),
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlMeals, function(err) {
        if (err) throw err;
        console.log("Table 'Meals_Log' created");
    });

    // 3. טבלת מאגר מתכונים (Recipes)
    let sqlRecipes = `CREATE TABLE IF NOT EXISTS Recipes (
        Recipe_ID INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(100),
        Ingredients TEXT,
        Instructions TEXT,
        Calories_Per_Serving INT
    )`;
    con.query(sqlRecipes, function(err) {
        if (err) throw err;
        console.log("Table 'Recipes' created");
    });

    // 4. טבלת ניתוח מגמות (Health_Trends)
    let sqlTrends = `CREATE TABLE IF NOT EXISTS Health_Trends (
        Trend_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Date DATE,
        Remaining_Calories INT,
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlTrends, function(err) {
        if (err) throw err;
        console.log("Table 'Health_Trends' created");
    });

    // 5. טבלת תוכן ומאמרים (Content_Hub)
    let sqlContent = `CREATE TABLE IF NOT EXISTS Content_Hub (
        Article_ID INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(200),
        Body_Content LONGTEXT,
        Author_Name VARCHAR(50) DEFAULT 'אליענה & אליענה'
    )`;
    con.query(sqlContent, function(err) {
        if (err) throw err;
        console.log("Table 'Content_Hub' created");
    });

    // 6. טבלת אימונים (Workouts)
    let sqlWorkouts = `CREATE TABLE IF NOT EXISTS Workouts (
        Workout_ID INT AUTO_INCREMENT PRIMARY KEY,
        User_ID INT,
        Workout_Type VARCHAR(255),
        Duration INT,
        Calories_Burned INT,
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlWorkouts, function(err) {
        if (err) throw err;
        console.log("Table 'Workouts' created");
    });

    // 7. טבלת חשבונות ופרטי התחברות (User_Auth)
    let sqlAuth = `CREATE TABLE IF NOT EXISTS User_Auth (
        User_ID INT,
        Email VARCHAR(100) UNIQUE,
        Password_Hash VARCHAR(255),
        Last_Login DATETIME,
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
    )`;
    con.query(sqlAuth, function(err) {
        if (err) throw err;
        console.log("Table 'User_Auth' created");
        
        // סוגרים את החיבור רק אחרי שהטבלה האחרונה מסתיימת
        con.end();
    });
});