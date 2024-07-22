import './style.css';
import { Clerk } from '@clerk/clerk-js';

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error('Add your VITE_CLERK_PUBLISHABLE_KEY to .env file');
}

const clerk = new Clerk(pubKey);
await clerk.load();

if (clerk.user) {
  console.log('User', clerk.user);

  // Mount user button component
  const userbuttonDiv = document.getElementById('user-button');
  clerk.mountUserButton(userbuttonDiv);

  // Mount user profile component
  const userProfileDiv = document.getElementById('user-profile');
  clerk.mountUserProfile(userProfileDiv);

  // Render user info
  const userInfo = document.getElementById('user-info');
  userInfo.appendChild(
    document.createElement('li')
  ).textContent = `ID: ${clerk.user.id}`;
  userInfo.appendChild(
    document.createElement('li')
  ).textContent = `First name: ${clerk.user.firstName}`;
  userInfo.appendChild(
    document.createElement('li')
  ).textContent = `Last name: ${clerk.user.lastName}`;
  userInfo.appendChild(
    document.createElement('li')
  ).textContent = `Username: ${clerk.user.username}`;

  // Mount create organization component
  const createOrgDiv = document.getElementById('create-org');
  clerk.mountCreateOrganization(createOrgDiv);

  // Mount organization switcher component
  const orgSwitcherDiv = document.getElementById('organization-switcher');
  clerk.mountOrganizationSwitcher(orgSwitcherDiv);

  if (clerk.organization) {
    // Edit organization
    const form = document.getElementById('update-organization');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const inputEl = document.getElementById('name');

      if (!inputEl) {
        // ... handle empty input
        return;
      }

      clerk.organization
        .update({ name: inputEl.value })
        .then((res) => console.log('Org updated:', res))
        .catch((error) => console.log('An error occurred:', error));
    });

    // Custom org switcher
    async function customOrgSwitcher() {
      const orgList = document.getElementById('custom-org-switcher');
      try {
        const { data } = await clerk.user.getOrganizationMemberships();
        const userMemberships = data;
        console.log(`userMemberships:`, data);

        userMemberships.map((membership) => {
          const li = document.createElement('li');
          li.textContent = membership.organization.name;
          const button = document.createElement('button');
          button.textContent = 'Select';
          button.addEventListener('click', async function () {
            await clerk.setActive({ organization: membership.organization.id });
          });
          li.appendChild(button);
          orgList.appendChild(li);
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Render list of organization memberships
    async function renderMemberships(organization, isAdmin) {
      try {
        const { data } = await organization.getMemberships();
        const memberships = data;
        console.log(`getMemberships:`, memberships);

        memberships.map((membership) => {
          const membershipTable = document.getElementById(
            'memberships-table-body'
          );
          const row = membershipTable.insertRow();
          row.insertCell().textContent = membership.publicUserData.userId;
          row.insertCell().textContent = membership.publicUserData.identifier;
          row.insertCell().textContent =
            membership.createdAt.toLocaleDateString();
          row.insertCell().textContent = membership.role;

          // Add administrative actions:
          // Add and remove a member, and update a member's role.
          if (isAdmin) {
            // Show update and remove member buttons
            document
              .getElementById('update-role-head')
              .removeAttribute('hidden');
            document
              .getElementById('remove-member-head')
              .removeAttribute('hidden');

            // Get the user ID of the member
            const userId = membership.publicUserData.userId;

            // Update a member's role
            const updateBtn = document.createElement('button');
            updateBtn.textContent = 'Change role';
            updateBtn.addEventListener('click', async function (e) {
              e.preventDefault();

              const role =
                membership.role === 'org:admin' ? 'org:member' : 'org:admin';

              await organization
                .updateMember({ userId, role })
                .then((res) => {
                  console.log(`updateMember response:`, res);
                })
                .catch((error) => {
                  console.log('An error occurred:', error);
                });
            });
            row.insertCell().appendChild(updateBtn);

            // Remove a member
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', async function (e) {
              e.preventDefault();

              await organization
                .removeMember(userId)
                .then((res) => console.log(`removeMember response:`, res))
                .catch((error) => console.log('An error occurred:', error));
            });
            row.insertCell().appendChild(removeBtn);
          }
        });
      } catch (error) {
        console.log('An error occurred:', error);
      }
    }

    // Render table of organization membership requests
    async function renderRequests() {
      const requestsTable = document.getElementById('requests-table-body');
      try {
        const { data } = await clerk.organization.getMembershipRequests();
        const requests = data;
        console.log(`Organization Memberships Requests:`, requests);

        requests.map((request) => {
          const row = requestsTable.insertRow();
          row.insertCell().textContent = request.publicUserData.identifier;
          row.insertCell().textContent = request.createdAt.toLocaleDateString();

          // Accept request
          const acceptBtn = document.createElement('button');
          acceptBtn.textContent = 'Accept';
          acceptBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            await request.accept();
          });
          row.insertCell().appendChild(acceptBtn);

          // Reject request
          const rejectBtn = document.createElement('button');
          rejectBtn.textContent = 'Reject';
          rejectBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            await request.reject();
          });
          row.insertCell().appendChild(rejectBtn);
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Render list of organization invitations
    async function renderInvitations(organization, isAdmin) {
      const list = document.getElementById('invitations_list');
      try {
        const { totalCount, data } = await organization.getInvitations();

        const invitations = data;

        if (invitations.length === 0) {
          list.textContent = 'No invitations';
        }

        invitations.map((invitation) => {
          const li = document.createElement('li');
          li.textContent = `${invitation.emailAddress} - ${invitation.role}`;

          // Add administrative actions; revoke invitation
          if (isAdmin) {
            const revokeBtn = document.createElement('button');
            revokeBtn.textContent = 'Revoke';
            revokeBtn.addEventListener('click', async function (e) {
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

    async function renderJoinedOrgs() {
      const { data } = await clerk.user.getOrganizationMemberships();

      const memberships = data;
      console.log(`userMemberships:`, memberships);

      memberships.map((membership) => {
        const membershipTable = document.getElementById(
          'joined-orgs-table-body'
        );
        const row = membershipTable.insertRow();
        row.insertCell().textContent = membership.publicUserData.identifier;
        row.insertCell().textContent = membership.organization.name;
        row.insertCell().textContent =
          membership.createdAt.toLocaleDateString();
        row.insertCell().textContent = membership.role;
      });
    }

    // Gets the current org, checks if the current user is an admin, renders memberships and invitations, and sets up the new invitation form.
    async function init() {
      // This is the current organization ID.
      const organizationId = clerk.organization.id;

      const { data } = await clerk.user.getOrganizationMemberships();
      const organizationMemberships = data;

      const currentMembership = organizationMemberships.find(
        (membership) => membership.organization.id === organizationId
      );
      const currentOrganization = currentMembership.organization;

      if (!currentOrganization) {
        return;
      }
      const isAdmin = currentMembership.role === 'org:admin';

      renderMemberships(currentOrganization, isAdmin);
      renderInvitations(currentOrganization, isAdmin);
      customOrgSwitcher();
      renderRequests();
      renderJoinedOrgs();

      if (isAdmin) {
        const form = document.getElementById('new_invitation');
        form.addEventListener('submit', async function (e) {
          e.preventDefault();
          const inputEl = document.getElementById('email_address');
          if (!inputEl) {
            return;
          }

          try {
            await currentOrganization.inviteMember({
              emailAddress: inputEl.value,
              role: 'org:member',
            });
          } catch (err) {
            console.error(err);
          }
        });
      }
    }

    init();
  } else {
    // If there is no active organization,
    // mount Clerk's <OrganizationSwitcher />
    // to allow the user to set an organization as active
    document.getElementById('app').innerHTML = `
      <h2>Select an organization to set it as active</h2>
      <div id="org-switcher"></div>
    `;

    const orgSwitcherDiv = document.getElementById('org-switcher');

    clerk.mountOrganizationSwitcher(orgSwitcherDiv);
  }
} else {
  // Mount sign in component
  document.getElementById('app').innerHTML = `
    <div id="sign-in"></div>
  `;

  const signInDiv = document.getElementById('sign-in');

  clerk.mountSignIn(signInDiv);
}
