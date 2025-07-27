# edge function

- direct function

  1.  make sure to stage or clean git diffs
  2.  `pnpm supabase functions new newFunctionName`

- One Big Function

  1.  make sure to stage or clean git diffs
  2.  `deno run --allow-read --allow-write scripts/add-function.ts newFunctionName`

# DB

- `pnpm db:generate:local`
- `pnpm db:generate`
- `pnpm fn:deploy` : deploy edge function
- `pnpm db:migrate:local`
- `pnpm db:migrate:remote`
- `pnpm db:push:remote` : push to remote
- `pnpm db:login_with_old_token` : try login with old version. does not ask browser login
- `pnpm db:login` :
- `pnpm db:pull:local`
- `pnpm db:pull:remote`
- `pnpm db:dump` : dump remote data
- `pnpm db:generate && pnpm db:zod` : generate schema from remote
- `pnpm db:generate:local && pnpm db:zod` : generate schema from local
- `pnpm deploy` : push to remote

## Notes

- `pnpm start` command will create Docker volume, migrate DB, seed database.

# tmp

- when db changed `pnpx @snaplet/seed sync`.
