import "./style.css";
import Clerk from "@clerk/clerk-js";

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error("Add your VITE_CLERK_PUBLISHABLE_KEY to .env file");
}

const clerk = new Clerk(pubKey);
await clerk.load();

if (clerk.user) {
  console.log(clerk.user);
  // document.getElementById("create-totp").addEventListener("click", async () => {
  //   clerk.user
  //     .createTOTP()
  //     .then((res) => {
  //       console.log(res);
  //       document.getElementById("enter-totp-secret").removeAttribute("hidden");
  //       document.getElementById("totp-secret").innerHTML = res.secret;
  //       document.getElementById("verify-totp-form").removeAttribute("hidden");
  //       document
  //         .getElementById("verify-totp")
  //         .addEventListener("click", async () => {
  //           clerk.user
  //             .verifyTOTP(document.getElementById("totp-code").value)
  //             .then((res) => {
  //               console.log(res);
  //             })
  //             .catch((error) => {
  //               document.getElementById("error").innerHTML =
  //                 error.errors[0].message;
  //               console.log("An error occurred:", error.errors);
  //             });
  //         });
  //     })
  //     .catch((error) => {
  //       document.getElementById("error").innerHTML = error.errors[0].message;
  //       console.log("An error occurred:", error.errors);
  //     });
  // });

  // Mount user profile
  const userProfileComponent = document.getElementById("user-profile");
  clerk.mountUserProfile(userProfileComponent);

  // Mount user button
  const userButtonComponent = document.getElementById("user-button");
  clerk.mountUserButton(userButtonComponent);

  // Render user info
  const userInfo = document.getElementById("user-info");
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `ID: ${clerk.user.id}`;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `First name: ${clerk.user.firstName}`;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `Last name: ${clerk.user.lastName}`;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `Username: ${clerk.user.username}`;

  // Mount create org button
  const createOrgDiv = document.getElementById("create-org");
  clerk.mountCreateOrganization(createOrgDiv);
} else {
  // Mount sign in component
  document.getElementById("app").innerHTML = `
    <div id="sign-in"></div>
  `;

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
