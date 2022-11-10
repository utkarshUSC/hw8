FROM node:10 AS ui-build
WORKDIR /usr/src/app
COPY yelp-business/ ./yelp-business/
RUN cd yelp-business && npm install @angular/cli && npm install && npm run build

FROM node:10 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/yelp-business/dist ./yelp-business/dist
COPY package*.json ./
RUN npm install
COPY index.js .

EXPOSE 80

CMD ["node", "index.js"]
