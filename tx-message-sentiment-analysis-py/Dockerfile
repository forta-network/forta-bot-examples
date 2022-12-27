# Build stage: compile Python dependencies
FROM python:3.9-slim as builder
COPY requirements.txt requirements.txt
RUN python3 -m pip install --user -r requirements.txt

# Final stage: copy over Python dependencies and install production Node dependencies
FROM node:19-slim
RUN apt-get update && apt-get install python3 -y
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local:$PATH
ENV NODE_ENV=production
WORKDIR /app
COPY ./src ./src
COPY package*.json ./
RUN npm ci --omit=dev
CMD [ "npm", "run", "start:prod" ]
