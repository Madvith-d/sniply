# sniply
![alt text](image.png)

So the tech stack used in this project is :
1. next js for the frontend
2. express + typescript with prisma orm in the backend
3. i have used bun in this project because its faster than npm also at the rntime it seems better

in local i was using postgres in docker, but in deployment, i used neon db


If trying local :

BACKEND;

.env file in apps/api

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sniply?schema=public&sslmode=disable"

ACCESS_TOKEN_SECRET=something
REFRESH_TOKEN_SECRET=something
```


```bash
docker compose up -d  #in root
```

```bash
cd apps/api
bun install

bunx --bun prisma migrate dev --name init

bun run index.ts
```
FRONTEND:
.env file in apps/web
```.env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_BRAND_NAME=something  # this name will be used in frontend default will be sniply 
```

```bash
cd apps/web
bun install
bun dev
```
for deployment i have used :
1. render web service for the backend
2. vercel for the frontend
3. Neon for the postgres db

The data model :
1. User -to store the account info and the owned links
2. Link -to store the original url , the alias , time duration , cap info and all and just click count
3. Click - this is only for analytics , i thought it would be better to seperate it from link table 

4. refresh Token - this is used for authentication and session management

If i had only 4 hours i would have built only these :
1. auth
2. basic short url generation with redirect
3. click count 

Assumptions :
1. unique clicks i assumed it to be like if the same user open the link more than once only his first click is considered unique

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
