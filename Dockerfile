FROM ubuntu:18.04
WORKDIR /ufc-app
COPY . ./ 
EXPOSE 3000
RUN apt update && apt upgrade -y
RUN . ./install_mongo.sh
RUN apt -y install npm
RUN npm install
CMD ["npm", "run", "start"] 

