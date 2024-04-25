<!-- NavigationLinks.svelte -->
<script>
    import { Link } from 'svelte-routing';
    import {addWin} from './database';

</script>

<button on:click={() => addWin("exampleName") }> Test </button>

<nav>
    <Link to="/login" >Sign In</Link>
    <Link to="/home">New Game</Link>
    <Link to="/game">Join Game</Link>
</nav>
