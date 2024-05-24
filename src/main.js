import './style.css';
import { Clerk } from '@clerk/clerk-js';

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error('Add your VITE_CLERK_PUBLISHABLE_KEY to .env file');
}

const clerk = new Clerk(pubKey);
await clerk.load();

if (clerk.user) {
  // Render list of organization invitations
  async function renderInvitations(organization, isAdmin) {
    const list = document.getElementById('invitations_list');
    try {
      const { data } = await organization.getInvitations();

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

  // Gets the current org, checks if the current user is an admin, renders invitations, and sets up the new invitation form.
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

    renderInvitations(currentOrganization, isAdmin);

    if (isAdmin) {
      const form = document.getElementById('new_invitation');
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const inputEl = document.getElementById('email_address');
        if (!inputEl) {
          return;
        }

        try {
          console.log(inputEl.value);
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
  // Mount sign in component
  document.getElementById('app').innerHTML = `
    <div id="sign-in"></div>
  `;

  const signInDiv = document.getElementById('sign-in');

  clerk.mountSignIn(signInDiv);
}
