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

  // --------------- TEST ---------------
  // Check for an active organization
  if (clerk.organization) {
    // Render list of organization memberships
    async function renderMemberships(organization, isAdmin) {
      try {
        const memberships = await organization.getMemberships();
        console.log(`getMemberships:`, memberships);

        memberships.map((membership) => {
          const membershipTable = document.getElementById("memberships_table");
          const row = membershipTable.insertRow();
          row.insertCell().textContent = membership.publicUserData.userId;
          row.insertCell().textContent = membership.publicUserData.identifier;
          row.insertCell().textContent = membership.role;

          // Add administrative actions:
          // Update a member's role and remove a member.
          if (isAdmin) {
            // Show update and remove buttons
            document
              .getElementById("update-role-head")
              .removeAttribute("hidden");
            document
              .getElementById("remove-member-head")
              .removeAttribute("hidden");

            // Get the user ID of the member
            const userId = membership.publicUserData.userId;

            // Update a member's role
            const updateBtn = document.createElement("button");
            updateBtn.textContent = "Change role";
            updateBtn.addEventListener("click", async function (e) {
              e.preventDefault();
              const role =
                membership.role === "org:admin" ? "org:member" : "org:admin";
              await organization
                .updateMember({ userId, role })
                .then((res) => {
                  document.getElementById("response").innerHTML =
                    JSON.stringify(res);
                })
                .catch((error) => {
                  document
                    .getElementById("error-container")
                    .removeAttribute("hidden");
                  document.getElementById("error-message").innerHTML =
                    error.errors[0].longMessage;
                  console.log("An error occurred:", error.errors);
                });
            });
            row.insertCell().appendChild(updateBtn);

            // Remove a member
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.addEventListener("click", async function (e) {
              e.preventDefault();
              await organization
                .removeMember(userId)
                .then((res) => {
                  document.getElementById("response").innerHTML =
                    JSON.stringify(res);
                })
                .catch((error) => {
                  document
                    .getElementById("error-container")
                    .removeAttribute("hidden");
                  document.getElementById("error-message").innerHTML =
                    error.errors[0].longMessage;
                  console.log("An error occurred:", error.errors);
                });
            });
            row.insertCell().appendChild(removeBtn);
          }
        });
      } catch (error) {
        document.getElementById("error-container").removeAttribute("hidden");
        document.getElementById("error-message").innerHTML =
          error.errors[0].longMessage;
        console.log("An error occurred:", error.errors);
      }
    }

    // Render list of organization membership requests
    async function renderMembershipRequests(organization, isAdmin) {
      try {
        const { data } = await organization.getMembershipRequests();
        const membershipRequests = data;
        console.log(`getMembershipRequests:`, membershipRequests);

        membershipRequests.map((membershipRequest) => {
          const requestsTable = document.getElementById("requests_table");
          const row = requestsTable.insertRow();
          row.insertCell().textContent =
            membershipRequest.publicUserData.userId;
          row.insertCell().textContent =
            membershipRequest.publicUserData.identifier;
          row.insertCell().textContent = membershipRequest.status;

          // Add administrative actions:
          // Add member (removes request)
          if (isAdmin) {
            // Show add member button
            document
              .getElementById("add-member-head")
              .removeAttribute("hidden");

            // Get the user ID of the member
            const userId = membershipRequest.publicUserData.userId;

            // Add member to organization
            const addBtn = document.createElement("button");
            addBtn.textContent = "Add member";
            addBtn.addEventListener("click", async function (e) {
              e.preventDefault();
              const role = "org:member";
              await organization
                .addMember({ userId, role })
                .then((res) => {
                  document.getElementById("response").innerHTML =
                    JSON.stringify(res);
                })
                .catch((error) => {
                  document
                    .getElementById("error-container")
                    .removeAttribute("hidden");
                  document.getElementById("error-message").innerHTML =
                    error.errors[0].longMessage;
                  console.log("An error occurred:", error.errors);
                });
            });
            row.insertCell().appendChild(addBtn);
          }
        });
      } catch (error) {
        document.getElementById("error-container").removeAttribute("hidden");
        document.getElementById("error-message").innerHTML =
          error.errors[0].longMessage;
        console.log("An error occurred:", error.errors);
      }
    }

    /**
     * Checks if a user is an admin of the
     * currently active organization and
     * renders the organization's memberships
     * and membership requests.
     */
    async function checkAdminAndRenderMemberships() {
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

      console.log(`Organization:`, currentOrganization);

      renderMemberships(currentOrganization, isAdmin);
      renderMembershipRequests(currentOrganization, isAdmin);
    }

    checkAdminAndRenderMemberships();
  } else {
    // If there is no active organization,
    // mount Clerk's <OrganizationSwitcher />
    // to allow the user to set an organization as active
    document.getElementById("app").innerHTML = `
    <h2>Select an organization to set it as active</h2>
    <div id="org-switcher"></div>
  `;

    const orgSwitcherDiv = document.getElementById("org-switcher");

    clerk.mountOrganizationSwitcher(orgSwitcherDiv);
  }

  // Mount user button component
  const userbuttonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userbuttonDiv);

  // // Mount user profile component
  // const userProfileDiv = document.getElementById("user-profile");
  // clerk.mountUserProfile(userProfileDiv);

  // // Render user info
  // const userInfo = document.getElementById("user-info");
  // userInfo.appendChild(
  //   document.createElement("li")
  // ).textContent = `ID: ${clerk.user.id}`;
  // userInfo.appendChild(
  //   document.createElement("li")
  // ).textContent = `First name: ${clerk.user.firstName}`;
  // userInfo.appendChild(
  //   document.createElement("li")
  // ).textContent = `Last name: ${clerk.user.lastName}`;
  // userInfo.appendChild(
  //   document.createElement("li")
  // ).textContent = `Username: ${clerk.user.username}`;

  // // Mount create organization component
  // const createOrgDiv = document.getElementById("create-org");
  // clerk.mountCreateOrganization(createOrgDiv);

  // Mount organization switcher component
  const orgSwitcherDiv = document.getElementById("organization-switcher");
  clerk.mountOrganizationSwitcher(orgSwitcherDiv);

  // // Render list of organization memberships
  // const data = await clerk.user.getOrganizationMemberships();
  // console.log(`Organization Memberships:`, data);

  // async function renderMemberships(organization, isAdmin) {
  //   const list = document.getElementById("memberships_list");
  //   try {
  //     const memberships = await organization.getMemberships();
  //     console.log(`getMemberships:`, memberships);

  //     memberships.map((membership) => {
  //       const li = document.createElement("li");
  //       li.textContent = `ID: ${membership.id} Identifier: ${membership.publicUserData.identifier} UserId: ${membership.publicUserData.userId} Role: ${membership.role} Permissions: ${membership.permissions}`;

  //       // Add administrative actions; update role and remove member.
  //       if (isAdmin) {
  //         const updateBtn = document.createElement("button");
  //         updateBtn.textContent = "Change role";
  //         updateBtn.addEventListener("click", async function (e) {
  //           e.preventDefault();
  //           const role = membership.role === "admin" ? "org:member" : "admin";
  //           await membership.update({ role });
  //         });
  //         li.appendChild(updateBtn);

  //         const removeBtn = document.createElement("button");
  //         removeBtn.textContent = "Remove";
  //         removeBtn.addEventListener("click", async function (e) {
  //           e.preventDefault();
  //           await currentOrganization.removeMember(membership.userId);
  //         });
  //         li.appendChild(removeBtn);
  //       }

  //       // Add the entry to the list
  //       list.appendChild(li);
  //     });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // // Render list of organization invitations
  // async function renderInvitations(organization, isAdmin) {
  //   const list = document.getElementById("invitations_list");
  //   try {
  //     const { totalCount, data } = await organization.getInvitations();

  //     const invitations = data;

  //     if (invitations.length === 0) {
  //       list.textContent = "No invitations";
  //     }

  //     invitations.map((invitation) => {
  //       const li = document.createElement("li");
  //       li.textContent = `${invitation.emailAddress} - ${invitation.role}`;

  //       // Add administrative actions; revoke invitation
  //       if (isAdmin) {
  //         const revokeBtn = document.createElement("button");
  //         revokeBtn.textContent = "Revoke";
  //         revokeBtn.addEventListener("click", async function (e) {
  //           e.preventDefault();
  //           await invitation.revoke();
  //         });
  //         li.appendChild(revokeBtn);
  //       }
  //       // Add the entry to the list
  //       list.appendChild(li);
  //     });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // // Gets the current org, checks if the current user is an admin, renders memberships and invitations, and sets up the new invitation form.
  // async function init() {
  //   // This is the current organization ID.
  //   const organizationId = clerk.organization.id;

  //   const organizationMemberships =
  //     await clerk.user.getOrganizationMemberships();

  //   const currentMembership = organizationMemberships.find(
  //     (membership) => membership.organization.id === organizationId
  //   );
  //   const currentOrganization = currentMembership.organization;

  //   if (!currentOrganization) {
  //     return;
  //   }
  //   const isAdmin = currentMembership.role === "org:admin";

  //   renderMemberships(currentOrganization, isAdmin);
  //   renderInvitations(currentOrganization, isAdmin);

  //   if (isAdmin) {
  //     const form = document.getElementById("new_invitation");
  //     form.addEventListener("submit", async function (e) {
  //       e.preventDefault();
  //       const inputEl = document.getElementById("email_address");
  //       if (!inputEl) {
  //         return;
  //       }

  //       try {
  //         console.log(inputEl.value);
  //         await currentOrganization.inviteMember({
  //           emailAddress: inputEl.value,
  //           role: "org:member",
  //         });
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     });
  //   }
  // }

  // init();
} else {
  // Mount sign in component
  document.getElementById("app").innerHTML = `
    <div id="sign-in"></div>
  `;

  const signInDiv = document.getElementById("sign-in");

  clerk.mountSignIn(signInDiv);
}
