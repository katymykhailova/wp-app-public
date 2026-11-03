
# --- 1: base ---
  FROM node:22-bookworm AS base

  RUN apt-get update && apt-get install -y \
      poppler-utils \
      gnupg \
      unixodbc \
      unixodbc-dev \
      odbcinst \
      && rm -rf /var/lib/apt/lists/*
  
  # IBM i Access ODBC Driver
  COPY drivers/ibm-iaccess-1.1.0.28-1.0.amd64.deb /tmp/ibm-driver.deb
  
  RUN dpkg -i /tmp/ibm-driver.deb || true
  
  RUN apt-get update \
      && apt-get install -f -y \
      && rm -f /tmp/ibm-driver.deb \
      && rm -rf /var/lib/apt/lists/*
  
  # IBM Db2 ODBC and CLI Driver
  COPY drivers/db2-client/clidriver /opt/ibm/clidriver
  COPY containers/api/db2dsdriver.cfg /opt/ibm/clidriver/cfg/db2dsdriver.cfg
  
  ENV LD_LIBRARY_PATH=/opt/ibm/clidriver/lib
  
  # ODBC configuration
  COPY containers/api/odbcinst.ini /etc/odbcinst.ini
  COPY containers/api/odbc.ini /etc/odbc.ini
  
  WORKDIR /app
  
  # --- 2: development ---
  FROM base AS development
  
  COPY package.json package-lock.json ./
  RUN npm ci
  
  COPY . .
  
  RUN odbcinst -j
  
  CMD ["npm", "run", "dev:debug"]
  
  # --- 3: builder ---
  FROM development AS builder
  
  RUN npm run build
  
  # --- 4: production ---
  FROM base AS production
  
  COPY package.json package-lock.json ./
  RUN npm ci --omit=dev
  
  COPY --from=builder /app/dist ./dist
  
  RUN odbcinst -j
  
  CMD ["node", "dist/server.js"]
  