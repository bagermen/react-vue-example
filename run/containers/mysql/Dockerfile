FROM mysql:5.5
COPY ./conf/reset.sql /var/lib
COPY ./conf/reset.sh /var/lib
COPY ./conf/my.cnf /etc/mysql/mysql.conf.d
VOLUME ["/var/lib/mysql"]
