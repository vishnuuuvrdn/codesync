FROM node:20-alpine

# Install docker CLI so we can interact with the host's docker socket
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
