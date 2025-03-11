# Stage 1: Build stage
FROM node:18-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json to install dependencies first (faster rebuild)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Production stage
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app

EXPOSE 8080

# Set environment variable for the API port (for example, Cloud Run expects to listen on PORT)
ENV PORT=8080

# Command to run your application (assuming your main file is index.js)
CMD ["node", "index.js"]
