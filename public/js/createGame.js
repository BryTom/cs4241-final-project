const submit = async function (event) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  var health = document.querySelector("#total-health"),
    players = document.querySelector("#numb-players"),
    json = { numberOfPlayers: players.value, startingHealth: health.value },
    body = JSON.stringify(json)

  console.log(body)

  const response = await fetch("/creategame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  })
  
  
  const data = await response.json();
  console.log(data);
  if (data) {
    window.location.href = '/game.html';
  } else {
    health.value = '';
    players.value = '';
    window.alert(data.msg);
  }
}

window.onload = function () {
  const submitBtn = document.querySelector("#submit");
  submitBtn.onclick = submit;
}