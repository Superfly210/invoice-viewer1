# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy the build output from the 'build' stage
COPY --from=build /app/dist/. /usr/share/nginx/html

# Create custom nginx configuration with security headers and cache control
RUN echo 'server { \n\
    listen 80; \n\
    server_name _; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    \n\
    # SECURITY: Add security headers to all responses \n\
    add_header X-Frame-Options "DENY" always; \n\
    add_header X-Content-Type-Options "nosniff" always; \n\
    add_header X-XSS-Protection "1; mode=block" always; \n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \n\
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always; \n\
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always; \n\
    \n\
    # Main location block \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
    \n\
    # Dont cache index.html - always fetch fresh \n\
    location = /index.html { \n\
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \n\
        add_header Pragma "no-cache" always; \n\
        add_header Expires "0" always; \n\
        # Re-add security headers for this location \n\
        add_header X-Frame-Options "DENY" always; \n\
        add_header X-Content-Type-Options "nosniff" always; \n\
        add_header X-XSS-Protection "1; mode=block" always; \n\
    } \n\
    \n\
    # Cache hashed assets aggressively \n\
    location ~* ^/assets/.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \n\
        expires 1y; \n\
        add_header Cache-Control "public, immutable" always; \n\
        access_log off; \n\
    } \n\
    \n\
    # Cache other static assets for shorter period \n\
    location ~* \\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \n\
        expires 7d; \n\
        add_header Cache-Control "public" always; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Set the correct ownership and permissions for the Nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

# SECURITY: Run as non-root user
USER nginx

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]