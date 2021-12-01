FROM node:12-alpine
ENV NODE_ENV=production
WORKDIR /app
# copy obfuscated code into src folder
COPY /dist ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]