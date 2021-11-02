# Build stage: obfuscate Javascript
FROM node:12-alpine as builder
WORKDIR /app
COPY . .
RUN npm install -g javascript-obfuscator
RUN javascript-obfuscator ./src --output ./dist --split-strings true --split-strings-chunk-length 3

# Final stage: install production dependencies
FROM node:12-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist ./src
COPY package*.json ./
COPY /src/public.pem ./src
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]