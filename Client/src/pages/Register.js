function signup() {
    // Récupération de toutes les données du formulaire
    const userData = {
      Full_Name: document.getElementById("regName").value,
      Age: parseInt(document.getElementById("regAge").value),
      Weight: parseFloat(document.getElementById("regWeight").value),
      Height: parseInt(document.getElementById("regHeight").value),
      Daily_Calorie_Budget: parseInt(document.getElementById("regBudget").value),
      Goal_Type: document.getElementById("regGoal").value, // Ex: "Perte de poids"
      Email: document.getElementById("regEmail").value,
      Password: document.getElementById("regPass").value
    };
  
    // Vérification rapide que rien n'est vide
    if (!userData.Email || !userData.Password || !userData.Full_Name) {
      alert("Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe)");
      return;
    }
  
    fetch(`${API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error) });
        }
        return res.json();
      })
      .then(data => {
        alert(data.message); // "Compte créé avec succès !"
        
        // On stocke l'ID pour la session
        localStorage.setItem("userId", data.userId);
        
        // Direction le dashboard pour commencer l'aventure
        window.location.href = "dashboard.html";
      })
      .catch(err => {
        alert("Erreur lors de l'inscription : " + err.message);
      });
  }