# build frontend
FROM node:10-alpine as frontend

WORKDIR /web
COPY . .
RUN yarn config set registry https://registry.npmmirror.com -g && \
    yarn config set sass_binary_site "https://npmmirror.com/mirrors/node-sass/" -g  && \
    yarn && \
    yarn build

FROM library/nginx
USER root

# copy static files
COPY --from=frontend /web/build/ /usr/share/nginx/html/

# HEALTHCHECK
HEALTHCHECK --interval=5s --timeout=3s  --retries=3  CMD service nginx status | grep running || exit 1