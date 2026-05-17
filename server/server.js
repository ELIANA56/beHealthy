const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ofakim123?",
    database: "BeHealthyDB"
});

// --- LOGIQUE D'INSCRIPTION (SIGN UP) ---
// Cette route remplit les tables 'Users' et 'User_Auth'
app.post('/api/register', (req, res) => {
    const { 
        Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type, 
        Email, Password 
    } = req.body;

    // 1. On crée d'abord le profil utilisateur
    const sqlUser = `INSERT INTO Users (Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sqlUser, [Full_Name, Age, Weight, Height, Daily_Calorie_Budget, Goal_Type], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la création du profil." });

        const newUserId = result.insertId;

        // 2. On crée ensuite les identifiants de connexion liés à cet ID
        const sqlAuth = `INSERT INTO User_Auth (User_ID, Email, Password_Hash, Last_Login) 
                         VALUES (?, ?, ?, NOW())`;

        db.query(sqlAuth, [newUserId, Email, Password], (err) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la création des identifiants." });
            
            res.status(201).json({ 
                message: "Compte créé avec succès !", 
                userId: newUserId 
            });
        });
    });
});

// --- LOGIQUE DE CONNEXION (LOGIN) ---
// Cette route vérifie uniquement l'Email et le Password
app.post('/api/login', (req, res) => {
    const { Email, Password } = req.body;

    const sql = `SELECT User_ID, Email, Password_Hash FROM User_Auth WHERE Email = ?`;

    db.query(sql, [Email], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur." });

        if (results.length === 0) {
            return res.status(401).json({ error: "Utilisateur non trouvé." });
        }

        const user = results[0];

        // Vérification du mot de passe (en texte brut ici selon votre DB actuelle)
        if (user.Password_Hash === Password) {
            
            // Mise à jour de la date de dernière connexion
            db.query("UPDATE User_Auth SET Last_Login = NOW() WHERE User_ID = ?", [user.User_ID]);

            res.json({ 
                message: "Connexion réussie", 
                userId: user.User_ID 
            });
        } else {
            res.status(401).json({ error: "Mot de passe incorrect." });
        }
    });
});

app.listen(3000, () => console.log("Serveur d'authentification prêt sur le port 3000"));