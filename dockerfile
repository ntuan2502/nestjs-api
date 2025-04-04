# Sử dụng Node.js 20 slim làm base image
FROM node:20-slim

# Cài đặt các dependencies cần thiết
RUN apt-get update && \
    apt-get install -y curl unzip && \
    rm -rf /var/lib/apt/lists/*

# Cài đặt Bun
RUN curl -fsSL https://bun.sh/install | bash

# Thêm Bun vào PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Copy lock file trước để tận dụng layer caching
COPY package.json ./

# Cài đặt dependencies (không bao gồm devDependencies)
RUN bun install

# Copy toàn bộ source code vào container
COPY . .

# Chạy Prisma generate để tạo Prisma Client
RUN bunx prisma generate

# Mở port 3000
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["bun", "start"]
