FROM php:8-apache

RUN a2enmod rewrite
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

COPY ./apache/000-default.conf /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html

RUN chmod 777 /var/www/html/saves

EXPOSE 80
