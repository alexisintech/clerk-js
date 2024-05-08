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
} else {
  const errorContainer = document.getElementById('error');

  // Handle the sign-in form
  document
    .getElementById('sign-in-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const emailAddress = formData.get('email');
      const password = formData.get('password');

      try {
        // Start the sign-in process
        const signInAttempt = await clerk.client.signIn.create({
          identifier: emailAddress,
          password,
        });

        // If the sign-in is complete, set the user as active
        if (signInAttempt.status === 'complete') {
          await clerk.setActive({ session: signInAttempt.createdSessionId });
          location.reload();
        } else {
          errorContainer.removeAttribute('hidden');
          errorContainer.innerHTML = error.errors[0].longMessage;
          console.error(error);
        }
      } catch (error) {
        // errorContainer.removeAttribute('hidden');
        // errorContainer.innerHTML = error.errors[0].longMessage;
        console.error(error);
      }
    });
}
