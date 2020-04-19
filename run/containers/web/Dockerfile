FROM php:7.2-apache

ARG TIMEZONE
ARG DOCUMENTROOT
RUN echo "install software.."
RUN apt-get update && apt-get install -y \
        git \
        libpq-dev \
        zlib1g-dev \
        libmemcached-dev \
        memcached \
        curl \
        libssl-dev \
        libcurl4-openssl-dev \
        mysql-client \
        libxml2-dev \
        libzmq3-dev \
        sshpass \
    && apt-get clean

# Install Composer
RUN echo "install composer..."
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer --version

# Set timezone
RUN echo "change timezone..."
RUN ln -snf /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && echo ${TIMEZONE} > /etc/timezone
RUN printf '[PHP]\ndate.timezone = "%s"\n', ${TIMEZONE} > /usr/local/etc/php/conf.d/tzone.ini
RUN "date"

RUN echo "install php extensions..."
# Type docker-php-ext-install to see available extensions

# Install Memcached for php 7
RUN curl -L -o /tmp/memcached.tar.gz "https://github.com/php-memcached-dev/php-memcached/archive/php7.tar.gz" \
    && mkdir -p /usr/src/php/ext/memcached \
    && tar -C /usr/src/php/ext/memcached -zxvf /tmp/memcached.tar.gz --strip 1 \
    && docker-php-ext-configure memcached \
    && docker-php-ext-install memcached \
    && rm /tmp/memcached.tar.gz

RUN docker-php-ext-install mysqli
RUN docker-php-ext-install bcmath
RUN docker-php-ext-install curl
RUN docker-php-ext-install mbstring
RUN docker-php-ext-install pdo
RUN docker-php-ext-install pdo_mysql
RUN docker-php-ext-install zip
RUN docker-php-ext-install mbstring
RUN docker-php-ext-install xml
RUN pecl install zmq-beta && \
    docker-php-ext-enable zmq

# install xdebug
RUN echo "install xdebug..."
RUN pecl install xdebug-2.6.0
RUN docker-php-ext-enable xdebug
RUN echo "xdebug.remote_port=9001" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# add default php config file
RUN echo "set up server configuration..."
COPY conf/php.ini /usr/local/etc/php

RUN update-rc.d apache2 disable
RUN a2dissite 000-default.conf
COPY conf/apache-config.conf /etc/apache2/sites-available/001-default.conf
RUN a2ensite 001-default.conf
RUN a2enmod rewrite
COPY conf/cltv-entrypoint.sh /usr/local/bin/cltv-entrypoint.sh

WORKDIR $DOCUMENTROOT
EXPOSE 9001

CMD ["cltv-entrypoint.sh"]
