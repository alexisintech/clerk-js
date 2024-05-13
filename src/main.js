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
        await clerk.client.signIn.create({
          identifier: emailAddress,
          password,
        });

        // Hide sign-in form
        document.getElementById('sign-in').setAttribute('hidden', '');
        // Show verification form
        document.getElementById('verifying').removeAttribute('hidden');
      } catch (error) {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.error(error);
      }
    });

  // Handle the verification form
  document.getElementById('verifying').addEventListener('submit', async (e) => {
    const formData = new FormData(e.target);
    const totp = formData.get('totp');
    const backupCode = formData.get('backupCode');

    console.log(backupCode);

    try {
      const useBackupCode = backupCode ? true : false;
      const code = backupCode ? backupCode : totp;

      // Attempt the TOTP or backup code verification
      const signInAttempt = await clerk.client.signIn.attemptSecondFactor({
        strategy: useBackupCode ? 'backup_code' : 'totp',
        code: code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await clerk.setActive({ session: signInAttempt.createdSessionId });

        location.reload();
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(signInAttempt);
      }
    } catch (error) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(error);
    }
  });
}
