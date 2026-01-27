# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/docker

# Copy package.json and install dependencies
COPY package.json /usr/src/docker/
# CMD ["ls", "."]
RUN npm install

# Copy the rest of the project
# COPY . .

# Expose port
# EXPOSE 8080
# Keep container alive (dev mode)
# CMD ["tail", "-f", "/dev/null"]
