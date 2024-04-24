<!-- NavigationLinks.svelte -->
<script>
    let user = null;

    async function fetchUser() {
        try {
            const response = await fetch('/api/user');
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            user = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    fetchUser();

    import { Link, navigate } from 'svelte-routing';

    // Function to start the authentication process
    function signIn() {
        navigate('/auth/github');
    }
</script>

<button on:click={signIn}>Sign In</button>

{#if user}
    <p>Welcome, {user.username}!</p>
    <img src={user.avatarUrl} alt="User Avatar" />
{:else}
    <p>Not authenticated</p>
{/if}

<nav>
    <Link to="/home">New Game</Link>
    <Link to="/game">Join Game</Link>
</nav>
