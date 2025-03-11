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

# Copy the dependencies from the build stage
COPY --from=build /app /app

# Expose the necessary port (if applicable)
EXPOSE 3000

# Command to run your application
CMD ["node", "index.js"]
