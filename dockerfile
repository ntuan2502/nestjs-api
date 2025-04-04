# Sử dụng image Node.js làm base (Bun sẽ được cài thêm)
FROM node:20-slim

# Cài đặt Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép file package.json và bun.lockb (nếu có)
COPY package*.json ./
COPY bun.lockb ./

# Cài đặt dependencies bằng Bun
RUN bun install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng NestJS
RUN bun run build

# Mở cổng (mặc định NestJS dùng 3000)
EXPOSE 3000

# Chạy ứng dụng bằng Bun
CMD ["bun", "start"]