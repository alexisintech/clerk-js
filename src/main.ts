import "./style.css";
import Clerk from "@clerk/clerk-js";

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error("New add your VITE_CLERK_PUBLISHABLE_KEY to .env");
}

const clerkPublishableKey = pubKey;
const clerk = new Clerk(clerkPublishableKey);
await clerk.load({
  standardBrowser: true,
});

window.Clerk = clerk;

console.log("Clerk", clerk.version);

const user = clerk.user;

if (!user) {
  // Selects for <div id="app"> and adds a <div> element with id="sign-in" to your HTML
  document.querySelector<HTMLDivElement>("#auth-2")!.innerHTML = `
<div
  id="sign-in"
>
</div>
`;

  const signInComponent = document.querySelector<HTMLDivElement>("#sign-in")!;

  clerk.mountSignIn(signInComponent);
} else {
  // Mount user profile
  document.querySelector<HTMLDivElement>("#user-profile")!.innerHTML = `
<div
  id="user-profile"
></div>
`;

  const userProfileComponent =
    document.querySelector<HTMLDivElement>("#user-profile")!;

  clerk.mountUserProfile(userProfileComponent);

  // Mount user button
  const userButtonComponent =
    document.querySelector<HTMLDivElement>("#user-button")!;

  clerk.mountUserButton(userButtonComponent);

  // Render user info
  const userInfo = document.querySelector<HTMLDivElement>("#user-info")!;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `ID: ${user.id}`;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `First name: ${user.firstName}`;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `Last name: ${user.lastName}`;
  userInfo.appendChild(
    document.createElement("li")
  ).textContent = `Username: ${user.username}`;

  // error: "first_name is not a valid parameter for this request."
  console.log(user.update({ firstName: "New" }));
}

// if (!clerk.user) {
//   console.log("No user");
// } else {
//   console.log(clerk.user?.update({}))
// }
