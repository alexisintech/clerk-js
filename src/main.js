import "./style.css";
import { Clerk } from "@clerk/clerk-js";

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error("Add your VITE_CLERK_PUBLISHABLE_KEY to .env file");
}

const clerk = new Clerk(pubKey);
await clerk.load();

if (clerk.user) {
  console.log(clerk.user);

  // Mount user button component
  document.getElementById("app").innerHTML = `
    <div id="user-button"></div>
  `;

  const userbuttonDiv = document.getElementById("user-button");

  clerk.mountUserButton(userbuttonDiv);
} else {
  document
    .getElementById("sign-up-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const phone = formData.get("phone");
      console.log(phone);

      try {
        await clerk.client.signUp.create({
          phoneNumber: phone,
        });
        await clerk.client.signUp.preparePhoneNumberVerification();
        //hide signup form
        document.getElementById("sign-up").setAttribute("hidden", "");
        //show verification form
        document.getElementById("verifying").removeAttribute("hidden");
      } catch (error) {
        console.error(error);
      }
    });

  document.getElementById("verifying").addEventListener("submit", async (e) => {
    const formData = new FormData(e.target);
    const code = formData.get("code");
    console.log(code);

    try {
      // Verify the email address.
      const verify = await clerk.client.signUp.attemptPhoneNumberVerification({
        code,
      });
      console.log(verify);
      // User is created. Now, set the session to active. session is never null.
      await clerk.setActive({ session: verify.createdSessionId });
    } catch (error) {
      console.error(error);
    }
  });
}
