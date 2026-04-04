# capturewashington.org

# development
dev:
    bun run dev

build:
    bun run build

start:
    bun start

# testing
test:
    bun test

test-watch:
    bun run test:watch

# linting & formatting
lint:
    bun run lint

format:
    bun run format

format-check:
    bun run format:check

# database
db-up:
    docker compose up -d db

db-down:
    docker compose down

db-push:
    bunx prisma db push

db-generate:
    bunx prisma generate

db-studio:
    bunx prisma studio

db-migrate name:
    bunx prisma migrate dev --name {{name}}

db-reset:
    bunx prisma migrate reset

# docker
docker-build:
    docker build -t capturewashington .

docker-up:
    docker compose up -d

docker-down:
    docker compose down

# deploy
deploy:
    fly deploy

deploy-status:
    fly status
