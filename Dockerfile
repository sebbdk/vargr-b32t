FROM node:lts-alpine3.9
ENV NODE_ENV=production

RUN apk add --no-cache curl
RUN apk add --no-cache samba

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