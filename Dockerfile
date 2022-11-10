FROM node:16 AS ui-build
WORKDIR /usr/src
COPY yelp-business/ ./yelp-business/
RUN cd yelp-business && npm install @angular/cli && npm install && npm run build

FROM node:16 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/yelp-business/dist ./yelp-business/dist
COPY package*.json ./
RUN npm install
COPY index.js .

EXPOSE 5000

CMD ["node", "index.js"]
