
# --- 1: base ---
FROM node:22-bookworm AS base

RUN apt-get update && apt-get install -y \
    poppler-utils \
    gnupg \
    unixodbc \
    unixodbc-dev \
    odbcinst \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


# --- 2: IBM i base (real database) ---
FROM base AS ibmi-base

# IBM i Access ODBC Driver
COPY drivers/ibm-iaccess-1.1.0.28-1.0.amd64.deb /tmp/ibm-driver.deb

RUN dpkg -i /tmp/ibm-driver.deb || true

RUN apt-get update \
    && apt-get install -f -y \
    && rm -f /tmp/ibm-driver.deb \
    && rm -rf /var/lib/apt/lists/*

# IBM i ODBC configuration
COPY containers/api/odbcinst.ini /etc/odbcinst.ini
COPY containers/api/odbc.ini /etc/odbc.ini


# --- 3: development (real IBM i) ---
FROM ibmi-base AS development

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN odbcinst -j

CMD ["npm", "run", "dev:debug"]


# --- 4: test (Db2 LUW) ---
FROM base AS test

# IBM Db2 ODBC and CLI Driver
COPY drivers/db2-client/clidriver /opt/ibm/clidriver
COPY containers/api/db2dsdriver.cfg /opt/ibm/clidriver/cfg/db2dsdriver.cfg

ENV LD_LIBRARY_PATH=/opt/ibm/clidriver/lib

# Test ODBC configuration
COPY containers/api/odbcinst.test.ini /etc/odbcinst.ini
COPY containers/api/odbc.test.ini /etc/odbc.ini

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN odbcinst -j

CMD ["npm", "run", "dev:debug"]


# --- 5: builder ---
FROM base AS builder

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build


# --- 6: production ---
FROM ibmi-base AS production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN odbcinst -j

CMD ["node", "dist/server.js"]

# --- 7: production-test (portfolio) ---
FROM base AS production-test

# IBM Db2 ODBC and CLI Driver
COPY drivers/db2-client/clidriver /opt/ibm/clidriver
COPY containers/api/db2dsdriver.cfg /opt/ibm/clidriver/cfg/db2dsdriver.cfg

ENV LD_LIBRARY_PATH=/opt/ibm/clidriver/lib

# Test database ODBC configuration
COPY containers/api/odbcinst.test.ini /etc/odbcinst.ini
COPY containers/api/odbc.test.ini /etc/odbc.ini

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN odbcinst -j

CMD ["node", "dist/server.js"]
