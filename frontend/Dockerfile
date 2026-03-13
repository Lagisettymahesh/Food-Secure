FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# For Vite, environment variables starting with VITE_ need to be present at build time
# For dev mode, we'll create a .env file
ARG VITE_API_URL=http://localhost:5002
ENV VITE_API_URL=$VITE_API_URL

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
