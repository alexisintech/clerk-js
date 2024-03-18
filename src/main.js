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

  // Mount user button component
  const userbuttonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userbuttonDiv);

  // Mount user profile component
  const userProfileDiv = document.getElementById("user-profile");
  clerk.mountUserProfile(userProfileDiv);

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

  // Mount create organization component
  const createOrgDiv = document.getElementById("create-org");
  clerk.mountCreateOrganization(createOrgDiv);

  // Mount organization switcher component
  const orgSwitcherDiv = document.getElementById("organization-switcher");
  clerk.mountOrganizationSwitcher(orgSwitcherDiv);

  // Render list of organization memberships
  const data = await clerk.user.getOrganizationMemberships();
  console.log(`Organization Memberships:`, data);

  async function renderMemberships(organization, isAdmin) {
    const list = document.getElementById("memberships_list");
    try {
      const memberships = await organization.getMemberships();
      console.log(`getMemberships:`, memberships);

      memberships.map((membership) => {
        const li = document.createElement("li");
        li.textContent = `ID: ${membership.id} Identifier: ${membership.publicUserData.identifier} UserId: ${membership.publicUserData.userId} Role: ${membership.role} Permissions: ${membership.permissions}`;

        // Add administrative actions; update role and remove member.
        if (isAdmin) {
          const updateBtn = document.createElement("button");
          updateBtn.textContent = "Change role";
          updateBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            const role = membership.role === "admin" ? "org:member" : "admin";
            await membership.update({ role });
          });
          li.appendChild(updateBtn);

          const removeBtn = document.createElement("button");
          removeBtn.textContent = "Remove";
          removeBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            await currentOrganization.removeMember(membership.userId);
          });
          li.appendChild(removeBtn);
        }

        // Add the entry to the list
        list.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Render list of organization invitations
  async function renderInvitations(organization, isAdmin) {
    const list = document.getElementById("invitations_list");
    try {
      const { totalCount, data } = await organization.getInvitations();

      const invitations = data;

      if (invitations.length === 0) {
        list.textContent = "No invitations";
      }

      invitations.map((invitation) => {
        const li = document.createElement("li");
        li.textContent = `${invitation.emailAddress} - ${invitation.role}`;

        // Add administrative actions; revoke invitation
        if (isAdmin) {
          const revokeBtn = document.createElement("button");
          revokeBtn.textContent = "Revoke";
          revokeBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            await invitation.revoke();
          });
          li.appendChild(revokeBtn);
        }
        // Add the entry to the list
        list.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Gets the current org, checks if the current user is an admin, renders memberships and invitations, and sets up the new invitation form.
  async function init() {
    // This is the current organization ID.
    const organizationId = clerk.organization.id;

    const organizationMemberships =
      await clerk.user.getOrganizationMemberships();

    const currentMembership = organizationMemberships.find(
      (membership) => membership.organization.id === organizationId
    );
    const currentOrganization = currentMembership.organization;

    if (!currentOrganization) {
      return;
    }
    const isAdmin = currentMembership.role === "org:admin";

    renderMemberships(currentOrganization, isAdmin);
    renderInvitations(currentOrganization, isAdmin);

    if (isAdmin) {
      const form = document.getElementById("new_invitation");
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const inputEl = document.getElementById("email_address");
        if (!inputEl) {
          return;
        }

        try {
          console.log(inputEl.value);
          await currentOrganization.inviteMember({
            emailAddress: inputEl.value,
            role: "org:member",
          });
        } catch (err) {
          console.error(err);
        }
      });
    }
  }

  init();
} else {
  // Mount sign in component
  document.getElementById("app").innerHTML = `
    <div id="sign-in"></div>
  `;

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
