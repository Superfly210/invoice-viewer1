# Stage 1: Build the React application
# Use a specific Node.js version for reproducibility
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
# Use a lightweight Nginx image
FROM nginx:1.25-alpine

# Copy the build output from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# We will use the nginx.conf from our main project directory,
# so we don't need to copy a default one here.

# Expose port 80
EXPOSE 80

# The command to start Nginx will be handled by docker-compose
CMD ["nginx", "-g", "daemon off;"]