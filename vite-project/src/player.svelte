<script>
    let client = [];
  
    const ws = new WebSocket( 'ws://127.0.0.1:3000' )
  
    // when connection is established...
    ws.onopen = () => {
      ws.send( 'a new client has connected.' )
      ws.onmessage = async msg => {
        // add message to end of msgs array,
        // re-assign to trigger UI update
        const message = await msg.data.text()
        switch(message){
          case "1":
            hp1--;
            break;
          case "2":
            hp2--;
            break;
          case "3":
            hp3--;
            break;
          case "4":
            hp4--;
            break;
        }
  
  
      }
    }
  
    // const send = function(txt) {
    //   ws.send( txt )
    //   msgs = msgs.concat([ 'me: ' + txt ])
    // }
  
    const countdown = function() {
      console.log("counting down")
      // let val = this.textContent;
      let playerId = this.id; //player1 player2 etc
      console.log(playerId)
      ws.send(playerId)
    }
  
  </script>
  
  <!--<input type='text' on:change={send} />-->
  
  
  
  <button on:click={countdown} id="1">{hp1}</button>
  <button on:click={countdown} id="2">{hp2}</button>
  <button on:click={countdown} id="3">{hp3}</button>
  <button on:click={countdown} id="4">{hp4}</button>
  
  
  <!--{#each msgs as msg }-->
  <!--  <h3>{msg}</h3>-->
  <!--{/each}-->