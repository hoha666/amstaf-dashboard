# ----------- Build stage -----------
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Install deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Run lint (and tests if you add them)
RUN npm run lint

# Build Next.js -> ./out
RUN npm run build

# ----------- Run stage -----------
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy exported static site
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
