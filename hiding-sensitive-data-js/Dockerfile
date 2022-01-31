FROM node:12-alpine
ENV NODE_ENV=production
WORKDIR /app
# copy code over from obfuscated folder
COPY /obfuscated ./src
COPY package*.json ./
RUN npm ci --production
CMD [ "npm", "run", "start:prod" ]