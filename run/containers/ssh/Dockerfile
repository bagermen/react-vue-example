FROM rastasheep/ubuntu-sshd
LABEL description="SSH container"

RUN apt-get update && \
    apt-get install -y sshpass \
    && apt-get clean
