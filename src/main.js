import { Clerk } from '@clerk/clerk-js';

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

  // Handle the sign-up form
  document
    .getElementById('sign-up-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const phoneNumber = formData.get('phone');

      try {
        // Start the sign-up process using the phone number method
        await clerk.client.signUp.create({ phoneNumber });
        await clerk.client.signUp.preparePhoneNumberVerification();
        // Hide sign-up form
        document.getElementById('sign-up').setAttribute('hidden', '');
        // Show verification form
        document.getElementById('verifying').removeAttribute('hidden');
      } catch (error) {
        errorContainer.removeAttribute('hidden');
        errorContainer.innerHTML = error.errors[0].longMessage;
        console.error(error);
      }
    });

  // Handle the verification form
  document.getElementById('verifying').addEventListener('submit', async (e) => {
    const formData = new FormData(e.target);
    const code = formData.get('code');

    try {
      // Verify the phone number
      const verify = await clerk.client.signUp.attemptPhoneNumberVerification({
        code,
      });

      // Now that the user is created, set the session to active.
      await clerk.setActive({ session: verify.createdSessionId });
    } catch (error) {
      errorContainer.removeAttribute('hidden');
      errorContainer.innerHTML = error.errors[0].longMessage;
      console.error(error);
    }
  });
}
