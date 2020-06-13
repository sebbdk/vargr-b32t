FROM arm32v7/node:14.4-slim
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y \ 
  samba \
  curl \
  python

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package.json .
COPY yarn.lock .

ENV NODE_ENV production
RUN yarn install --ignore-optional --prod
COPY --chown=node:node . .

COPY . .

EXPOSE 3000

CMD yarn start
