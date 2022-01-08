apt -y install curl
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
apt-key list
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
apt update
apt -y install mongodb
apt -y install systemd && apt -y install gnupg2
/etc/init.d/mongodb start
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
/etc/init.d/mongodb status
