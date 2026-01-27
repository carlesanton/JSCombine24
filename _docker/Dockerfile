# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/packages

# Copy package.json and install dependencies
COPY package.json /usr/src/packages/
# CMD ["ls", "."]
RUN npm install

# Copy tailwind and daisyu necessary files
COPY input.css /usr/src/packages/
COPY tailwind.config.js /usr/src/packages/
# Build Tailwind + DaisyUI
RUN npm run build:css
# CURL Tailwind
RUN apk --no-cache add curl
RUN curl -o /usr/src/packages/tailwind.min.js https://cdn.tailwindcss.com/3.4.17

# Inject local-libs flag
RUN echo "window.USE_LOCAL_LIBS = true;" > /usr/src/packages/use-local-libs.js

# Copy the rest of the project
# COPY . .

# Expose port
# EXPOSE 8080
# Keep container alive (dev mode)
# CMD ["tail", "-f", "/dev/null"]
