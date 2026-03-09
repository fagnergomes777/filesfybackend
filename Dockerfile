FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Executa as migrations SQL, depois o migrate.js, depois inicia o servidor
CMD node run-migrations.js && node migrate.js && npm run start