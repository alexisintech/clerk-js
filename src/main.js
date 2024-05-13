import './style.css';
import Clerk from '@clerk/clerk-js';

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error('Add your VITE_CLERK_PUBLISHABLE_KEY to .env file');
}

// Initialize Clerk with your Clerk publishable key
const clerk = new Clerk(pubKey);
await clerk.load();

if (clerk.user) {
  // Mount user button component
  document.getElementById('signed-in').innerHTML = `
    <div id="user-button"></div>
  `;

  const userbuttonDiv = document.getElementById('user-button');

  clerk.mountUserButton(userbuttonDiv);

  document.getElementById('sign-out').addEventListener('click', async () => {
    await clerk.signOut();
  });
}
