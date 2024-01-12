import './style.css'

// TDOD: Alexis -- this line changed from the docs
// It now needs the {} around the import
import { Clerk } from '@clerk/clerk-js';

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!pubKey) {
  throw new Error("New add your VITE_CLERK_PUBLISHABLE_KEY to .env")
}

const clerkPublishableKey = pubKey
const clerk = new Clerk(clerkPublishableKey);
await clerk.load({
  standardBrowser: true
});

window.Clerk = clerk

console.log('Clerk', clerk.version)

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <p class="">
      Clerk JS
    </p>
  </div>
`

