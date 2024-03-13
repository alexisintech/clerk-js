import "./style.css";
import Clerk from "@clerk/clerk-js";

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error("Add your VITE_CLERK_PUBLISHABLE_KEY to .env file");
}

const clerk = new Clerk(pubKey);
await clerk.load();

if (clerk.user) {
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
  // Selects for <div id="app"> and adds <div id="sign-in">
  document.getElementById("app").innerHTML = `
    <div id="sign-in"></div>
  `;

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
