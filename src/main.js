import { Clerk } from '@clerk/clerk-js';

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error('Add your VITE_CLERK_PUBLISHABLE_KEY to .env file');
}

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
      const phone = formData.get('phone');

      try {
        // Start the sign-up process using the user's identifier. In this case, it's their phone number.
        const { supportedFirstFactors } = await clerk.client.signIn.create({
          identifier: phone,
        });

        // Find the phoneNumberId from all the available first factors for the current sign-in
        const firstPhoneFactor = supportedFirstFactors.find((factor) => {
          return factor.strategy === 'phone_code';
        });

        const { phoneNumberId } = firstPhoneFactor;

        // Prepare first factor verification, specifying
        // the phone code strategy.
        await clerk.client.signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId,
        });

        // Hide sign-in form
        document.getElementById('sign-in').setAttribute('hidden', '');
        // Show verification form
        document.getElementById('verifying').removeAttribute('hidden');
        // Clear any previous errors
        errorContainer.setAttribute('hidden', '');
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
      const verify = await clerk.client.signIn.attemptFirstFactor({
        strategy: 'phone_code',
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
