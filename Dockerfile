	FROM ubuntu:16.04

MAINTAINER Anton Dmitriev

# Update packages
RUN apt-get -y update
#RUN apt-get install libpq-dev apt-utils build-essential -y


# Install postgresql
ENV PGVER 9.6

RUN apt-get install -y wget curl python

RUN echo deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main > /etc/apt/sources.list.d/pgdg.list

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
         apt-key add -

RUN apt-get -y update

RUN apt-get install -y postgresql-$PGVER

# Run the rest of the commands as the ``postgres`` user created by the ``postgres-$PGVER`` package when it was ``apt-get installed``
USER postgres

# Create a PostgreSQL role named ``docker`` with ``docker`` as the password and
# then create a database `docker` owned by the ``docker`` role.

ENV DB_USER docker
ENV DB_PASSWORD docker
ENV DB_NAME forum_db

RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER $DB_USER WITH SUPERUSER PASSWORD '$DB_PASSWORD';" &&\
    createdb -O $DB_USER $DB_NAME &&\
    /etc/init.d/postgresql stop

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible.
RUN echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/$PGVER/main/pg_hba.conf

# And add ``listen_addresses`` to ``/etc/postgresql/$PGVER/main/postgresql.conf``

RUN echo "synchronous_commit = off" >> /etc/postgresql/$PGVER/main/postgresql.conf
RUN echo "listen_addresses='*'" >> /etc/postgresql/$PGVER/main/postgresql.conf
RUN echo "synchronous_commit = off" >> /etc/postgresql/$PGVER/main/postgresql.conf
RUN echo "shared_buffers = 256MB" >> /etc/postgresql/$PGVER/main/postgresql.conf
RUN echo "autovacuum = off" >> /etc/postgresql/$PGVER/main/postgresql.conf
# Expose the PostgreSQL port
EXPOSE 5432

# Add VOLUMEs to allow backup of config, logs and databases
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

# Back to the root user
USER root

# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

#-----------------------------------------------------------------------------------------------------

ADD . /db_technopark
WORKDIR /db_technopark
RUN ./helpers/install.sh
RUN npm run webpack

# Set port
EXPOSE 5000

# Run PostgreSQL и server
ENTRYPOINT ["./helpers/start.sh"]