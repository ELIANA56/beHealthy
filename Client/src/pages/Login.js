function login() {
  const email = document.getElementById("logUser").value; // On utilise email pour correspondre au serveur
  const password = document.getElementById("logPass").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    // CRUCIAL : Les clés doivent correspondre à ce que req.body attend côté serveur
    body: JSON.stringify({ Email: email, Password: password }) 
  })
    .then(res => {
      if (!res.ok) {
        // Si le serveur renvoie 401 ou 500, on attrape l'erreur
        return res.json().then(err => { throw new Error(err.error) });
      }
      return res.json(); // On attend du JSON, pas du texte
    })
    .then(data => {
      alert("Connexion réussie !");

      // On stocke le userId renvoyé par le serveur
      localStorage.setItem("userId", data.userId);

      // Redirection
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      alert("Erreur : " + err.message);
    });
}