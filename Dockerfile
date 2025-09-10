# ----------- Build stage -----------
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time public env for Next.js client code
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# (Optional) comment this out until lint errors are fixed
# RUN npm run lint

# Build Next.js -> ./out (you already have output: "export")
RUN npm run build

# ----------- Run stage -----------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
