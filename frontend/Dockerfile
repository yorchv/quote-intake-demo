FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install \
    && npm install --include=optional --os=linux --libc=musl \
      sharp \
      "lightningcss@$(node -p "require('./node_modules/lightningcss/package.json').version")" \
      "@tailwindcss/oxide@$(node -p "require('./node_modules/@tailwindcss/oxide/package.json').version")"
COPY . .
ARG NEXT_PUBLIC_PRODUCT_API_URL
ARG NEXT_PUBLIC_INKPASS_CLIENT_SLUG
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG PRODUCT_BUILD_ID
ARG PRODUCT_RELEASE_SHA
ARG PRODUCT_ENV
ENV NEXT_PUBLIC_PRODUCT_API_URL=$NEXT_PUBLIC_PRODUCT_API_URL
ENV NEXT_PUBLIC_INKPASS_CLIENT_SLUG=$NEXT_PUBLIC_INKPASS_CLIENT_SLUG
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=$NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST
ENV PRODUCT_BUILD_ID=$PRODUCT_BUILD_ID
ENV PRODUCT_RELEASE_SHA=$PRODUCT_RELEASE_SHA
ENV PRODUCT_ENV=$PRODUCT_ENV
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 3000
CMD ["/bin/sh", "-c", "sed -i "s/listen       80;/listen       ${PORT:-3000};/" /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
