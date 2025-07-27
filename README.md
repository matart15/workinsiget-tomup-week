1. clone

```sh
TEMP_PROJECT_NAME="your_project_name_here"

git clone git@github.com:specdest-company/base.git "$TEMP_PROJECT_NAME"
cd "$TEMP_PROJECT_NAME"
cursor .
```

2. set env

```sh
cp .env.example .env
cp .env.example .env.localhost
cp .env.example .env.production
cp supabase/.env.example supabase/.env.production
```

3. start db

```sh
nps db.start
# nps db.stop
```

4. start frontend

```sh
pnpm i
nps start.dev
```
