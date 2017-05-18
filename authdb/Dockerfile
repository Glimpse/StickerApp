FROM mysql:8.0.1

# No need for a password, since this DB won't be exposed publicly
ENV MYSQL_ALLOW_EMPTY_PASSWORD 1

# .sql files in /docker-entrypoint-initdb.d are run when the
# container first starts. We use this to create our initial 
# StickerAuthDB database.
ADD schema.sql /docker-entrypoint-initdb.d

# Expose the port MySQL listens on
EXPOSE 3306
