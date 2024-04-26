document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/userdata");
    const data = await response.json();
    console.log(data[0].name);
    const user = data[0].name;
    const pfp = data[0].pfp;
  
    const welcomeMessage = document.getElementById("welcomeMessage");
    welcomeMessage.innerText = `Welcome Back, ${user}!`;

     const homeImage = document.getElementById("background");
    homeImage.style.backgroundImage = `url(${pfp})`;
  });
  