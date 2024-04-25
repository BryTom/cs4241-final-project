<script>
    let players = [];
  
    const ws = new WebSocket( 'ws://127.0.0.1:3000' )
  
    // when connection is established...
    ws.onopen = () => {
      ws.send( 'a new client has connected.' )
      ws.onmessage = async msg => {
        // add message to end of msgs array,
        // re-assign to trigger UI update
        const message = await msg.data.text()

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

    const creategame = function(){
      var playerNumberInput = document.getElementById("numberOfPlayer");
      console.log(playerNumberInput.value)
      ws.send(playerNumberInput.value)
    }
  
  </script>
  
  <!--<input type='text' on:change={send} />-->
  
  <input id="numberOfPlayer" type="number">
  <button type="submit" on:click={creategame}>Create Game</button>
  
  
  <!--{#each msgs as msg }-->
  <!--  <h3>{msg}</h3>-->
  <!--{/each}-->