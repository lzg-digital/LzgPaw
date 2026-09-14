/**
 * Bootstraps (or re-authorizes) an admin account from environment
 * variables. This is the ONLY supported way to create the first LzgPaw
 * admin — there is no self-service admin signup page, and no password is
 * ever hardcoded anywhere in this codebase.
 *
 * Usage:
 *   1. In `.env.local`, set:
 *        ADMIN_BOOTSTRAP_EMAIL=you@example.com
 *        ADMIN_BOOTSTRAP_PASSWORD=<a strong, unique password — 12+ chars>
 *        ADMIN_BOOTSTRAP_NAME=Your Name        (optional)
 *   2. Run:  npm run create-admin
 *   3. Sign in at /admin/login with that email/password.
 *   4. IMPORTANT: remove the ADMIN_BOOTSTRAP_* lines from `.env.local`
 *      afterwards. They're only read by this script, never by the running
 *      app — leaving them in place is unnecessary exposure, not a feature.
 *
 * This uses the Supabase service-role key (server-only, never shipped to
 * the browser) to call the Auth Admin API directly — it does not go
 * through any HTTP route, so there is no bootstrap endpoint exposed on the
 * live site for an attacker to find.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { createAdminClient } from '../lib/supabase/admin';

const MIN_PASSWORD_LENGTH = 12;

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || 'Store Owner';

  if (!email || !password) {
    console.error(
      '\n✖ Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD in .env.local, then run this again.\n'
    );
    process.exit(1);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`\n✖ ADMIN_BOOTSTRAP_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.\n`);
    process.exit(1);
  }

  const supabase = createAdminClient();

  // Idempotent: re-running this after the account already exists just
  // (re-)authorizes it in admin_users rather than erroring, so it also
  // doubles as a "make this existing Supabase Auth user an admin" tool.
  //
  // (Typed as `string | undefined` with an explicit guard below, rather
  // than relying on TypeScript inferring definite assignment through the
  // `process.exit(1)` calls in each branch — correct either way, but this
  // doesn't depend on control-flow analysis picking up on `exit`'s `never`
  // return type.)
  let userId: string | undefined;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (created?.user) {
    userId = created.user.id;
    console.log(`Created a new Supabase Auth user for ${email}.`);
  } else if (createError?.message?.toLowerCase().includes('already')) {
    // Note: listUsers() is paginated (50 by default) — for a store with a
    // very large existing Auth user base, pass `page`/`perPage` to search
    // further, or look the user up by id directly if you already know it.
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email);
    if (listError || !existing) {
      console.error(`\n✖ ${email} already exists in Supabase Auth but could not be looked up:`, listError?.message);
      process.exit(1);
    }
    userId = existing?.id;
    console.log(`${email} already exists as a Supabase Auth user — reusing it.`);
  } else {
    console.error('\n✖ Failed to create the Auth user:', createError?.message);
    process.exit(1);
  }

  if (!userId) {
    console.error('\n✖ Could not determine a user id to authorize as admin.\n');
    process.exit(1);
    return;
  }

  const { error: adminError } = await supabase
    .from('admin_users')
    .upsert({ id: userId, email, name, role: 'owner', active: true }, { onConflict: 'id' });

  if (adminError) {
    console.error('\n✖ Failed to authorize this account as an admin:', adminError.message);
    process.exit(1);
  }

  console.log(`\n✅ ${email} can now sign in at /admin/login.`);
  console.log('   Remove ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD from .env.local now that setup is done.\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
