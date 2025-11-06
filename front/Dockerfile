FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Final stage - minimal image with just the built files
FROM alpine:latest
WORKDIR /app

# Copy built files from build stage
COPY --from=build-stage /app/dist ./dist

# The built files will be in /app/dist
# You can copy them from the container or mount as volume to your nginx server
