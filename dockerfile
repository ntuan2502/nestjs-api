# Use Node.js 20 slim image as base
FROM node:20-slim

# Install required dependencies including unzip
RUN apt-get update && \
    apt-get install -y curl unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Set environment variables
ENV PATH="/root/.bun/bin:${PATH}"

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or bun.lockb if you're using Bun lock files)
COPY package*.json ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the source code
COPY . .

# Expose the port and start the app (adjust according to your app's start command)
EXPOSE 3000
CMD ["bun", "start"]
