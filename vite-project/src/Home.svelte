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
</script>

{#if user}
    <p>Welcome, {user.username}!</p>
    <img src={user.avatarUrl} alt="User Avatar" />
{:else}
    <p>Not authenticated</p>
{/if}
<a href="/auth/github">Sign In with GitHub</a>
<nav>
    <Link to="/home">New Game</Link>
    <Link to="/game">Join Game</Link>
</nav>
